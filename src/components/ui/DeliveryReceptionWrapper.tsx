import { DeliveryReceptionInformation } from "@/components/ui/DeliveryReceptionInformation";

export const DeliveryReceptionWrapper = () => {
    return (
        <>
            <header className="flex flex-col items-center">
                <h1 className="text-green-cfe text-center">
                    DETALLE DE ENTREGA-RECEPCIÓN
                </h1>
            </header>
            <main>
                <DeliveryReceptionInformation />
            </main>
        </>
    );
};
