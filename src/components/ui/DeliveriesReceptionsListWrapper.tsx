"use client";
import { useCallback, useContext, useState } from "react";
import { DeliveriesReceptions } from "./DeliveryReception";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useRouter } from "next/navigation";
import { DeliveryReception } from "@/types/types/model/deliveries_receptions";
import AuthContext from "@/contexts/auth/context";
import UserRoles from "@/types/enums/user_roles";
import DeliveryReceptionStatusCodes from "@/types/enums/delivery_reception_status_codes";
import { useDeliveriesReceptions } from "@/hooks/useDeliveriesReceptions";

interface DeliveriesReceptionsProps {
    deliveriesReceptionsAreMade: boolean;
    deliveryReceptionStatus?: DeliveryReceptionStatusCodes;
}

export const DeliveriesReceptionsListWrapper = ({
    deliveriesReceptionsAreMade,
    deliveryReceptionStatus,
}: DeliveriesReceptionsProps) => {
    const {
        deliveriesReceptionsList,
        bottomOfDeliveriesReceptionsListRef,
        deleteDeliveryReceptionMade,
    } = useDeliveriesReceptions({
        deliveriesReceptionsAreMade,
        deliveryReceptionStatus,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deliveryReceptionMadeToDelete, setDeliveryReceptionMadeToDelete] =
        useState<DeliveryReception | null>(null);
    const profile = useContext(AuthContext);
    const router = useRouter();

    const handleViewOrModdify = useCallback(
        (deliveryReception: DeliveryReception) => {
            if (profile.roles.includes(UserRoles.WORKER)) {
                if (deliveriesReceptionsAreMade) {
                    const basePath = "/entregas-recepciones-realizadas";
                    const path =
                        deliveryReception.status ===
                        DeliveryReceptionStatusCodes.PENDING
                            ? `${basePath}/edicion/${deliveryReception.deliveryReceptionId}`
                            : `${basePath}/${deliveryReception.deliveryReceptionId}`;
                    router.push(path);
                    return;
                }

                router.push(
                    `/entregas-recepciones-recibidas/${deliveryReception.deliveryReceptionId}`
                );
                return;
            }

            if (profile.roles.includes(UserRoles.ZONE_MANAGER)) {
                const { status, deliveryReceptionId } = deliveryReception;
                let basePath = "";

                switch (status) {
                    case DeliveryReceptionStatusCodes.PENDING:
                        basePath = "/entregas-recepciones-pendientes";
                        break;
                    case DeliveryReceptionStatusCodes.IN_PROCESS:
                        basePath = "/entregas-recepciones-en-proceso";
                        break;
                    default:
                        basePath = "/entregas-recepciones-liberadas";
                        break;
                }

                router.push(`${basePath}/${deliveryReceptionId}`);
            }
        },
        [deliveriesReceptionsAreMade, profile.roles, router]
    );

    const handleDelete = useCallback(
        (deliveryReceptionMade: DeliveryReception) => {
            setDeliveryReceptionMadeToDelete(deliveryReceptionMade);
            setIsModalOpen(true);
        },
        []
    );

    const confirmDelete = useCallback(() => {
        if (deliveryReceptionMadeToDelete !== null) {
            deleteDeliveryReceptionMade(
                deliveryReceptionMadeToDelete.deliveryReceptionId
            );
            setIsModalOpen(false);
            setDeliveryReceptionMadeToDelete(null);
        }
    }, [deleteDeliveryReceptionMade, deliveryReceptionMadeToDelete]);

    const cancelDelete = useCallback(() => {
        setIsModalOpen(false);
        setDeliveryReceptionMadeToDelete(null);
    }, []);

    return !deliveriesReceptionsList.error ? (
        !deliveriesReceptionsList.loading ? (
            deliveriesReceptionsList.value!.length > 0 ? (
                <>
                    <ul className="grid grid-cols-4 gap-4 sm:gap-6 lg:gap-8 bg-gray-300 p-4 border border-slate-500 text-xs sm:text-sm md:text-xs lg:text-lg">
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                Estado
                            </p>
                        </li>
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                {deliveriesReceptionsAreMade
                                    ? "Trabajador que recibe"
                                    : "Trabajador que realiza"}
                            </p>
                        </li>
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                {deliveriesReceptionsAreMade
                                    ? "Eliminar"
                                    : profile.roles.includes(UserRoles.WORKER)
                                    ? ""
                                    : "Trabajador que recibe"}
                            </p>
                        </li>
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                {deliveriesReceptionsAreMade
                                    ? "Visualizar/Modificar"
                                    : "Visualizar"}
                            </p>
                        </li>
                    </ul>
                    <DeliveriesReceptions
                        deliveriesReceptions={deliveriesReceptionsList.value}
                        deliveriesReceptionsAreMade={
                            deliveriesReceptionsAreMade
                        }
                        onDelete={handleDelete}
                        onViewOrModify={handleViewOrModdify}
                    />
                    <div
                        ref={bottomOfDeliveriesReceptionsListRef}
                        className="h-8"
                    ></div>
                    <ConfirmationModal
                        title="Eliminación de entrega-recepción realizada"
                        message={
                            deliveryReceptionMadeToDelete
                                ? `¿Está seguro que desea eliminar la entrega-recepción realizada al usuario:\n${deliveryReceptionMadeToDelete.employeeNumberReceiver} - ${deliveryReceptionMadeToDelete.fullNameReceiver}?`
                                : ""
                        }
                        primaryButtonText="Eliminar"
                        secondaryButtonText="Cancelar"
                        isOpen={isModalOpen}
                        onClose={cancelDelete}
                        onConfirm={confirmDelete}
                    />
                </>
            ) : (
                <div className="flex justify-center items-center h-full">
                    <p className="text-center mt-36 text-2xl gap-8">
                        No se encontraron resultados en la búsqueda
                    </p>
                </div>
            )
        ) : (
            <div className="flex justify-center items-center h-full">
                <p className="text-center mt-36 text-2xl">
                    Cargando entregas-recepciones realizadas...
                </p>
            </div>
        )
    ) : (
        <div className="col-start-1 col-span-4 mt-2">
            <ErrorBanner
                image={{
                    src: "/illustrations/search.svg",
                    alt: "Imagen representativa de entregas-recepciones realizadas no encontradas",
                }}
                title={"¡Error al cargar las entregas-recepciones realizadas!"}
                message={deliveriesReceptionsList.error}
            />
        </div>
    );
};
