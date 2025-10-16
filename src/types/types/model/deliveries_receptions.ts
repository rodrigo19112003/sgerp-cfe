import DeliveryReceptionStatusCodes from "@/types/enums/delivery_reception_status_codes";

type DeliveryReceptionMade = {
    id: number;
    status: DeliveryReceptionStatusCodes;
    employeeNumberReceiver: string;
    fullNameReceiver: string;
};

export type { DeliveryReceptionMade };
