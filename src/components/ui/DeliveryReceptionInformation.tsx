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
import { SecondaryButton } from "../buttons/SecondaryButton";
import EvidenceCategories from "@/types/enums/evidence_categories";

export const DeliveryReceptionInformation = () => {
    const userProfile = useContext(AuthContext);
    const { deliveryReceptionId } = useParams();
    const validatedDeliveryReceptionId = Array.isArray(deliveryReceptionId)
        ? deliveryReceptionId[0]
        : deliveryReceptionId;

    const deliveryReceptionIdNumber = validatedDeliveryReceptionId
        ? Number(validatedDeliveryReceptionId)
        : NaN;
    const { deliveryReception, acceptDeliveryReception, sendComment } =
        useDeliveryReception({
            deliveryReceptionId: deliveryReceptionIdNumber,
        });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleAceptation = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const confirmAceptation = useCallback(() => {
        acceptDeliveryReception();
        setIsModalOpen(false);
        if (userProfile.roles.includes(UserRoles.WORKER)) {
            router.push("/entregas-recepciones-recibidas");
        } else {
            router.push("/entregas-recepciones-pendientes");
        }
    }, [router, userProfile, acceptDeliveryReception]);

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

    const mergeAndViewCombinedPdf = async (): Promise<void> => {
        if (!deliveryReception.value) return;

        try {
            const pdfLib = (await import(
                "pdf-lib"
            )) as typeof import("pdf-lib");
            const { PDFDocument, StandardFonts, rgb } = pdfLib;

            const base64ToUint8Array = async (
                b64: string
            ): Promise<Uint8Array> => {
                if (!b64) return new Uint8Array();
                const response = await fetch(
                    `data:application/pdf;base64,${b64}`
                );
                const arrayBuffer = await response.arrayBuffer();
                return new Uint8Array(arrayBuffer);
            };

            const mainDoc = await PDFDocument.create();
            const font = await mainDoc.embedFont(StandardFonts.Helvetica);
            const fontSize = 12;
            const lineHeight = fontSize * 1.3;
            const margin = 50;
            const pageWidth = 612;
            const pageHeight = 792;
            const usableWidth = pageWidth - margin * 2;

            const addTextPage = (title: string, text: string) => {
                let page = mainDoc.addPage([pageWidth, pageHeight]);
                const titleSize = 14;
                let y = pageHeight - margin;

                page.drawText(title, {
                    x: margin,
                    y: y - titleSize,
                    size: titleSize,
                    font,
                    color: rgb(0, 0, 0),
                });
                y -= titleSize + 10;

                const words = text ? text.split(/\s+/).filter(Boolean) : [];
                const spaceCharWidth = font.widthOfTextAtSize(" ", fontSize);

                const lines: string[][] = [];
                let currentWords: string[] = [];
                let currentWidth = 0;

                for (const w of words) {
                    const wordWidth = font.widthOfTextAtSize(w, fontSize);
                    if (currentWords.length === 0) {
                        currentWords.push(w);
                        currentWidth = wordWidth;
                    } else {
                        const potentialWidth =
                            currentWidth + spaceCharWidth + wordWidth;
                        if (potentialWidth <= usableWidth) {
                            currentWords.push(w);
                            currentWidth = potentialWidth;
                        } else {
                            lines.push(currentWords);
                            currentWords = [w];
                            currentWidth = wordWidth;
                        }
                    }
                }
                if (currentWords.length > 0) {
                    lines.push(currentWords);
                }

                for (let li = 0; li < lines.length; li++) {
                    const lineWords = lines[li];

                    if (y - fontSize < margin) {
                        page = mainDoc.addPage([pageWidth, pageHeight]);
                        y = pageHeight - margin;
                    }

                    const isLastLine = li === lines.length - 1;
                    if (lineWords.length === 1 || isLastLine) {
                        const lineStr = lineWords.join(" ");
                        page.drawText(lineStr, {
                            x: margin,
                            y: y - fontSize,
                            size: fontSize,
                            font,
                            color: rgb(0, 0, 0),
                        });
                    } else {
                        const wordsWidths = lineWords.map((w) =>
                            font.widthOfTextAtSize(w, fontSize)
                        );
                        const totalWordsWidth = wordsWidths.reduce(
                            (s, v) => s + v,
                            0
                        );
                        const gaps = lineWords.length - 1;
                        const extraSpacePerGap =
                            (usableWidth - totalWordsWidth) / gaps;

                        let currentX = margin;
                        for (let wi = 0; wi < lineWords.length; wi++) {
                            const w = lineWords[wi];
                            page.drawText(w, {
                                x: currentX,
                                y: y - fontSize,
                                size: fontSize,
                                font,
                                color: rgb(0, 0, 0),
                            });
                            const wWidth = wordsWidths[wi];
                            if (wi < lineWords.length - 1) {
                                currentX += wWidth + extraSpacePerGap;
                            }
                        }
                    }

                    y -= lineHeight;
                }
            };

            const appendEvidencePdf = async (
                base64Pdf?: string
            ): Promise<void> => {
                if (!base64Pdf) return;
                const uint8 = await base64ToUint8Array(base64Pdf);
                const evidenceDoc = await PDFDocument.load(uint8);
                const copiedPages = await mainDoc.copyPages(
                    evidenceDoc,
                    evidenceDoc.getPageIndices()
                );
                for (const p of copiedPages) {
                    mainDoc.addPage(p);
                }
            };

            addTextPage(
                "ENTREGA-RECEPCIÓN",
                `Creador: ${deliveryReception.value.employeeNumberMaker} - ${
                    deliveryReception.value.fullNameMaker
                }
Receptor: ${deliveryReception.value.employeeNumberReceiver} - ${
                    deliveryReception.value.fullNameReceiver
                }

DATOS GENERALES:
${deliveryReception.value.generalData || ""}`
            );

            addTextPage(
                "I. SITUACIÓN PROGRAMÁTICA",
                deliveryReception.value.programmaticStatus || ""
            );
            await appendEvidencePdf(
                deliveryReception.value.programmaticStatusFile
                    ?.content as string
            );

            addTextPage(
                "II. SITUACIÓN DEL PRESUPUESTO ASIGNADO AL ÁREA",
                deliveryReception.value.areaBudgetStatus || ""
            );
            await appendEvidencePdf(
                deliveryReception.value.areaBudgetStatusFile?.content as string
            );

            addTextPage(
                "III. RECURSOS FINANCIEROS",
                deliveryReception.value.financialResources || ""
            );
            await appendEvidencePdf(
                deliveryReception.value.financialResourcesFile
                    ?.content as string
            );

            addTextPage(
                "IV. RECURSOS MATERIALES",
                deliveryReception.value.materialResources || ""
            );
            await appendEvidencePdf(
                deliveryReception.value.materialResourcesFile?.content as string
            );

            addTextPage(
                "V. RECURSOS HUMANOS",
                deliveryReception.value.humanResources || ""
            );
            await appendEvidencePdf(
                deliveryReception.value.humanResourcesFile?.content as string
            );

            addTextPage(
                "VI. INFORME DE ASUNTOS EN TRÁMITE",
                deliveryReception.value.procedureReport || ""
            );
            await appendEvidencePdf(
                deliveryReception.value.procedureReportFile?.content as string
            );

            addTextPage(
                "VII. OTROS HECHOS",
                deliveryReception.value.otherFacts || ""
            );

            const pdfBytes = await mainDoc.save();
            const pdfCopy = Uint8Array.from(pdfBytes);
            const blob = new Blob([pdfCopy.buffer], {
                type: "application/pdf",
            });
            const url = URL.createObjectURL(blob);
            window.open(url);
            setTimeout(() => URL.revokeObjectURL(url), 1000 * 60);
        } catch {
            alert(
                "No se pudo generar el PDF combinado. Revisa la consola para más detalles."
            );
        }
    };

    const [generalDataComment, setGeneralDataComment] = useState("");
    const [programmaticStatusComment, setProgrammaticStatusComment] =
        useState("");
    const [areaBudgetStatusComment, setAreaBudgetStatusComment] = useState("");
    const [financialResourcesComment, setFinancialResourcesComment] =
        useState("");
    const [materialResourcesComment, setMaterialResourcesComment] =
        useState("");
    const [humanResourcesComment, setHumanResourcesComment] = useState("");
    const [procedureReportComment, setProcedureReportComment] = useState("");
    const [otherFactsComment, setOtherFactsComment] = useState("");

    const [generalDataButtonDisabled, setGeneralDataButtonDisabled] =
        useState(true);
    const [
        programmaticStatusButtonDisabled,
        setProgrammaticStatusButtonDisabled,
    ] = useState(true);
    const [areaBudgetStatusButtonDisabled, setAreaBudgetStatusButtonDisabled] =
        useState(true);
    const [
        financialResourcesButtonDisabled,
        setFinancialResourcesButtonDisabled,
    ] = useState(true);
    const [
        materialResourcesButtonDisabled,
        setMaterialResourcesButtonDisabled,
    ] = useState(true);
    const [humanResourcesButtonDisabled, setHumanResourcesButtonDisabled] =
        useState(true);
    const [procedureReportButtonDisabled, setProcedureReportButtonDisabled] =
        useState(true);
    const [otherFactsButtonDisabled, setOtherFactsButtonDisabled] =
        useState(true);

    const listenCommentInput = (
        e: React.FormEvent<HTMLInputElement>,
        elementId: string
    ) => {
        const comment = e.currentTarget.value;
        const button = document.getElementById(
            elementId
        ) as HTMLButtonElement | null;
        if (button && comment.trim() === "") {
            switch (elementId) {
                case "sendGeneralDataCommentButton":
                    setGeneralDataButtonDisabled(true);
                    break;
                case "sendProgrammaticStatusCommentButton":
                    setProgrammaticStatusButtonDisabled(true);
                    break;
                case "sendAreaBudgetStatusCommentButton":
                    setAreaBudgetStatusButtonDisabled(true);
                    break;
                case "sendFinancialResourcesCommentButton":
                    setFinancialResourcesButtonDisabled(true);
                    break;
                case "sendMaterialResourcesCommentButton":
                    setMaterialResourcesButtonDisabled(true);
                    break;
                case "sendHumanResourcesCommentButton":
                    setHumanResourcesButtonDisabled(true);
                    break;
                case "sendProcedureReportCommentButton":
                    setProcedureReportButtonDisabled(true);
                    break;
                case "sendOtherFactsCommentButton":
                    setOtherFactsButtonDisabled(true);
                    break;
            }
        } else if (button) {
            switch (elementId) {
                case "sendGeneralDataCommentButton":
                    setGeneralDataButtonDisabled(false);
                    break;
                case "sendProgrammaticStatusCommentButton":
                    setProgrammaticStatusButtonDisabled(false);
                    break;
                case "sendAreaBudgetStatusCommentButton":
                    setAreaBudgetStatusButtonDisabled(false);
                    break;
                case "sendFinancialResourcesCommentButton":
                    setFinancialResourcesButtonDisabled(false);
                    break;
                case "sendMaterialResourcesCommentButton":
                    setMaterialResourcesButtonDisabled(false);
                    break;
                case "sendHumanResourcesCommentButton":
                    setHumanResourcesButtonDisabled(false);
                    break;
                case "sendProcedureReportCommentButton":
                    setProcedureReportButtonDisabled(false);
                    break;
                case "sendOtherFactsCommentButton":
                    setOtherFactsButtonDisabled(false);
                    break;
            }
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
                    {deliveryReception.value!.status ===
                        DeliveryReceptionStatusCodes.PENDING &&
                        !userProfile.roles.includes(UserRoles.WORKER) && (
                            <>
                                <label
                                    htmlFor="generalDataComment"
                                    className="mt-4 block"
                                >
                                    Escribe un comentario sobre los Datos
                                    Generales (si lo deseas) antes de querer
                                    enviarlo
                                </label>
                                <input
                                    type="text"
                                    id="generalDataComment"
                                    value={generalDataComment}
                                    onChange={(e) => {
                                        setGeneralDataComment(e.target.value);
                                        listenCommentInput(
                                            e as React.FormEvent<HTMLInputElement>,
                                            "sendGeneralDataCommentButton"
                                        );
                                    }}
                                />
                                <div className="flex justify-end gap-4 mt-2">
                                    <SecondaryButton
                                        id="sendGeneralDataCommentButton"
                                        disabled={generalDataButtonDisabled}
                                        onClick={() => {
                                            sendComment(
                                                generalDataComment,
                                                EvidenceCategories.DATA
                                            );
                                            setGeneralDataComment("");
                                            setGeneralDataButtonDisabled(true);
                                        }}
                                    >
                                        Enviar comentario
                                    </SecondaryButton>
                                </div>
                            </>
                        )}
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
                    {deliveryReception.value!.status ===
                        DeliveryReceptionStatusCodes.PENDING &&
                        !userProfile.roles.includes(UserRoles.WORKER) && (
                            <>
                                <label
                                    htmlFor="programmaticStatusComment"
                                    className="mt-4 block"
                                >
                                    Escribe un comentario sobre la Situación
                                    Programática (si lo deseas) antes de querer
                                    enviarlo
                                </label>
                                <input
                                    type="text"
                                    id="programmaticStatusComment"
                                    value={programmaticStatusComment}
                                    onChange={(e) => {
                                        setProgrammaticStatusComment(
                                            e.target.value
                                        );
                                        listenCommentInput(
                                            e as React.FormEvent<HTMLInputElement>,
                                            "sendProgrammaticStatusCommentButton"
                                        );
                                    }}
                                />
                                <div className="flex justify-end gap-4 mt-2">
                                    <SecondaryButton
                                        id="sendProgrammaticStatusCommentButton"
                                        disabled={
                                            programmaticStatusButtonDisabled
                                        }
                                        onClick={() => {
                                            sendComment(
                                                programmaticStatusComment,
                                                EvidenceCategories.PROGRAMMATIC
                                            );
                                            setProgrammaticStatusComment("");
                                            setProgrammaticStatusButtonDisabled(
                                                true
                                            );
                                        }}
                                    >
                                        Enviar comentario
                                    </SecondaryButton>
                                </div>
                            </>
                        )}
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
                    {deliveryReception.value!.status ===
                        DeliveryReceptionStatusCodes.PENDING &&
                        !userProfile.roles.includes(UserRoles.WORKER) && (
                            <>
                                <label
                                    htmlFor="areaBudgetStatusComment"
                                    className="mt-4 block"
                                >
                                    Escribe un comentario sobre la Situación del
                                    Presupuesto Asignado al Área (si lo deseas)
                                    antes de querer enviarlo
                                </label>
                                <input
                                    type="text"
                                    id="areaBudgetStatusComment"
                                    value={areaBudgetStatusComment}
                                    onChange={(e) => {
                                        setAreaBudgetStatusComment(
                                            e.target.value
                                        );
                                        listenCommentInput(
                                            e as React.FormEvent<HTMLInputElement>,
                                            "sendAreaBudgetStatusCommentButton"
                                        );
                                    }}
                                />
                                <div className="flex justify-end gap-4 mt-2">
                                    <SecondaryButton
                                        id="sendAreaBudgetStatusCommentButton"
                                        disabled={
                                            areaBudgetStatusButtonDisabled
                                        }
                                        onClick={() => {
                                            sendComment(
                                                areaBudgetStatusComment,
                                                EvidenceCategories.BUDGET
                                            );
                                            setAreaBudgetStatusComment("");
                                            setAreaBudgetStatusButtonDisabled(
                                                true
                                            );
                                        }}
                                    >
                                        Enviar comentario
                                    </SecondaryButton>
                                </div>
                            </>
                        )}
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
                    {deliveryReception.value!.status ===
                        DeliveryReceptionStatusCodes.PENDING &&
                        !userProfile.roles.includes(UserRoles.WORKER) && (
                            <>
                                <label
                                    htmlFor="financialResourcesComment"
                                    className="mt-4 block"
                                >
                                    Escribe un comentario sobre los Recursos
                                    Financieros (si lo deseas) antes de querer
                                    enviarlo
                                </label>
                                <input
                                    type="text"
                                    id="financialResourcesComment"
                                    value={financialResourcesComment}
                                    onChange={(e) => {
                                        setFinancialResourcesComment(
                                            e.target.value
                                        );
                                        listenCommentInput(
                                            e as React.FormEvent<HTMLInputElement>,
                                            "sendFinancialResourcesCommentButton"
                                        );
                                    }}
                                />
                                <div className="flex justify-end gap-4 mt-2">
                                    <SecondaryButton
                                        id="sendFinancialResourcesCommentButton"
                                        disabled={
                                            financialResourcesButtonDisabled
                                        }
                                        onClick={() => {
                                            sendComment(
                                                financialResourcesComment,
                                                EvidenceCategories.FINANCE
                                            );
                                            setFinancialResourcesComment("");
                                            setFinancialResourcesButtonDisabled(
                                                true
                                            );
                                        }}
                                    >
                                        Enviar comentario
                                    </SecondaryButton>
                                </div>
                            </>
                        )}
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
                    {deliveryReception.value!.status ===
                        DeliveryReceptionStatusCodes.PENDING &&
                        !userProfile.roles.includes(UserRoles.WORKER) && (
                            <>
                                <label
                                    htmlFor="materialResourcesComment"
                                    className="mt-4 block"
                                >
                                    Escribe un comentario sobre los Recursos
                                    Materiales (si lo deseas) antes de querer
                                    enviarlo
                                </label>
                                <input
                                    type="text"
                                    id="materialResourcesComment"
                                    value={materialResourcesComment}
                                    onChange={(e) => {
                                        setMaterialResourcesComment(
                                            e.target.value
                                        );
                                        listenCommentInput(
                                            e as React.FormEvent<HTMLInputElement>,
                                            "sendMaterialResourcesCommentButton"
                                        );
                                    }}
                                />
                                <div className="flex justify-end gap-4 mt-2">
                                    <SecondaryButton
                                        id="sendMaterialResourcesCommentButton"
                                        disabled={
                                            materialResourcesButtonDisabled
                                        }
                                        onClick={() => {
                                            sendComment(
                                                materialResourcesComment,
                                                EvidenceCategories.MATERIAL
                                            );
                                            setMaterialResourcesComment("");
                                            setMaterialResourcesButtonDisabled(
                                                true
                                            );
                                        }}
                                    >
                                        Enviar comentario
                                    </SecondaryButton>
                                </div>
                            </>
                        )}
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
                    {deliveryReception.value!.status ===
                        DeliveryReceptionStatusCodes.PENDING &&
                        !userProfile.roles.includes(UserRoles.WORKER) && (
                            <>
                                <label
                                    htmlFor="humanResourcesComment"
                                    className="mt-4 block"
                                >
                                    Escribe un comentario sobre los Recursos
                                    Humanos (si lo deseas) antes de querer
                                    enviarlo
                                </label>
                                <input
                                    type="text"
                                    id="humanResourcesComment"
                                    value={humanResourcesComment}
                                    onChange={(e) => {
                                        setHumanResourcesComment(
                                            e.target.value
                                        );
                                        listenCommentInput(
                                            e as React.FormEvent<HTMLInputElement>,
                                            "sendHumanResourcesCommentButton"
                                        );
                                    }}
                                />
                                <div className="flex justify-end gap-4 mt-2">
                                    <SecondaryButton
                                        id="sendHumanResourcesCommentButton"
                                        disabled={humanResourcesButtonDisabled}
                                        onClick={() => {
                                            sendComment(
                                                humanResourcesComment,
                                                EvidenceCategories.HUMAN
                                            );
                                            setHumanResourcesComment("");
                                            setHumanResourcesButtonDisabled(
                                                true
                                            );
                                        }}
                                    >
                                        Enviar comentario
                                    </SecondaryButton>
                                </div>
                            </>
                        )}
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
                    {deliveryReception.value!.status ===
                        DeliveryReceptionStatusCodes.PENDING &&
                        !userProfile.roles.includes(UserRoles.WORKER) && (
                            <>
                                <label
                                    htmlFor="procedureReportComment"
                                    className="mt-4 block"
                                >
                                    Escribe un comentario sobre el Informe de
                                    Asuntos en Trámite (si lo deseas) antes de
                                    querer enviarlo
                                </label>
                                <input
                                    type="text"
                                    id="procedureReportComment"
                                    value={procedureReportComment}
                                    onChange={(e) => {
                                        setProcedureReportComment(
                                            e.target.value
                                        );
                                    }}
                                />
                                <div className="flex justify-end gap-4 mt-2">
                                    <SecondaryButton
                                        id="sendProcedureReportCommentButton"
                                        disabled={procedureReportButtonDisabled}
                                        onClick={() => {
                                            sendComment(
                                                procedureReportComment,
                                                EvidenceCategories.REPORT
                                            );
                                            setProcedureReportComment("");
                                            setProcedureReportButtonDisabled(
                                                true
                                            );
                                        }}
                                    >
                                        Enviar comentario
                                    </SecondaryButton>
                                </div>
                            </>
                        )}
                </details>

                <details className="mb-4">
                    <summary>VII. OTROS HECHOS</summary>
                    <div className="mt-4">
                        <p className="text-justify text-lg">
                            {deliveryReception.value!.otherFacts}
                        </p>
                    </div>
                    {deliveryReception.value!.status ===
                        DeliveryReceptionStatusCodes.PENDING &&
                        !userProfile.roles.includes(UserRoles.WORKER) && (
                            <>
                                <label
                                    htmlFor="otherFactsComment"
                                    className="mt-4 block"
                                >
                                    Escribe un comentario sobre los Otros Hechos
                                    (si lo deseas) antes de querer enviarlo
                                </label>
                                <input
                                    type="text"
                                    id="otherFactsComment"
                                    value={otherFactsComment}
                                    onChange={(e) => {
                                        setOtherFactsComment(e.target.value);
                                        listenCommentInput(
                                            e as React.FormEvent<HTMLInputElement>,
                                            "sendOtherFactsCommentButton"
                                        );
                                    }}
                                />
                                <div className="flex justify-end gap-4 mt-2">
                                    <SecondaryButton
                                        id="sendOtherFactsCommentButton"
                                        disabled={otherFactsButtonDisabled}
                                        onClick={() => {
                                            sendComment(
                                                otherFactsComment,
                                                EvidenceCategories.OTHER
                                            );
                                            setOtherFactsComment("");
                                            setOtherFactsButtonDisabled(true);
                                        }}
                                    >
                                        Enviar comentario
                                    </SecondaryButton>
                                </div>
                            </>
                        )}
                </details>

                <div className="flex justify-center mt-6">
                    <TernaryButton onClick={mergeAndViewCombinedPdf}>
                        Ver entrega-recepción completa
                    </TernaryButton>
                </div>
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
                    (userProfile.roles.includes(UserRoles.WITNESS) ||
                        (userProfile.roles.includes(UserRoles.WORKER) &&
                            userProfile.userProfile!.employeeNumber ===
                                deliveryReception.value!
                                    .employeeNumberReceiver)) && (
                        <div className="flex justify-center gap-4 mt-5">
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
                    !userProfile.roles.includes(UserRoles.WITNESS) &&
                    !userProfile.roles.includes(UserRoles.WORKER) && (
                        <div className="flex justify-center items-center">
                            <p className="text-center mt-6 text-xl">
                                Esta entrega-recepción no ha sido aceptada por
                                ningún usuario involucrado
                            </p>
                        </div>
                    )}

                {deliveryReception.value!.status ===
                    DeliveryReceptionStatusCodes.IN_PROCESS &&
                    userProfile.roles.includes(UserRoles.WORKER) &&
                    userProfile.userProfile!.employeeNumber ===
                        deliveryReception.value!.employeeNumberReceiver && (
                        <div className="flex justify-center items-center">
                            <p className="text-center mt-6 text-xl">
                                Esta entrega-recepción no ha sido aceptada por
                                los dos testigos
                            </p>
                        </div>
                    )}

                {deliveryReception.value!.status ===
                    DeliveryReceptionStatusCodes.IN_PROCESS &&
                    userProfile.roles.includes(UserRoles.WITNESS) && (
                        <div className="flex justify-center items-center">
                            <p className="text-center mt-6 text-xl">
                                Ya aceptaste esta entrega-recepción, pero aún
                                falta que el otro testigo o el trabajador la
                                acepte.
                            </p>
                        </div>
                    )}

                {deliveryReception.value!.status ===
                    DeliveryReceptionStatusCodes.IN_PROCESS &&
                    !userProfile.roles.includes(UserRoles.WITNESS) &&
                    (userProfile.roles.includes(UserRoles.ZONE_MANAGER) ||
                        (userProfile.roles.includes(UserRoles.WORKER) &&
                            userProfile.userProfile!.employeeNumber ===
                                deliveryReception.value!
                                    .employeeNumberMaker)) && (
                        <div className="flex justify-center items-center">
                            <p className="text-center mt-6 text-xl">
                                Esta entrega-recepción ya fue aceptada por al
                                menos un testigo, pero aún faltan otros.
                            </p>
                        </div>
                    )}

                {deliveryReception.value!.status ===
                    DeliveryReceptionStatusCodes.RELEASED && (
                    <div className="flex justify-center items-center">
                        <p className="text-center mt-6 text-xl">
                            Esta entrega-recepción ya fue aceptada por todos los
                            usuarios involucrados, y ya se encuentra liberada.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};
