import { Metadata } from "next";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { UsersListWrapper } from "./_components/UsersListWrapper";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Usuarios",
};

export default function UsersPage() {
    return (
        <div className="px-3 md:px-12 max-w-screen-2xl mx-auto pt-8 pb-16 md:grid grid-cols-4 gap-5">
            <header className="flex flex-col items-center col-start-2 col-span-2 md:col-span-4">
                <h1 className="text-green-cfe text-center">
                    Usuarios en el sistema
                </h1>
            </header>
            <section className="col-start-4 mt-4 col-span-1 flex justify-end md:col-span-4">
                <Link href="usuarios/nuevo">
                    <PrimaryButton>Registrar usuario</PrimaryButton>
                </Link>
            </section>
            <section className="col-start-1 col-span-4 mt-2">
                <UsersListWrapper />
            </section>
        </div>
    );
}
