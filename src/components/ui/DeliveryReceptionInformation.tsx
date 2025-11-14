"use client";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { TernaryButton } from "../buttons/TernaryButton";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useContext, useState } from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ErrorBanner } from "./ErrorBanner";
import { useDeliveryReception } from "@/hooks/useDeliveryReception";
import DeliveryReceptionStatusCodes from "@/types/enums/delivery_reception_status_codes";
import AuthContext from "@/contexts/auth/context";
import UserRoles from "@/types/enums/user_roles";

export const DeliveryReceptionInformation = () => {
    const userProfile = useContext(AuthContext);
    const { deliveryReceptionId } = useParams();
    const validatedDeliveryReceptionId = Array.isArray(deliveryReceptionId)
        ? deliveryReceptionId[0]
        : deliveryReceptionId;

    const deliveryReceptionIdNumber = validatedDeliveryReceptionId
        ? Number(validatedDeliveryReceptionId)
        : NaN;
    const { deliveryReception } = useDeliveryReception({
        deliveryReceptionId: deliveryReceptionIdNumber,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleAceptation = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const confirmAceptation = useCallback(() => {
        setIsModalOpen(false);
        switch (deliveryReception.value!.status) {
            case DeliveryReceptionStatusCodes.PENDING:
                router.push("/entregas-recepciones-pendientes");
                break;
            case DeliveryReceptionStatusCodes.IN_PROCESS:
                router.push("/entregas-recepciones-en-proceso");
                break;
            default:
                router.push("/entregas-recepciones-realizadas");
        }
    }, [router, deliveryReception]);

    const cancelAceptation = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const downloadPdf = (base64String: string, fileName: string) => {
        const linkSource = `data:application/pdf;base64,${base64String}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    };

    const viewPdf = (base64String: string) => {
        const pdfWindow = window.open("");
        if (pdfWindow) {
            pdfWindow.document.write(
                `<iframe width='100%' height='100%' src='data:application/pdf;base64,${base64String}'></iframe>`
            );
        }
    };

    return deliveryReception.loading ? (
        <div className="flex justify-center items-center h-full">
            <p className="text-center mt-36 text-2xl">
                Cargando entrega-recepción...
            </p>
        </div>
    ) : !deliveryReception.loading && deliveryReception.error ? (
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
            <div>
                <div className="mt-12 mb-6">
                    <p className="text-lg">
                        Creador: {deliveryReception.value!.employeeNumberMaker}-
                        {deliveryReception.value!.fullNameMaker}
                    </p>

                    <p className="text-lg">
                        Receptor:{" "}
                        {deliveryReception.value!.employeeNumberReceiver}-
                        {deliveryReception.value!.fullNameReceiver}
                    </p>
                </div>

                <details className="mb-4">
                    <summary>DATOS GENERALES</summary>
                    <div className="mt-4">
                        <p className="text-justify text-lg">
                            {deliveryReception.value!.generalData}
                        </p>
                    </div>
                </details>

                <details className="mb-4">
                    <summary>I. SITUACIÓN PROGRAMÁTICA</summary>
                    <div className="mt-4">
                        <p className="text-justify text-lg">
                            {deliveryReception.value!.programmaticStatus}
                        </p>
                    </div>
                    <div className="flex justify-center gap-4 mt-5">
                        <TernaryButton
                            onClick={() =>
                                viewPdf(
                                    deliveryReception.value!
                                        .programmaticStatusFile!
                                        .content as string
                                )
                            }
                        >
                            Ver evidencia
                        </TernaryButton>
                        <TernaryButton
                            onClick={() =>
                                downloadPdf(
                                    deliveryReception.value!
                                        .programmaticStatusFile!
                                        .content as string,
                                    "SituacionProgramatica.pdf"
                                )
                            }
                        >
                            Descargar evidencia
                        </TernaryButton>
                    </div>
                </details>

                <details className="mb-4">
                    <summary>
                        II. SITUACIÓN DEL PRESUPUESTO ASIGNADO AL ÁREA
                    </summary>
                    <div className="mt-4">
                        <p className="text-justify text-lg">
                            {deliveryReception.value!.areaBudgetStatus}
                        </p>
                    </div>
                    <div className="flex justify-center gap-4 mt-5">
                        <TernaryButton
                            onClick={() =>
                                viewPdf(
                                    deliveryReception.value!
                                        .areaBudgetStatusFile!.content as string
                                )
                            }
                        >
                            Ver evidencia
                        </TernaryButton>
                        <TernaryButton
                            onClick={() =>
                                downloadPdf(
                                    deliveryReception.value!
                                        .areaBudgetStatusFile!
                                        .content as string,
                                    "SituacionPresupuesto.pdf"
                                )
                            }
                        >
                            Descargar evidencia
                        </TernaryButton>
                    </div>
                </details>

                <details className="mb-4">
                    <summary>III. RECURSOS FINANCIEROS</summary>
                    <div className="mt-4">
                        <p className="text-justify text-lg">
                            {deliveryReception.value!.financialResources}
                        </p>
                    </div>
                    <div className="flex justify-center gap-4 mt-5">
                        <TernaryButton
                            onClick={() =>
                                viewPdf(
                                    deliveryReception.value!
                                        .financialResourcesFile!
                                        .content as string
                                )
                            }
                        >
                            Ver evidencia
                        </TernaryButton>
                        <TernaryButton
                            onClick={() =>
                                downloadPdf(
                                    deliveryReception.value!
                                        .financialResourcesFile!
                                        .content as string,
                                    "RecursosFinancieros.pdf"
                                )
                            }
                        >
                            Descargar evidencia
                        </TernaryButton>
                    </div>
                </details>

                <details className="mb-4">
                    <summary>IV. RECURSOS MATERIALES</summary>
                    <div className="mt-4">
                        <p className="text-justify text-lg">
                            {deliveryReception.value!.materialResources}
                        </p>
                    </div>
                    <div className="flex justify-center gap-4 mt-5">
                        <TernaryButton
                            onClick={() =>
                                viewPdf(
                                    deliveryReception.value!
                                        .materialResourcesFile!
                                        .content as string
                                )
                            }
                        >
                            Ver evidencia
                        </TernaryButton>
                        <TernaryButton
                            onClick={() =>
                                downloadPdf(
                                    deliveryReception.value!
                                        .materialResourcesFile!
                                        .content as string,
                                    "RecursosMateriales.pdf"
                                )
                            }
                        >
                            Descargar evidencia
                        </TernaryButton>
                    </div>
                </details>

                <details className="mb-4">
                    <summary>V. RECURSOS HUMANOS</summary>
                    <div className="mt-4">
                        <p className="text-justify text-lg">
                            {deliveryReception.value!.humanResources}
                        </p>
                    </div>
                    <div className="flex justify-center gap-4 mt-5">
                        <TernaryButton
                            onClick={() =>
                                viewPdf(
                                    deliveryReception.value!.humanResourcesFile!
                                        .content as string
                                )
                            }
                        >
                            Ver evidencia
                        </TernaryButton>
                        <TernaryButton
                            onClick={() =>
                                downloadPdf(
                                    deliveryReception.value!.humanResourcesFile!
                                        .content as string,
                                    "RecursosHumanos.pdf"
                                )
                            }
                        >
                            Descargar evidencia
                        </TernaryButton>
                    </div>
                </details>

                <details className="mb-4">
                    <summary>VI. INFORME DE ASUNTOS EN TRÁMITE</summary>
                    <div className="mt-4">
                        <p className="text-justify text-lg">
                            {deliveryReception.value!.procedureReport}
                        </p>
                    </div>
                    <div className="flex justify-center gap-4 mt-5">
                        <TernaryButton
                            onClick={() =>
                                viewPdf(
                                    deliveryReception.value!
                                        .procedureReportFile!.content as string
                                )
                            }
                        >
                            Ver evidencia
                        </TernaryButton>
                        <TernaryButton
                            onClick={() =>
                                downloadPdf(
                                    deliveryReception.value!
                                        .procedureReportFile!.content as string,
                                    "InformeAsuntosTramite.pdf"
                                )
                            }
                        >
                            Descargar evidencia
                        </TernaryButton>
                    </div>
                </details>

                <details className="mb-4">
                    <summary>VII. OTROS HECHOS</summary>
                    <div className="mt-4">
                        <p className="text-justify text-lg">
                            {deliveryReception.value!.otherFacts}
                        </p>
                    </div>
                </details>

                <ConfirmationModal
                    title="Aceptación de entrega-recepción"
                    message={
                        "¿Está seguro que desea aceptar la entrega-recepción?, esto no se puede revertir."
                    }
                    primaryButtonText="Sí"
                    secondaryButtonText="No"
                    isOpen={isModalOpen}
                    onClose={cancelAceptation}
                    onConfirm={confirmAceptation}
                />

                {deliveryReception.value!.status ===
                    DeliveryReceptionStatusCodes.PENDING &&
                    userProfile.roles.includes(UserRoles.WITNESS) && (
                        <div className="flex justify-end gap-4 mt-5">
                            <PrimaryButton
                                type="button"
                                onClick={handleAceptation}
                            >
                                Aceptar Entrega-Recepción
                            </PrimaryButton>
                        </div>
                    )}

                {deliveryReception.value!.status ===
                    DeliveryReceptionStatusCodes.PENDING &&
                    !userProfile.roles.includes(UserRoles.WITNESS) && (
                        <div className="flex justify-center items-center">
                            <p className="text-center mt-36 text-xl">
                                Esta entrega-recepción no ha sido aceptada por
                                ningún usuario involucrado
                            </p>
                        </div>
                    )}

                {deliveryReception.value!.status ===
                    DeliveryReceptionStatusCodes.IN_PROCESS &&
                    userProfile.roles.includes(UserRoles.WITNESS) && (
                        <div className="flex justify-center items-center">
                            <p className="text-center mt-36 text-xl">
                                Ya aceptaste esta entrega-recepción, pero aún
                                falta que el otro testigo o el trabajador la
                                acepte.
                            </p>
                        </div>
                    )}

                {deliveryReception.value!.status ===
                    DeliveryReceptionStatusCodes.IN_PROCESS &&
                    !userProfile.roles.includes(UserRoles.WITNESS) && (
                        <div className="flex justify-center items-center">
                            <p className="text-center mt-36 text-xl">
                                Esta entrega-recepción ya fue aceptada por al
                                menos un usuario involucrado, pero aún faltan
                                otros.
                            </p>
                        </div>
                    )}

                {deliveryReception.value!.status ===
                    DeliveryReceptionStatusCodes.IN_PROCESS &&
                    !userProfile.roles.includes(UserRoles.WITNESS) && (
                        <div className="flex justify-center items-center">
                            <p className="text-center mt-36 text-xl">
                                Esta entrega-recepción ya fue aceptada por todos
                                los usuarios involucrados, y ya se encuentra
                                liberada.
                            </p>
                        </div>
                    )}
            </div>
        </>
    );
};
