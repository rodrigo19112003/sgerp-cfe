"use client";
import { useCallback, useState } from "react";
import { useDeliveriesReceptionsMade } from "../_hooks/useDeliveriesReceptionsMade";
import { DeliveriesReceptionsMade } from "./DeliveryReceptionMade";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useRouter } from "next/navigation";
import { DeliveryReceptionMade } from "@/types/types/model/deliveries_receptions";

export const DeliveriesReceptionsMadeListWrapper = () => {
    const {
        deliveriesReceptionsMadeList,
        bottomOfDeliveriesReceptionsMadeListRef,
        deleteDeliveryReceptionMade,
    } = useDeliveriesReceptionsMade();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deliveryReceptionMadeToDelete, setDeliveryReceptionMadeToDelete] =
        useState<DeliveryReceptionMade | null>(null);
    const router = useRouter();

    const handleModdify = useCallback(
        (deliveryReceptionMade: DeliveryReceptionMade) => {
            router.push(
                `/entregas-recepciones-realizadas/edicion/${deliveryReceptionMade.id}`
            );
        },
        [router]
    );

    const handleDelete = useCallback(
        (deliveryReceptionMade: DeliveryReceptionMade) => {
            setDeliveryReceptionMadeToDelete(deliveryReceptionMade);
            setIsModalOpen(true);
        },
        []
    );

    const confirmDelete = useCallback(() => {
        if (deliveryReceptionMadeToDelete !== null) {
            deleteDeliveryReceptionMade(deliveryReceptionMadeToDelete.id);
            setIsModalOpen(false);
            setDeliveryReceptionMadeToDelete(null);
        }
    }, [deleteDeliveryReceptionMade, deliveryReceptionMadeToDelete]);

    const cancelDelete = useCallback(() => {
        setIsModalOpen(false);
        setDeliveryReceptionMadeToDelete(null);
    }, []);

    return !deliveriesReceptionsMadeList.error ? (
        !deliveriesReceptionsMadeList.loading ? (
            deliveriesReceptionsMadeList.value!.length > 0 ? (
                <>
                    <ul className="grid grid-cols-4 gap-4 sm:gap-6 lg:gap-8 bg-gray-300 p-4 border border-slate-500 text-xs sm:text-sm md:text-xs lg:text-lg">
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                Estado
                            </p>
                        </li>
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                Trabajador que recibe
                            </p>
                        </li>
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                Eliminar
                            </p>
                        </li>
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                Visualizar/Modificar
                            </p>
                        </li>
                    </ul>
                    <DeliveriesReceptionsMade
                        deliveriesReceptionsMade={
                            deliveriesReceptionsMadeList.value
                        }
                        onDelete={handleDelete}
                        onModify={handleModdify}
                    />
                    <div
                        ref={bottomOfDeliveriesReceptionsMadeListRef}
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
                message={deliveriesReceptionsMadeList.error}
            />
        </div>
    );
};
