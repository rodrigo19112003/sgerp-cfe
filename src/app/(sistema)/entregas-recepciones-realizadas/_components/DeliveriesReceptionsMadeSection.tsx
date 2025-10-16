"use client";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { DeliveriesReceptionsMadeListWrapper } from "./DeliveriesReceptionsMadeListWrapper";
import Link from "next/link";
import { Searchbar } from "@/components/inputs/Searchbar";

export const DeliveriesReceptionsMade = () => {
    return (
        <>
            <section className="col-start-4 mt-4 col-span-1 flex justify-end md:col-span-4">
                <Link href="/entregas-recepciones-realizadas/nueva">
                    <PrimaryButton>Registrar entrega-recepción</PrimaryButton>
                </Link>
            </section>
            <section className="col-start-1 col-span-4 mt-2">
                <Searchbar
                    placeholder="Buscar Entregas-Recepciones por nombre o RPE/RTT del trabajador que recibe"
                    buttonSearchTittle="Buscar entrega-recepción"
                />
                <DeliveriesReceptionsMadeListWrapper />
            </section>
        </>
    );
};
