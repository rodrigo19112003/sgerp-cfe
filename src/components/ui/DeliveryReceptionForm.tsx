"use client";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CancelButton } from "@/components/buttons/CancelButton";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ErrorBanner } from "./ErrorBanner";
import { useDeliveryReceptionForm } from "@/hooks/useDeliveryReceptionForm";

type DeliveryReceptionFormProps = {
    isEdition: boolean;
};

export const DeliveryReceptionForm = ({
    isEdition,
}: DeliveryReceptionFormProps) => {
    const { deliveryReceptionId } = useParams();
    const validatedDeliveryReceptionId = Array.isArray(deliveryReceptionId)
        ? deliveryReceptionId[0]
        : deliveryReceptionId;

    const deliveryReceptionIdNumber = validatedDeliveryReceptionId
        ? Number(validatedDeliveryReceptionId)
        : NaN;
    const {
        deliveryReception,
        handleSubmit,
        errors,
        register,
        isLoadingRegisteringDeliveryReception,
    } = useDeliveryReceptionForm({
        isEdition,
        deliveryReceptionId: deliveryReceptionIdNumber,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleCancelRegistration = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const confirmCancel = useCallback(() => {
        setIsModalOpen(false);
        router.push("/entregas-recepciones-realizadas");
    }, [router]);

    const cancelCancel = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    return isEdition && deliveryReception.loading ? (
        <div className="flex justify-center items-center h-full">
            <p className="text-center mt-36 text-2xl">Cargando usuario...</p>
        </div>
    ) : isEdition && !deliveryReception.loading && deliveryReception.error ? (
        <div className="col-start-1 col-span-4 mt-2">
            <ErrorBanner
                image={{
                    src: "/illustrations/search.svg",
                    alt: "Imagen representativa de entregas-recepciones no encontrados",
                }}
                title={"¡Error al cargar la entrega-recepción!"}
                message={deliveryReception.error}
            />
        </div>
    ) : (
        <>
            <form onSubmit={handleSubmit}>
                <div
                    className={`form-group ${
                        errors.generalData ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="generalData">DATOS GENERALES</label>
                    <textarea
                        {...register("generalData", {
                            required: true,
                        })}
                        id="generalData"
                        rows={5}
                    />
                    <p className="error">Datos generales inválidos</p>
                </div>

                <div
                    className={`form-group ${
                        errors.programmaticStatus ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="programmaticStatus">
                        I. SITUACIÓN PROGRAMÁTICA
                    </label>
                    <textarea
                        {...register("programmaticStatus", {
                            required: true,
                        })}
                        id="programmaticStatus"
                        rows={5}
                    />
                    <p className="error">Situación programática inválida</p>
                </div>

                <div
                    className={`form-group ${
                        errors.areaBudgetStatus ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="areaBudgetStatus">
                        II. SITUACIÓN DEL PRESUPUESTO ASIGNADO AL ÁREA
                    </label>
                    <textarea
                        {...register("areaBudgetStatus", {
                            required: true,
                        })}
                        id="areaBudgetStatus"
                        rows={5}
                        disabled={isEdition}
                    />
                    <p className="error">
                        Situación del presupuesto asignado al área inválida
                    </p>
                </div>

                <div
                    className={`form-group ${
                        errors.financialResources ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="financialResources">
                        III. RECURSOS FINANCIEROS
                    </label>
                    <textarea
                        {...register("financialResources", {
                            required: true,
                        })}
                        id="financialResources"
                        rows={5}
                        disabled={isEdition}
                    />
                    <p className="error">Recursos financieros inválidos</p>
                </div>

                <div
                    className={`form-group ${
                        errors.materialResources ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="materialResources">
                        IV. RECURSOS MATERIALES
                    </label>
                    <textarea
                        {...register("materialResources", {
                            required: true,
                        })}
                        id="materialResources"
                        rows={5}
                        disabled={isEdition}
                    />
                    <p className="error">Recursos materiales inválidos</p>
                </div>

                <div
                    className={`form-group ${
                        errors.humanResources ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="humanResources">V. RECURSOS HUMANOS</label>
                    <textarea
                        {...register("humanResources", {
                            required: true,
                        })}
                        id="humanResources"
                        rows={5}
                        disabled={isEdition}
                    />
                    <p className="error">Recursos humanos inválidos</p>
                </div>

                <div
                    className={`form-group ${
                        errors.procedureReport ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="procedureReport">
                        VI. INFORME DE ASUNTOS EN TRÁMITE
                    </label>
                    <textarea
                        {...register("procedureReport", {
                            required: true,
                        })}
                        id="procedureReport"
                        rows={5}
                        disabled={isEdition}
                    />
                    <p className="error">
                        Informe de asuntos en trámite inválido
                    </p>
                </div>

                <ConfirmationModal
                    title="Cancelación de registro"
                    message={
                        isEdition
                            ? "¿Está seguro que desea cancelar la actualización de la entrega-recepción?, no se guardará la información"
                            : "¿Está seguro que desea cancelar el registro de la entrega-recepción?, no se guardará la información"
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
                    <PrimaryButton
                        disabled={isLoadingRegisteringDeliveryReception}
                    >
                        {isLoadingRegisteringDeliveryReception
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
