import { Metadata } from "next";
import { FormWrapper } from "./_components/FormWrapper";

export const metadata: Metadata = {
    title: "Modificar Entrega-Recepción",
};

export default function DeliveryReceptionEdition() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 my-20">
            <div className="col-span-1 md:col-start-2 md:col-span-2 mx-auto px-5 pt-12 w-full">
                <FormWrapper />
            </div>
        </div>
    );
}
