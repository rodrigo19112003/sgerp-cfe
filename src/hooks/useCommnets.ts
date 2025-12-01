import { HttpStatusCodes } from "@/types/enums/http";
import sgerpCfeAPI from "@/utils/axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Comment } from "@/types/types/model/deliveries_receptions";
import EvidenceCategories from "@/types/enums/evidence_categories";

type UseCommentsProps = {
    deliveryReceptionId: number;
    categoryName: EvidenceCategories;
};

type CommentsState = {
    loading: boolean;
    value: null | Comment[];
    error: null | string;
};

const INITIAL_COMMENTS_STATE: CommentsState = {
    loading: true,
    value: null,
    error: null,
};

export function useComments({
    deliveryReceptionId,
    categoryName,
}: UseCommentsProps) {
    const [comments, setComments] = useState(INITIAL_COMMENTS_STATE);
    const hasLoaded = useRef(false);

    const finishLoadingComments = useCallback((comments: Comment[]) => {
        setComments({
            loading: false,
            value: comments,
            error: null,
        });
    }, []);

    const fireErrorLoadingComments = useCallback((message: string) => {
        setComments({
            loading: false,
            value: null,
            error:
                message ??
                "Estamos teniendo problemas para cargar los comentarios, por favor inténtelo más tarde",
        });
    }, []);

    const loadComments = useCallback(async () => {
        try {
            const { data: comments } = await sgerpCfeAPI.get(
                `/deliveries-receptions/${deliveryReceptionId}/comments?categoryName=${categoryName}`
            );

            finishLoadingComments(comments);
        } catch (error) {
            let message =
                "Por el momento el sistema no se encuentra disponible, por favor intente más tarde";
            if (
                isAxiosError(error) &&
                isClientErrorHTTPCode(Number(error.response?.status)) &&
                error.response?.status !== HttpStatusCodes.TOO_MANY_REQUESTS
            ) {
                message =
                    "Hubo un error al cargar los comentarios, ya que no se pudo localizar en el servidor";
            }
            fireErrorLoadingComments(message);
        }
    }, [
        finishLoadingComments,
        fireErrorLoadingComments,
        deliveryReceptionId,
        categoryName,
    ]);

    useEffect(() => {
        if (hasLoaded.current) return;
        loadComments();
        hasLoaded.current = true;
    }, [loadComments]);

    return {
        comments,
    };
}
