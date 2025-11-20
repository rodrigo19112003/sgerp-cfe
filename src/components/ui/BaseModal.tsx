"use client";
import { FC, ReactNode } from "react";
import { FloatingElement } from "../structure/FloatingElement";

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    maxWidth?: string;
}

export const BaseModal: FC<BaseModalProps> = ({
    isOpen,
    onClose,
    children,
    maxWidth = "max-w-[650px]",
}) => {
    if (!isOpen) return null;

    return (
        <FloatingElement>
            <div
                className="fixed inset-0 bg-gray-500/50 flex justify-center items-center z-50"
                onClick={onClose}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`bg-white rounded-lg shadow-lg w-full ${maxWidth} 
                        mx-4 max-h-[90vh] overflow-hidden 
                        transform transition-all duration-200 
                        ${
                            isOpen
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-105"
                        }
                    `}
                >
                    {children}
                </div>
            </div>
        </FloatingElement>
    );
};
