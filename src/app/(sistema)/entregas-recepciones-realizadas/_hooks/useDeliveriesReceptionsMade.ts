import { useCallback, useEffect, useRef, useState } from "react";
import sgerpCfeAPI from "@/utils/axios";
import { NotificationInfo } from "@/types/types/components/notifications";
import { NotificationTypes } from "@/types/enums/notifications";
import { isAxiosError } from "axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { HttpStatusCodes } from "@/types/enums/http";
import { notify } from "@/utils/notifications";
import { DeliveryReceptionMade } from "@/types/types/model/deliveries_receptions";
import { DeliveriesReceptionsMadeResponse } from "@/types/types/api/deliveries_receptions_made";
import { useSearchParams } from "next/navigation";
import { DeleteDeliveryReceptionMadeErrorCodes } from "@/types/enums/error_codes";

type DeliveriesReceptionsMadeListState = {
    loading: boolean;
    value: DeliveryReceptionMade[];
    error: null | string;
    stillDeliveriesReceptionsMadeToLoad: boolean;
};

const INITIAL_DELIVERIES_RECEPTIONS_MADE_LIST_STATE: DeliveriesReceptionsMadeListState =
    {
        loading: false,
        value: [],
        error: null,
        stillDeliveriesReceptionsMadeToLoad: true,
    };

export function useDeliveriesReceptionsMade() {
    const searchParams = useSearchParams();
    const [deliveriesReceptionsMadeList, setDeliveriesReceptionsMadeList] =
        useState<DeliveriesReceptionsMadeListState>(
            INITIAL_DELIVERIES_RECEPTIONS_MADE_LIST_STATE
        );
    const savedScrollRef = useRef<number>(0);
    const bottomOfDeliveriesReceptionsMadeListRef =
        useRef<HTMLDivElement | null>(null);

    const inFlightRef = useRef(false);

    const startDeliveriesReceptionsMadeLoading = useCallback(() => {
        setDeliveriesReceptionsMadeList((prev) => ({
            ...prev,
            loading: true,
            error: null,
        }));
    }, []);

    const finishDeliveriesReceptionsMadeLoading = useCallback(
        (
            deliveriesReceptionsMade: DeliveryReceptionMade[],
            stillDeliveriesReceptionsMadeToLoad: boolean
        ) => {
            setDeliveriesReceptionsMadeList((prev) => ({
                loading: false,
                value: [...prev.value, ...deliveriesReceptionsMade],
                error: null,
                stillDeliveriesReceptionsMadeToLoad,
            }));
        },
        []
    );

    const fireErrorLoadingDeliveriesReceptionsMade = useCallback(
        (message?: string) => {
            setDeliveriesReceptionsMadeList((prev) => ({
                ...prev,
                loading: false,
                error:
                    message ??
                    "Estamos teniendo problemas para cargar las Entregas-Recepciones realizadas, por favor intente más tarde",
                stillDeliveriesReceptionsMadeToLoad: false,
            }));
        },
        []
    );

    const loadDeliveriesReceptionsMade = useCallback(
        async (
            deliveriesReceptionsMadeBatchSize: number,
            totalDeliveriesReceptionsMadeToOmit: number,
            searchQuery: string
        ) => {
            if (inFlightRef.current) return;
            inFlightRef.current = true;
            savedScrollRef.current = window.scrollY;

            startDeliveriesReceptionsMadeLoading();
            try {
                const params: {
                    limit: number;
                    offset?: number;
                    query?: string;
                } = { limit: deliveriesReceptionsMadeBatchSize };
                if (totalDeliveriesReceptionsMadeToOmit > 0)
                    params.offset = totalDeliveriesReceptionsMadeToOmit;
                if (searchQuery) params.query = searchQuery;

                const { data: users } =
                    await sgerpCfeAPI.get<DeliveriesReceptionsMadeResponse>(
                        "/deliveries-receptions/made",
                        { params }
                    );

                const stillDeliveriesReceptionsMadeToLoad =
                    users.length >= deliveriesReceptionsMadeBatchSize;
                finishDeliveriesReceptionsMadeLoading(
                    users,
                    stillDeliveriesReceptionsMadeToLoad
                );
            } catch (error) {
                let message =
                    "Por el momento el sistema no se encuentra disponible, por favor intente más tarde";
                if (
                    isAxiosError(error) &&
                    isClientErrorHTTPCode(Number(error.response?.status)) &&
                    error.response?.status !== HttpStatusCodes.TOO_MANY_REQUESTS
                ) {
                    message =
                        "No se pudieron obtener las Entregas-Recepciones realizadas porque el trabajador no se pudo identificar";
                }
                fireErrorLoadingDeliveriesReceptionsMade(message);
            } finally {
                inFlightRef.current = false;
            }
        },
        [
            startDeliveriesReceptionsMadeLoading,
            finishDeliveriesReceptionsMadeLoading,
            fireErrorLoadingDeliveriesReceptionsMade,
        ]
    );

    useEffect(() => {
        const searchQuery = searchParams.get("busqueda") || "";
        if (searchQuery === undefined || searchQuery === null) return;

        setDeliveriesReceptionsMadeList(
            INITIAL_DELIVERIES_RECEPTIONS_MADE_LIST_STATE
        );
        loadDeliveriesReceptionsMade(12, 0, searchQuery);
    }, [loadDeliveriesReceptionsMade, searchParams]);

    useEffect(() => {
        const searchQuery = searchParams.get("busqueda") || "";
        if (deliveriesReceptionsMadeList.value.length === 0) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    !deliveriesReceptionsMadeList.loading &&
                    deliveriesReceptionsMadeList.stillDeliveriesReceptionsMadeToLoad
                ) {
                    loadDeliveriesReceptionsMade(
                        12,
                        deliveriesReceptionsMadeList.value.length,
                        searchQuery
                    );
                }
            },
            { rootMargin: "0px", threshold: 0.1 }
        );

        const target = bottomOfDeliveriesReceptionsMadeListRef.current;
        if (target) observer.observe(target);

        return () => observer.disconnect();
    }, [
        deliveriesReceptionsMadeList.value.length,
        loadDeliveriesReceptionsMade,
        searchParams,
        deliveriesReceptionsMadeList.loading,
        deliveriesReceptionsMadeList.stillDeliveriesReceptionsMadeToLoad,
    ]);

    useEffect(() => {
        if (savedScrollRef.current > 0) {
            window.scrollTo(0, savedScrollRef.current);
            savedScrollRef.current = 0;
        }
    }, [deliveriesReceptionsMadeList.value.length]);

    const deleteDeliveryReceptionMade = useCallback(async (id: number) => {
        try {
            await sgerpCfeAPI.delete(`/deliveries-receptions/made/${id}`);
            setDeliveriesReceptionsMadeList((prev) => ({
                ...prev,
                value: prev.value.filter((u) => u.id !== id),
            }));
            const notificationInfo: NotificationInfo = {
                title: "Entrega-Recepción eliminada correctamente",
                message:
                    "La Entrega-Recepción se eliminó correctamente del sistema y se le envió un correo a los involucrados notificándoles",
                type: NotificationTypes.SUCCESS,
            };
            notify(notificationInfo);
        } catch (error) {
            const notificationInfo: NotificationInfo = {
                title: "Servicio no disponible",
                message:
                    "Por el momento el sistema no se encuentra disponible, por favor intente más tarde",
                type: NotificationTypes.ERROR,
            };

            if (
                isAxiosError(error) &&
                isClientErrorHTTPCode(Number(error.response?.status)) &&
                error.response?.status !== HttpStatusCodes.TOO_MANY_REQUESTS
            ) {
                const errorCode = error.response?.data?.errorCode;
                if (
                    errorCode ===
                    DeleteDeliveryReceptionMadeErrorCodes.DELIVERY_RECEPTION_MADE_NOT_FOUND
                ) {
                    notificationInfo.title = "Entrega-Recepción no encontrada";
                    notificationInfo.message =
                        "No se pudo eliminar la Entrega-Recepción porque no se encontró en el sistema";
                }
            }
            notify(notificationInfo);
        }
    }, []);

    return {
        deliveriesReceptionsMadeList,
        bottomOfDeliveriesReceptionsMadeListRef,
        deleteDeliveryReceptionMade,
    };
}
