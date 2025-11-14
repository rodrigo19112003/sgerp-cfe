import { HttpStatusCodes } from "@/types/enums/http";
import sgerpCfeAPI from "@/utils/axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { DeliveryReceptionWithAllInformation } from "@/types/types/model/deliveries_receptions";

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

    return {
        deliveryReception,
    };
}
