"use client";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import Link from "next/link";
import { Searchbar } from "@/components/inputs/Searchbar";
import DeliveryReceptionStatusCodes from "@/types/enums/delivery_reception_status_codes";
import { DeliveriesReceptionsListWrapper } from "./DeliveriesReceptionsListWrapper";

interface DeliveriesReceptionsProps {
    deliveriesReceptionsAreMade: boolean;
    deliveryReceptionStatus?: DeliveryReceptionStatusCodes;
}

export const DeliveriesReceptionsSection = ({
    deliveriesReceptionsAreMade,
    deliveryReceptionStatus,
}: DeliveriesReceptionsProps) => {
    return (
        <>
            {deliveriesReceptionsAreMade && (
                <section className="col-start-4 mt-4 col-span-1 flex justify-end md:col-span-4">
                    <Link href="/entregas-recepciones-realizadas/nueva">
                        <PrimaryButton>
                            Registrar entrega-recepción
                        </PrimaryButton>
                    </Link>
                </section>
            )}

            <section className="col-start-1 col-span-4 mt-2">
                <Searchbar
                    placeholder={
                        deliveriesReceptionsAreMade
                            ? "Buscar Entregas-Recepciones por nombre o RPE/RTT del trabajador que recibe"
                            : "Buscar Entregas-Recepciones por nombre o RPE/RTT del trabajador que la realiza"
                    }
                    buttonSearchTittle="Buscar entrega-recepción"
                />
                <DeliveriesReceptionsListWrapper
                    deliveriesReceptionsAreMade={deliveriesReceptionsAreMade}
                    deliveryReceptionStatus={deliveryReceptionStatus}
                />
            </section>
        </>
    );
};
