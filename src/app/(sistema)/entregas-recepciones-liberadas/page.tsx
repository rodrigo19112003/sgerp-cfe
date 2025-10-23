import { DeliveriesReceptionsSection } from "@/components/ui/DeliveriesReceptionsSection";
import DeliveryReceptionStatusCodes from "@/types/enums/delivery_reception_status_codes";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Entregas-Recepciones Liberadas",
};

export default function UsersPage() {
    return (
        <div className="px-3 md:px-12 max-w-screen-2xl mx-auto pt-12 pb-16 md:grid grid-cols-4 gap-5">
            <header className="flex flex-col items-center col-start-2 col-span-2 md:col-span-4">
                <h1 className="text-green-cfe text-center">
                    ENTREGAS RECEPCIONES LIBERADAS
                </h1>
            </header>
            <DeliveriesReceptionsSection
                deliveriesReceptionsAreMade={false}
                deliveryReceptionStatus={DeliveryReceptionStatusCodes.RELEASED}
            />
        </div>
    );
}
