"use client";
import { EMPLOYEE_NUMBER_PATTERN, EMAIL_PATTERN } from "@/utils/regexp";
import { useUserForm } from "@/hooks/useUserForm";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CancelButton } from "@/components/buttons/CancelButton";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import UserRoles from "@/types/enums/user_roles";
import { ErrorBanner } from "./ErrorBanner";

type UserFormProps = {
    isEdition: boolean;
};

export const UserForm = ({ isEdition }: UserFormProps) => {
    const { employeeNumber } = useParams();
    const validatedEmployeeNumber = Array.isArray(employeeNumber)
        ? employeeNumber[0]
        : employeeNumber;
    const {
        user,
        handleSubmit,
        errors,
        register,
        watch,
        setValue,
        isLoadingRegisteringUser,
    } = useUserForm({ isEdition, employeeNumber: validatedEmployeeNumber });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const mainRole = watch("mainRole");

    useEffect(() => {
        if (mainRole !== UserRoles.ZONE_MANAGER) {
            setValue("extraRoles", []);
        }
    }, [mainRole, setValue]);

    const handleCancelRegistration = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const confirmCancel = useCallback(() => {
        setIsModalOpen(false);
        router.push("/usuarios");
    }, [router]);

    const cancelCancel = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    return isEdition && user.loading ? (
        <div className="flex justify-center items-center h-full">
            <p className="text-center mt-36 text-2xl">Cargando usuario...</p>
        </div>
    ) : isEdition && !user.loading && user.error ? (
        <div className="col-start-1 col-span-4 mt-2">
            <ErrorBanner
                image={{
                    src: "/illustrations/search.svg",
                    alt: "Imagen representativa de usuarios no encontrados",
                }}
                title={"¡Error al cargar el usuario!"}
                message={user.error}
            />
        </div>
    ) : (
        <>
            <form onSubmit={handleSubmit}>
                <div
                    className={`form-group ${
                        errors.employeeNumber ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="employeeNumber">RPE/RTT</label>
                    <input
                        {...register("employeeNumber", {
                            required: true,
                            maxLength: 5,
                            pattern: EMPLOYEE_NUMBER_PATTERN,
                        })}
                        id="employeeNumber"
                        type="text"
                    />
                    <p className="error">Registro personal inválido</p>
                </div>

                <div
                    className={`form-group ${errors.fullName ? "invalid" : ""}`}
                >
                    <label htmlFor="fullName">Nombre completo</label>
                    <input
                        {...register("fullName", {
                            required: true,
                            maxLength: 100,
                        })}
                        id="fullName"
                        type="text"
                    />
                    <p className="error">Nombre completo inválido</p>
                </div>

                <div className={`form-group ${errors.email ? "invalid" : ""}`}>
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        {...register("email", {
                            required: true,
                            pattern: EMAIL_PATTERN,
                        })}
                        id="email"
                        type="text"
                        disabled={isEdition}
                    />
                    <p className="error">Correo electrónico inválido</p>
                </div>

                <div className="form-group">
                    <label className="mb-2 block">Tipo de puesto</label>
                    <div
                        className={`flex items-center gap-4 rounded ${
                            errors.mainRole ? "border border-red-500" : ""
                        }`}
                    >
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value={UserRoles.WORKER}
                                {...register("mainRole", { required: true })}
                                className="mr-2"
                            />
                            Trabajador
                        </label>

                        <label className="flex items-center">
                            <input
                                type="radio"
                                value={UserRoles.ZONE_MANAGER}
                                {...register("mainRole", { required: true })}
                                className="mr-2"
                            />
                            Jefe de la zona
                        </label>
                    </div>
                    {errors.mainRole && (
                        <p className="text-red-500 text-sm mt-1 text-right">
                            Seleccione un puesto
                        </p>
                    )}
                </div>

                {mainRole === UserRoles.ZONE_MANAGER && (
                    <div className="form-group">
                        <label className="mb-2 block">Roles adicionales</label>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="witness"
                                    value={UserRoles.WITNESS}
                                    {...register("extraRoles")}
                                    className="mr-2"
                                />
                                Testigo
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="administrator"
                                    value={UserRoles.ADMINISTRATOR}
                                    {...register("extraRoles")}
                                    className="mr-2"
                                />
                                Administrador
                            </label>
                        </div>
                    </div>
                )}

                <ConfirmationModal
                    title="Cancelación de registro"
                    message={
                        isEdition
                            ? "¿Está seguro que desea cancelar la actualización del usuario?, no se guardará la información"
                            : "¿Está seguro que desea cancelar el registro de usuario?, no se guardará la información"
                    }
                    primaryButtonText="Sí"
                    secondaryButtonText="No"
                    isOpen={isModalOpen}
                    onClose={cancelCancel}
                    onConfirm={confirmCancel}
                />

                <div className="mt-5 flex justify-end gap-4">
                    <CancelButton
                        type="button"
                        onClick={handleCancelRegistration}
                    >
                        {isEdition
                            ? "Cancelar actualización"
                            : "Cancelar registro"}
                    </CancelButton>
                    <PrimaryButton disabled={isLoadingRegisteringUser}>
                        {isLoadingRegisteringUser
                            ? isEdition
                                ? "Actualizando..."
                                : "Registrando..."
                            : isEdition
                            ? "Actualizar"
                            : "Registrar"}
                    </PrimaryButton>
                </div>
            </form>
        </>
    );
};
