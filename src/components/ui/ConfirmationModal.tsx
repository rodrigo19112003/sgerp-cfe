"use client";
import { FC } from "react";
import { BaseModal } from "./BaseModal";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { TernaryButton } from "../buttons/TernaryButton";
import { ConfirmationInfo } from "@/types/types/components/confirmation";

type ConfirmationModalProps = ConfirmationInfo & {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export const ConfirmationModal: FC<ConfirmationModalProps> = ({
    title,
    message,
    primaryButtonText,
    secondaryButtonText,
    isOpen,
    onClose,
    onConfirm,
}) => {
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[450px]">
            <div className="p-8">
                <h2 className="text-lg text-center font-bold text-gray-800 mb-4">
                    {title}
                </h2>

                <p className="text-base mb-6 text-gray-800 whitespace-pre-line text-center">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
                    <TernaryButton onClick={onClose}>
                        {secondaryButtonText}
                    </TernaryButton>
                    <PrimaryButton onClick={onConfirm}>
                        {primaryButtonText}
                    </PrimaryButton>
                </div>
            </div>
        </BaseModal>
    );
};
