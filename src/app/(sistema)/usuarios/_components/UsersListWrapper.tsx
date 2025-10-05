"use client";
import { useCallback, useState } from "react";
import { useUsers } from "../_hooks/useUsers";
import { Users } from "./User";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useRouter } from "next/navigation";
import { User } from "@/types/types/model/users";

export const UsersListWrapper = () => {
    const { users, deleteUser } = useUsers();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const router = useRouter();

    const handleModdify = useCallback(
        (user: User) => {
            router.push(`/usuarios/edicion/${user.employeeNumber}`);
        },
        [router]
    );

    const handleDelete = useCallback((user: User) => {
        setUserToDelete(user);
        setIsModalOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (userToDelete !== null) {
            deleteUser(userToDelete.id);
            setIsModalOpen(false);
            setUserToDelete(null);
        }
    }, [deleteUser, userToDelete]);

    const cancelDelete = useCallback(() => {
        setIsModalOpen(false);
        setUserToDelete(null);
    }, []);

    return !users.error ? (
        !users.loading ? (
            users.value!.length > 0 ? (
                <>
                    <ul className="grid grid-cols-4 gap-4 sm:gap-6 lg:gap-8 bg-gray-300 p-4 border border-slate-500 text-xs sm:text-sm md:text-xs lg:text-lg">
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                RPE o RTT
                            </p>
                        </li>
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                Nombre
                            </p>
                        </li>
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                Eliminar
                            </p>
                        </li>
                        <li className="flex justify-center items-center">
                            <p className="font-semibold text-gray-800 text-center">
                                Modificar
                            </p>
                        </li>
                    </ul>

                    <Users
                        users={users.value}
                        onDelete={handleDelete}
                        onModify={handleModdify}
                    />
                    <ConfirmationModal
                        title="Eliminación del usuario"
                        message={
                            userToDelete
                                ? `¿Está seguro que desea eliminar el usuario:\n${userToDelete.employeeNumber} - ${userToDelete.fullName}?`
                                : ""
                        }
                        primaryButtonText="Eliminar"
                        secondaryButtonText="Cancelar"
                        isOpen={isModalOpen}
                        onClose={cancelDelete}
                        onConfirm={confirmDelete}
                    />
                </>
            ) : (
                <div className="flex justify-center items-center h-full">
                    <p className="text-center mt-36 text-2xl gap-8">
                        No existen usuarios registrados, <br />
                        deberá registrar uno nuevo
                    </p>
                </div>
            )
        ) : (
            <div className="flex justify-center items-center h-full">
                <p className="text-center mt-36 text-2xl">
                    Cargando usuarios...
                </p>
            </div>
        )
    ) : (
        <div className="col-start-1 col-span-4 mt-2">
            <ErrorBanner
                image={{
                    src: "/illustrations/search.svg",
                    alt: "Imagen representativa de usuarios no encontrados",
                }}
                title={"¡Error al cargar los usuarios!"}
                message={users.error}
            />
        </div>
    );
};
