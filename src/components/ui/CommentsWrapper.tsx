"use client";
import { FC } from "react";
import { BaseModal } from "./BaseModal";
import EvidenceCategories from "@/types/enums/evidence_categories";
import { useComments } from "@/hooks/useCommnets";
import { IoClose } from "react-icons/io5";
import { IconButton } from "../buttons/IconButton";
import { ErrorBanner } from "./ErrorBanner";

interface ModalProps {
    isOpen: boolean;
    handleCloseModal: () => void;
    categoryName: EvidenceCategories;
    deliveryReceptionId: number;
}

export const CommentsWrapper: FC<ModalProps> = ({
    handleCloseModal,
    isOpen,
    deliveryReceptionId,
    categoryName,
}) => {
    const { comments } = useComments({
        deliveryReceptionId,
        categoryName,
    });

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleCloseModal}
            maxWidth="max-w-[650px]"
        >
            <div className="p-4 flex flex-col h-full max-h-[90vh]">
                <header className="flex justify-end">
                    <IconButton
                        className="bg-white hover:bg-gray-50 p-2"
                        aria-label="Close"
                        onClick={handleCloseModal}
                    >
                        <IoClose className="text-gray-800" />
                    </IconButton>
                </header>

                {comments.loading && (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-lg">Cargando comentarios...</p>
                    </div>
                )}

                {!comments.loading && comments.error && (
                    <ErrorBanner
                        image={{
                            src: "/illustrations/search.svg",
                            alt: "Error al cargar",
                        }}
                        title="¡Error al cargar comentarios!"
                        message={comments.error}
                    />
                )}
                {!comments.loading &&
                    comments.value &&
                    comments.value.length === 0 && (
                        <p className="text-center text-gray-700 py-10">
                            No hay comentarios registrados.
                        </p>
                    )}

                {!comments.loading &&
                    comments.value &&
                    comments.value.length > 0 && (
                        <>
                            <h3>Comentarios en {categoryName}</h3>
                            <main className="overflow-y-auto px-2 mt-2">
                                {comments.value.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="border-b py-4"
                                    >
                                        <p className="font-semibold text-gray-800">
                                            {
                                                comment.zoneManagerEmployeeNumberAndFullName
                                            }
                                        </p>
                                        <p className="text-gray-700 mt-1">
                                            {comment.text}
                                        </p>
                                    </div>
                                ))}
                            </main>
                        </>
                    )}
            </div>
        </BaseModal>
    );
};
