import { HttpStatusCodes } from "@/types/enums/http";
import sgerpCfeAPI from "@/utils/axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { DeliveryReceptionWithAllInformation } from "@/types/types/model/deliveries_receptions";
import { notify } from "@/utils/notifications";
import { NotificationTypes } from "@/types/enums/notifications";
import { NotificationInfo } from "@/types/types/components/notifications";
import { CreateOrUpdateDeliveryReceptionErrorCodes } from "@/types/enums/error_codes";
import EvidenceCategories from "@/types/enums/evidence_categories";

type UseDeliveryReceptionProps = {
    deliveryReceptionId: number;
};

type DeliveryReceptionState = {
    loading: boolean;
    value: null | DeliveryReceptionWithAllInformation;
    error: null | string;
};

const INITIAL_DELIVERY_RECEPTION_STATE: DeliveryReceptionState = {
    loading: true,
    value: null,
    error: null,
};

export function useDeliveryReception({
    deliveryReceptionId,
}: UseDeliveryReceptionProps) {
    const [deliveryReception, setDeliveryReception] = useState(
        INITIAL_DELIVERY_RECEPTION_STATE
    );
    const hasLoaded = useRef(false);

    const finishLoadingDeliveryReception = useCallback(
        (deliveryReception: DeliveryReceptionWithAllInformation) => {
            setDeliveryReception({
                loading: false,
                value: deliveryReception,
                error: null,
            });
        },
        []
    );

    const fireErrorLoadingDeliveryReception = useCallback((message: string) => {
        setDeliveryReception({
            loading: false,
            value: null,
            error:
                message ??
                "Estamos teniendo problemas para cargar la entrega-recepción, por favor inténtelo más tarde",
        });
    }, []);

    const loadDeliveryReception = useCallback(async () => {
        try {
            const { data: deliveryReception } = await sgerpCfeAPI.get(
                `/deliveries-receptions/${deliveryReceptionId}`
            );

            finishLoadingDeliveryReception(deliveryReception);
        } catch (error) {
            let message =
                "Por el momento el sistema no se encuentra disponible, por favor intente más tarde";
            if (
                isAxiosError(error) &&
                isClientErrorHTTPCode(Number(error.response?.status)) &&
                error.response?.status !== HttpStatusCodes.TOO_MANY_REQUESTS
            ) {
                message =
                    "Hubo un error al cargar la entrega-recepción, ya que no se pudo localizar en el servidor";
            }
            fireErrorLoadingDeliveryReception(message);
        }
    }, [
        finishLoadingDeliveryReception,
        fireErrorLoadingDeliveryReception,
        deliveryReceptionId,
    ]);

    useEffect(() => {
        if (hasLoaded.current) return;
        loadDeliveryReception();
        hasLoaded.current = true;
    }, [loadDeliveryReception]);

    const acceptDeliveryReception = useCallback(async () => {
        try {
            await sgerpCfeAPI.patch(
                `/deliveries-receptions/${deliveryReceptionId}/accept`
            );

            const notificationInfo: NotificationInfo = {
                title: "Entrega-Recepción aceptada",
                message:
                    "La entrega-recepción se aceptó correctamente en el sistema y se le envió un correo a todos los involucrados notificándoles",
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
                if (
                    error.response?.data?.errorCode ===
                    CreateOrUpdateDeliveryReceptionErrorCodes.DELIVERY_RECEPTION_NOT_FOUND
                ) {
                    notificationInfo.title = "Entrega-recepción no encontrada";
                    notificationInfo.message =
                        "No se pudo encontrar la entrega-recepción que se quiere aceptar, posiblemente fue eliminada por su creador.";
                    notificationInfo.type = NotificationTypes.ERROR;
                }
            }

            notify(notificationInfo);
        }
    }, [deliveryReceptionId]);

    const sendComment = useCallback(
        async (text: string, categoryName: EvidenceCategories) => {
            try {
                const requestBody = { text, categoryName };
                await sgerpCfeAPI.post(
                    `/deliveries-receptions/${deliveryReceptionId}/comments`,
                    requestBody
                );

                const notificationInfo: NotificationInfo = {
                    title: "Comentario agregado",
                    message: `El comentario se agregó correctamente a la entrega-recepción en la sección ${categoryName}`,
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
                    if (
                        error.response?.data?.errorCode ===
                        CreateOrUpdateDeliveryReceptionErrorCodes.DELIVERY_RECEPTION_NOT_FOUND
                    ) {
                        notificationInfo.title =
                            "Entrega-recepción no encontrada";
                        notificationInfo.message =
                            "No se pudo encontrar la entrega-recepción a la que se quiere agregar el comentario, posiblemente fue eliminada por su creador.";
                        notificationInfo.type = NotificationTypes.ERROR;
                    }
                }

                notify(notificationInfo);
            }
        },
        [deliveryReceptionId]
    );

    return {
        deliveryReception,
        acceptDeliveryReception,
        sendComment,
    };
}
