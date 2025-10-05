import { ConfirmationInfo } from "@/types/types/components/confirmation";
import { TernaryButton } from "../buttons/TernaryButton";
import { FC } from "react";
import { PrimaryButton } from "../buttons/PrimaryButton";

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
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-500/50 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4 sm:mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-sm sm:text-lg text-center font-bold text-gray-800 mb-4">
                    {title}
                </h2>
                <p className="text-xs sm:text-base mb-4 text-gray-800 whitespace-pre-line text-center">
                    {message}
                </p>
                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-5">
                    <TernaryButton onClick={onClose}>
                        {secondaryButtonText}
                    </TernaryButton>
                    <PrimaryButton onClick={onConfirm}>
                        {primaryButtonText}
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
};
