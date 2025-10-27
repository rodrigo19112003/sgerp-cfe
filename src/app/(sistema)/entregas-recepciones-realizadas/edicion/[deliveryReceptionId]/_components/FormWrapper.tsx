import { DeliveryReceptionForm } from "@/components/ui/DeliveryReceptionForm";

export const FormWrapper = () => {
    return (
        <>
            <header className="flex flex-col items-center">
                <h1 className="text-green-cfe text-center">
                    MODIFICAR ENTREGA-RECEPCIÓN DE PUESTO
                </h1>
            </header>
            <main>
                <DeliveryReceptionForm isEdition={true} />
            </main>
        </>
    );
};
