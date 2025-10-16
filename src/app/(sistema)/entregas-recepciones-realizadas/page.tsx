import { Metadata } from "next";
import { DeliveriesReceptionsMade } from "./_components/DeliveriesReceptionsMadeSection";

export const metadata: Metadata = {
    title: "Entregas-Recepciones Realizadas",
};

export default function UsersPage() {
    return (
        <div className="px-3 md:px-12 max-w-screen-2xl mx-auto pt-12 pb-16 md:grid grid-cols-4 gap-5">
            <header className="flex flex-col items-center col-start-2 col-span-2 md:col-span-4">
                <h1 className="text-green-cfe text-center">
                    ENTREGAS RECEPCIONES REALIZADAS
                </h1>
            </header>
            <DeliveriesReceptionsMade />
        </div>
    );
}
