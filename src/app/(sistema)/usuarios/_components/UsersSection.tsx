"use client";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { UsersListWrapper } from "./UsersListWrapper";
import Link from "next/link";
import { Searchbar } from "@/components/inputs/Searchbar";
import { useParam } from "@/hooks/useParam";

export const UsersSection = () => {
    const { paramValue: searchQuery } = useParam("busqueda", "");
    return (
        <>
            <section className="col-start-4 mt-4 col-span-1 flex justify-end md:col-span-4">
                <Link href="usuarios/nuevo">
                    <PrimaryButton>Registrar usuario</PrimaryButton>
                </Link>
            </section>
            <section className="col-start-1 col-span-4 mt-2">
                <Searchbar
                    placeholder="Buscar usuarios por nombre o RPE/RTT"
                    buttonSearchTittle="Buscar usuarios"
                />
                <UsersListWrapper searchQuery={searchQuery} />
            </section>
        </>
    );
};
