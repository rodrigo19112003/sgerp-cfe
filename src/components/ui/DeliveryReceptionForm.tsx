"use client";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CancelButton } from "@/components/buttons/CancelButton";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ErrorBanner } from "./ErrorBanner";
import { useDeliveryReceptionForm } from "@/hooks/useDeliveryReceptionForm";
import { EMPLOYEE_NUMBER_PATTERN } from "@/utils/regexp";
import { IFile } from "@/types/types/model/deliveries_receptions";

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
    const [
        programmaticStatusFileFromBackend,
        setProgrammaticStatusFileFromBackend,
    ] = useState<IFile | null>(null);
    const [procedureReportFileFromBackend, setProcedureReportFileFromBackend] =
        useState<IFile | null>(null);

    const [
        financialResourcesFileFromBackend,
        setFinancialResourcesFileFromBackend,
    ] = useState<IFile | null>(null);

    const [humanResourcesFileFromBackend, setHumanResourcesFileFromBackend] =
        useState<IFile | null>(null);

    const [
        materialResourcesFileFromBackend,
        setMaterialResourcesFileFromBackend,
    ] = useState<IFile | null>(null);

    const [
        areaBudgetStatusFileFromBackend,
        setAreaBudgetStatusFileFromBackend,
    ] = useState<IFile | null>(null);

    useEffect(() => {
        if (isEdition && deliveryReception.value) {
            setProgrammaticStatusFileFromBackend(
                deliveryReception.value.programmaticStatusFile!
            );
            setProcedureReportFileFromBackend(
                deliveryReception.value.procedureReportFile!
            );
            setFinancialResourcesFileFromBackend(
                deliveryReception.value.financialResourcesFile!
            );
            setHumanResourcesFileFromBackend(
                deliveryReception.value.humanResourcesFile!
            );
            setMaterialResourcesFileFromBackend(
                deliveryReception.value.materialResourcesFile!
            );
            setAreaBudgetStatusFileFromBackend(
                deliveryReception.value.areaBudgetStatusFile!
            );
        }
    }, [deliveryReception.value, isEdition]);

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
            <p className="text-center mt-36 text-2xl">
                Cargando entrega-recepción...
            </p>
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
                        errors.programmaticStatusFile ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="programmaticStatusFile">
                        Evidencia - Situación Programática (PDF)
                    </label>
                    <input
                        type="file"
                        id="programmaticStatusFile"
                        accept="application/pdf"
                        {...register("programmaticStatusFile", {
                            validate: (files) => {
                                const fileList = files as FileList | null;
                                if (
                                    isEdition &&
                                    deliveryReception.value!
                                        .programmaticStatusFile
                                ) {
                                    if (fileList && fileList.length > 0) {
                                        if (
                                            fileList[0].type !==
                                            "application/pdf"
                                        )
                                            return false;
                                        if (fileList[0].size > 10 * 1024 * 1024)
                                            return false;
                                    }
                                    return true;
                                } else {
                                    if (!fileList || fileList.length === 0)
                                        return false;
                                    if (fileList[0].type !== "application/pdf")
                                        return false;
                                    if (fileList[0].size > 10 * 1024 * 1024)
                                        return false;
                                    return true;
                                }
                            },
                        })}
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setProgrammaticStatusFileFromBackend(null);
                            }
                        }}
                    />

                    {isEdition && programmaticStatusFileFromBackend && (
                        <p>
                            Archivo cargado:{" "}
                            {programmaticStatusFileFromBackend.name}
                        </p>
                    )}

                    <p className="error">
                        Debe subir un archivo PDF con tamaño máximo de 10 MB
                    </p>
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
                    />
                    <p className="error">
                        Situación del presupuesto asignado al área inválida
                    </p>
                </div>

                <div
                    className={`form-group ${
                        errors.areaBudgetStatusFile ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="areaBudgetStatusFile">
                        Evidencia - Situación del presupuesto asignado al área
                        (PDF)
                    </label>
                    <input
                        type="file"
                        id="areaBudgetStatusFile"
                        accept="application/pdf"
                        {...register("areaBudgetStatusFile", {
                            validate: (files) => {
                                const fileList = files as FileList | null;
                                if (
                                    isEdition &&
                                    deliveryReception.value!
                                        .areaBudgetStatusFile
                                ) {
                                    if (fileList && fileList.length > 0) {
                                        if (
                                            fileList[0].type !==
                                            "application/pdf"
                                        )
                                            return false;
                                        if (fileList[0].size > 10 * 1024 * 1024)
                                            return false;
                                    }
                                    return true;
                                } else {
                                    if (!fileList || fileList.length === 0)
                                        return false;
                                    if (fileList[0].type !== "application/pdf")
                                        return false;
                                    if (fileList[0].size > 10 * 1024 * 1024)
                                        return false;
                                    return true;
                                }
                            },
                        })}
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setAreaBudgetStatusFileFromBackend(null);
                            }
                        }}
                    />

                    {isEdition && areaBudgetStatusFileFromBackend && (
                        <p>
                            Archivo cargado:{" "}
                            {areaBudgetStatusFileFromBackend.name}
                        </p>
                    )}

                    <p className="error">
                        Debe subir un archivo PDF con tamaño máximo de 10 MB
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
                    />
                    <p className="error">Recursos financieros inválidos</p>
                </div>

                <div
                    className={`form-group ${
                        errors.financialResourcesFile ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="financialResourcesFile">
                        Evidencia - Recursos Financieros (PDF)
                    </label>
                    <input
                        type="file"
                        id="financialResourcesFile"
                        accept="application/pdf"
                        {...register("financialResourcesFile", {
                            validate: (files) => {
                                const fileList = files as FileList | null;
                                if (
                                    isEdition &&
                                    deliveryReception.value!
                                        .financialResourcesFile
                                ) {
                                    if (fileList && fileList.length > 0) {
                                        if (
                                            fileList[0].type !==
                                            "application/pdf"
                                        )
                                            return false;
                                        if (fileList[0].size > 10 * 1024 * 1024)
                                            return false;
                                    }
                                    return true;
                                } else {
                                    if (!fileList || fileList.length === 0)
                                        return false;
                                    if (fileList[0].type !== "application/pdf")
                                        return false;
                                    if (fileList[0].size > 10 * 1024 * 1024)
                                        return false;
                                    return true;
                                }
                            },
                        })}
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setFinancialResourcesFileFromBackend(null);
                            }
                        }}
                    />

                    {isEdition && financialResourcesFileFromBackend && (
                        <p>
                            Archivo cargado:{" "}
                            {financialResourcesFileFromBackend.name}
                        </p>
                    )}

                    <p className="error">
                        Debe subir un archivo PDF con tamaño máximo de 10 MB
                    </p>
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
                    />
                    <p className="error">Recursos materiales inválidos</p>
                </div>

                <div
                    className={`form-group ${
                        errors.materialResourcesFile ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="materialResourcesFile">
                        Evidencia - Recursos Materiales (PDF)
                    </label>
                    <input
                        type="file"
                        id="materialResourcesFile"
                        accept="application/pdf"
                        {...register("materialResourcesFile", {
                            validate: (files) => {
                                const fileList = files as FileList | null;
                                if (
                                    isEdition &&
                                    deliveryReception.value!
                                        .materialResourcesFile
                                ) {
                                    if (fileList && fileList.length > 0) {
                                        if (
                                            fileList[0].type !==
                                            "application/pdf"
                                        )
                                            return false;
                                        if (fileList[0].size > 10 * 1024 * 1024)
                                            return false;
                                    }
                                    return true;
                                } else {
                                    if (!fileList || fileList.length === 0)
                                        return false;
                                    if (fileList[0].type !== "application/pdf")
                                        return false;
                                    if (fileList[0].size > 10 * 1024 * 1024)
                                        return false;
                                    return true;
                                }
                            },
                        })}
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setMaterialResourcesFileFromBackend(null);
                            }
                        }}
                    />

                    {isEdition && materialResourcesFileFromBackend && (
                        <p>
                            Archivo cargado:{" "}
                            {materialResourcesFileFromBackend.name}
                        </p>
                    )}

                    <p className="error">
                        Debe subir un archivo PDF con tamaño máximo de 10 MB
                    </p>
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
                    />
                    <p className="error">Recursos humanos inválidos</p>
                </div>

                <div
                    className={`form-group ${
                        errors.humanResourcesFile ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="humanResourcesFile">
                        Evidencia - Recursos Humanos (PDF)
                    </label>
                    <input
                        type="file"
                        id="humanResourcesFile"
                        accept="application/pdf"
                        {...register("humanResourcesFile", {
                            validate: (files) => {
                                const fileList = files as FileList | null;
                                if (
                                    isEdition &&
                                    deliveryReception.value!.humanResourcesFile
                                ) {
                                    if (fileList && fileList.length > 0) {
                                        if (
                                            fileList[0].type !==
                                            "application/pdf"
                                        )
                                            return false;
                                        if (fileList[0].size > 10 * 1024 * 1024)
                                            return false;
                                    }
                                    return true;
                                } else {
                                    if (!fileList || fileList.length === 0)
                                        return false;
                                    if (fileList[0].type !== "application/pdf")
                                        return false;
                                    if (fileList[0].size > 10 * 1024 * 1024)
                                        return false;
                                    return true;
                                }
                            },
                        })}
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setHumanResourcesFileFromBackend(null);
                            }
                        }}
                    />

                    {isEdition && humanResourcesFileFromBackend && (
                        <p>
                            Archivo cargado:{" "}
                            {humanResourcesFileFromBackend.name}
                        </p>
                    )}

                    <p className="error">
                        Debe subir un archivo PDF con tamaño máximo de 10 MB
                    </p>
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
                    />
                    <p className="error">
                        Informe de asuntos en trámite inválido
                    </p>
                </div>

                <div
                    className={`form-group ${
                        errors.procedureReportFile ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="procedureReportFile">
                        Evidencia - Informe de Asuntos en Trámite (PDF)
                    </label>
                    <input
                        type="file"
                        id="procedureReportFile"
                        accept="application/pdf"
                        {...register("procedureReportFile", {
                            validate: (files) => {
                                const fileList = files as FileList | null;
                                if (
                                    isEdition &&
                                    deliveryReception.value!.procedureReportFile
                                ) {
                                    if (fileList && fileList.length > 0) {
                                        if (
                                            fileList[0].type !==
                                            "application/pdf"
                                        )
                                            return false;
                                        if (fileList[0].size > 10 * 1024 * 1024)
                                            return false;
                                    }
                                    return true;
                                } else {
                                    if (!fileList || fileList.length === 0)
                                        return false;
                                    if (fileList[0].type !== "application/pdf")
                                        return false;
                                    if (fileList[0].size > 10 * 1024 * 1024)
                                        return false;
                                    return true;
                                }
                            },
                        })}
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setProcedureReportFileFromBackend(null);
                            }
                        }}
                    />

                    {isEdition && procedureReportFileFromBackend && (
                        <p>
                            Archivo cargado:{" "}
                            {procedureReportFileFromBackend.name}
                        </p>
                    )}
                </div>

                <div
                    className={`form-group ${
                        errors.otherFacts ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="otherFacts">VII. OTROS HECHOS</label>
                    <textarea
                        {...register("otherFacts", {
                            required: true,
                        })}
                        id="otherFacts"
                        rows={5}
                    />
                    <p className="error">Otros hechos inválidos</p>
                </div>

                <div
                    className={`form-group ${
                        errors.employeeNumberReceiver ? "invalid" : ""
                    }`}
                >
                    <label htmlFor="employeeNumberReceiver">
                        RPE/RTT del trabajador que recibe el puesto
                    </label>
                    <input
                        {...register("employeeNumberReceiver", {
                            required: true,
                            maxLength: 5,
                            pattern: EMPLOYEE_NUMBER_PATTERN,
                        })}
                        id="employeeNumberReceiver"
                        type="text"
                        disabled={isEdition}
                    />
                    <p className="error">RPE/RTT inválido</p>
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
