import { DeliveryReceptionStatusCodes } from "@/types/enums/delivery_reception_status_codes";

type DeliveryReception = {
    id: number;
    status: DeliveryReceptionStatusCodes;
    employeeNumberReceiver?: string;
    fullNameReceiver?: string;
    employeeNumberMaker?: string;
    fullNameMaker?: string;
    deliveryReceptionId: number;
};

export type { DeliveryReception };
