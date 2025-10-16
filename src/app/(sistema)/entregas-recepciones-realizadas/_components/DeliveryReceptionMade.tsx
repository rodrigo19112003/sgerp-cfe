"use client";
import { DeliveryReceptionMade } from "@/types/types/model/deliveries_receptions";
import { FC } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import DeliveryReceptionStatusCodes from "@/types/enums/delivery_reception_status_codes";

type DeliveriesReceptionsMadeProps = {
    deliveriesReceptionsMade: {
        id: number;
        status: DeliveryReceptionStatusCodes;
        employeeNumberReceiver: string;
        fullNameReceiver: string;
    }[];
    onDelete: (deliveryReceptionMade: DeliveryReceptionMade) => void;
    onModify: (deliveryReceptionMade: DeliveryReceptionMade) => void;
};

export const DeliveriesReceptionsMade: FC<DeliveriesReceptionsMadeProps> = ({
    deliveriesReceptionsMade,
    onDelete,
    onModify,
}) => {
    return (
        <>
            {deliveriesReceptionsMade.map((deliveryReceptionMade) => (
                <ul
                    key={deliveryReceptionMade.id}
                    className="grid grid-cols-4 gap-4 sm:gap-6 lg:gap-8 bg-gray-50 p-4 border border-gray-300"
                >
                    <li className="flex justify-center items-center">
                        <p className="text-xs sm:text-sm lg:text-base font-regular text-gray-800 text-center break-words">
                            {deliveryReceptionMade.status}
                        </p>
                    </li>
                    <li className="flex justify-center items-center">
                        <p className="text-xs sm:text-sm lg:text-base font-regular text-gray-800 text-center break-words">
                            {`${deliveryReceptionMade.employeeNumberReceiver} - ${deliveryReceptionMade.fullNameReceiver}`}
                        </p>
                    </li>
                    <li className="flex justify-center items-center">
                        <button
                            className={`${
                                deliveryReceptionMade.status ===
                                DeliveryReceptionStatusCodes.PENDING
                                    ? "text-gray-800 hover:text-red-500"
                                    : ""
                            }flex items-center justify-center `}
                            disabled={
                                deliveryReceptionMade.status !==
                                DeliveryReceptionStatusCodes.PENDING
                            }
                            onClick={() => onDelete(deliveryReceptionMade)}
                        >
                            <FaTrashAlt />
                        </button>
                    </li>
                    <li className="flex justify-center items-center">
                        <button
                            className={
                                "text-gray-800 hover:text-red-500flex items-center justify-center"
                            }
                            onClick={() => onModify(deliveryReceptionMade)}
                        >
                            <FaEdit />
                        </button>
                    </li>
                </ul>
            ))}
        </>
    );
};
