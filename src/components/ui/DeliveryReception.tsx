"use client";
import DeliveryReceptionStatusCodes from "@/types/enums/delivery_reception_status_codes";
import { DeliveryReception } from "@/types/types/model/deliveries_receptions";
import { FC } from "react";
import { FaTrashAlt, FaEdit, FaEye } from "react-icons/fa";

type DeliveriesReceptionsProps = {
    deliveriesReceptions: {
        id: number;
        status: DeliveryReceptionStatusCodes;
        employeeNumberReceiver?: string;
        fullNameReceiver?: string;
        employeeNumberMaker?: string;
        fullNameMaker?: string;
        deliveryReceptionId: number;
    }[];
    deliveriesReceptionsAreMade: boolean;
    onDelete: (deliveryReception: DeliveryReception) => void;
    onViewOrModify: (deliveryReception: DeliveryReception) => void;
};

export const DeliveriesReceptions: FC<DeliveriesReceptionsProps> = ({
    deliveriesReceptions,
    deliveriesReceptionsAreMade,
    onDelete,
    onViewOrModify,
}) => {
    return (
        <>
            {deliveriesReceptions.map((deliveryReception) => (
                <ul
                    key={deliveryReception.id}
                    className="grid grid-cols-4 gap-4 sm:gap-6 lg:gap-8 bg-gray-50 p-4 border border-gray-300"
                >
                    <li className="flex justify-center items-center">
                        <p className="text-xs sm:text-sm lg:text-base font-regular text-gray-800 text-center break-words">
                            {deliveryReception.status}
                        </p>
                    </li>
                    <li className="flex justify-center items-center">
                        <p className="text-xs sm:text-sm lg:text-base font-regular text-gray-800 text-center break-words">
                            {deliveriesReceptionsAreMade
                                ? `${deliveryReception.employeeNumberReceiver} - ${deliveryReception.fullNameReceiver}`
                                : `${deliveryReception.employeeNumberMaker} - ${deliveryReception.fullNameMaker}`}
                        </p>
                    </li>
                    <li className="flex justify-center items-center">
                        {deliveriesReceptionsAreMade ? (
                            <button
                                className={`${
                                    deliveryReception.status.includes(
                                        DeliveryReceptionStatusCodes.PENDING
                                    )
                                        ? "text-gray-800 hover:text-red-500"
                                        : ""
                                }flex items-center justify-center `}
                                disabled={
                                    !deliveryReception.status.includes(
                                        DeliveryReceptionStatusCodes.PENDING
                                    )
                                }
                                onClick={() => onDelete(deliveryReception)}
                            >
                                <FaTrashAlt />
                            </button>
                        ) : (
                            <p className="text-xs sm:text-sm lg:text-base font-regular text-gray-800 text-center break-words">
                                {deliveryReception.employeeNumberReceiver
                                    ? `${deliveryReception.employeeNumberReceiver} - ${deliveryReception.fullNameReceiver}`
                                    : ""}
                            </p>
                        )}
                    </li>
                    <li className="flex justify-center items-center">
                        <button
                            className="text-gray-800 hover:text-red-500 flex items-center justify-center"
                            onClick={() => onViewOrModify(deliveryReception)}
                        >
                            {deliveriesReceptionsAreMade &&
                            deliveryReception.status ===
                                DeliveryReceptionStatusCodes.PENDING ? (
                                <FaEdit />
                            ) : (
                                <FaEye />
                            )}
                        </button>
                    </li>
                </ul>
            ))}
        </>
    );
};
