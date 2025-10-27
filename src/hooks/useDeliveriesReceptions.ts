import { useCallback, useContext, useEffect, useRef, useState } from "react";
import sgerpCfeAPI from "@/utils/axios";
import { NotificationInfo } from "@/types/types/components/notifications";
import { NotificationTypes } from "@/types/enums/notifications";
import { isAxiosError } from "axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { HttpStatusCodes } from "@/types/enums/http";
import { notify } from "@/utils/notifications";
import { DeliveryReception } from "@/types/types/model/deliveries_receptions";
import { DeliveriesReceptionsResponse } from "@/types/types/api/deliveries_receptions";
import { useSearchParams } from "next/navigation";
import { DeleteDeliveryReceptionMadeErrorCodes } from "@/types/enums/error_codes";
import AuthContext from "@/contexts/auth/context";
import UserRoles from "@/types/enums/user_roles";
import DeliveryReceptionStatusCodes from "@/types/enums/delivery_reception_status_codes";

interface DeliveriesReceptionsProps {
    deliveriesReceptionsAreMade: boolean;
    deliveryReceptionStatus?: DeliveryReceptionStatusCodes;
}

type DeliveriesReceptionsListState = {
    loading: boolean;
    value: DeliveryReception[];
    error: null | string;
    stillDeliveriesReceptionsToLoad: boolean;
};

const INITIAL_DELIVERIES_RECEPTIONS_LIST_STATE: DeliveriesReceptionsListState =
    {
        loading: false,
        value: [],
        error: null,
        stillDeliveriesReceptionsToLoad: true,
    };

export function useDeliveriesReceptions({
    deliveriesReceptionsAreMade,
    deliveryReceptionStatus,
}: DeliveriesReceptionsProps) {
    const searchParams = useSearchParams();
    const [deliveriesReceptionsList, setDeliveriesReceptionsList] =
        useState<DeliveriesReceptionsListState>(
            INITIAL_DELIVERIES_RECEPTIONS_LIST_STATE
        );
    const savedScrollRef = useRef<number>(0);
    const bottomOfDeliveriesReceptionsListRef = useRef<HTMLDivElement | null>(
        null
    );
    const profile = useContext(AuthContext);
    const inFlightRef = useRef(false);

    const startDeliveriesReceptionsLoading = useCallback(() => {
        setDeliveriesReceptionsList((prev) => ({
            ...prev,
            loading: true,
            error: null,
        }));
    }, []);

    const finishDeliveriesReceptionsLoading = useCallback(
        (
            deliveriesReceptions: DeliveryReception[],
            stillDeliveriesReceptionsToLoad: boolean
        ) => {
            setDeliveriesReceptionsList((prev) => ({
                loading: false,
                value: [...prev.value, ...deliveriesReceptions],
                error: null,
                stillDeliveriesReceptionsToLoad,
            }));
        },
        []
    );

    const fireErrorLoadingDeliveriesReceptions = useCallback(
        (message?: string) => {
            setDeliveriesReceptionsList((prev) => ({
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

    const loadDeliveriesReceptions = useCallback(
        async (
            deliveriesReceptionsBatchSize: number,
            totalDeliveriesReceptionsToOmit: number,
            searchQuery: string
        ) => {
            if (inFlightRef.current) return;
            if (profile.roles.includes(UserRoles.GUEST)) return;
            inFlightRef.current = true;
            savedScrollRef.current = window.scrollY;

            startDeliveriesReceptionsLoading();
            try {
                const params: {
                    limit: number;
                    offset?: number;
                    query?: string;
                } = { limit: deliveriesReceptionsBatchSize };
                if (totalDeliveriesReceptionsToOmit > 0)
                    params.offset = totalDeliveriesReceptionsToOmit;
                if (searchQuery) params.query = searchQuery;

                let basePath: string = "";

                if (profile.roles.includes(UserRoles.WORKER)) {
                    basePath = deliveriesReceptionsAreMade
                        ? "/deliveries-receptions/made"
                        : "/deliveries-receptions/received";
                } else if (profile.roles.includes(UserRoles.ZONE_MANAGER)) {
                    switch (deliveryReceptionStatus) {
                        case DeliveryReceptionStatusCodes.PENDING:
                            basePath = "/deliveries-receptions/pending";
                            break;
                        case DeliveryReceptionStatusCodes.IN_PROCESS:
                            basePath = "/deliveries-receptions/in-process";
                            break;
                        default:
                            basePath = "/deliveries-receptions/released";
                            break;
                    }
                }

                const { data: deliveriesReceptions } =
                    await sgerpCfeAPI.get<DeliveriesReceptionsResponse>(
                        basePath,
                        { params }
                    );

                const stillDeliveriesReceptionsToLoad =
                    deliveriesReceptions.length >=
                    deliveriesReceptionsBatchSize;
                finishDeliveriesReceptionsLoading(
                    deliveriesReceptions,
                    stillDeliveriesReceptionsToLoad
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
                fireErrorLoadingDeliveriesReceptions(message);
            } finally {
                inFlightRef.current = false;
            }
        },
        [
            deliveriesReceptionsAreMade,
            profile,
            deliveryReceptionStatus,
            startDeliveriesReceptionsLoading,
            finishDeliveriesReceptionsLoading,
            fireErrorLoadingDeliveriesReceptions,
        ]
    );

    useEffect(() => {
        const searchQuery = searchParams.get("busqueda") || "";
        if (searchQuery === undefined || searchQuery === null) return;

        setDeliveriesReceptionsList(INITIAL_DELIVERIES_RECEPTIONS_LIST_STATE);
        loadDeliveriesReceptions(12, 0, searchQuery);
    }, [loadDeliveriesReceptions, searchParams]);

    useEffect(() => {
        const searchQuery = searchParams.get("busqueda") || "";
        if (deliveriesReceptionsList.value.length === 0) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    !deliveriesReceptionsList.loading &&
                    deliveriesReceptionsList.stillDeliveriesReceptionsToLoad
                ) {
                    loadDeliveriesReceptions(
                        12,
                        deliveriesReceptionsList.value.length,
                        searchQuery
                    );
                }
            },
            { rootMargin: "0px", threshold: 0.1 }
        );

        const target = bottomOfDeliveriesReceptionsListRef.current;
        if (target) observer.observe(target);

        return () => observer.disconnect();
    }, [
        deliveriesReceptionsList.value.length,
        loadDeliveriesReceptions,
        searchParams,
        deliveriesReceptionsList.loading,
        deliveriesReceptionsList.stillDeliveriesReceptionsToLoad,
    ]);

    useEffect(() => {
        if (savedScrollRef.current > 0) {
            window.scrollTo(0, savedScrollRef.current);
            savedScrollRef.current = 0;
        }
    }, [deliveriesReceptionsList.value.length]);

    const deleteDeliveryReceptionMade = useCallback(async (id: number) => {
        try {
            await sgerpCfeAPI.delete(`/deliveries-receptions/${id}`);
            setDeliveriesReceptionsList((prev) => ({
                ...prev,
                value: prev.value.filter((u) => u.deliveryReceptionId !== id),
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
        deliveriesReceptionsList,
        bottomOfDeliveriesReceptionsListRef,
        deleteDeliveryReceptionMade,
    };
}
