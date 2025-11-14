import { Metadata } from "next";
import { DeliveryReceptionWrapper } from "@/components/ui/DeliveryReceptionWrapper";

export const metadata: Metadata = {
    title: "Entrega-Recepción Pendiente",
};

export default function DeliveryReceptionReleased() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 my-20">
            <div className="col-span-1 md:col-start-2 md:col-span-2 mx-auto px-5 pt-12 w-full">
                <DeliveryReceptionWrapper />
            </div>
        </div>
    );
}
