import { HttpStatusCodes } from "@/types/enums/http";
import { NotificationTypes } from "@/types/enums/notifications";
import sgerpCfeAPI from "@/utils/axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { notify } from "@/utils/notifications";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { NotificationInfo } from "@/types/types/components/notifications";
import { CreateOrUpdateDeliveryReceptionErrorCodes } from "@/types/enums/error_codes";
import { useRouter } from "next/navigation";
import {
    DeliveryReceptionWithAllInformation,
    IFile,
} from "@/types/types/model/deliveries_receptions";
import EvidenceCategories from "@/types/enums/evidence_categories";

type UseDeliveryReceptionFormProps = {
    isEdition: boolean;
    deliveryReceptionId: number;
};

type DeliveryReceptionInformationForm = {
    generalData: string;
    otherFacts: string;
    procedureReport: string;
    financialResources: string;
    humanResources: string;
    materialResources: string;
    areaBudgetStatus: string;
    programmaticStatus: string;
    procedureReportFile: FileList | null;
    financialResourcesFile: FileList | null;
    humanResourcesFile: FileList | null;
    materialResourcesFile: FileList | null;
    areaBudgetStatusFile: FileList | null;
    programmaticStatusFile: FileList | null;
    employeeNumberReceiver: string;
};

type DeliveryReceptionState = {
    loading: boolean;
    value: null | DeliveryReceptionWithAllInformation;
    error: null | string;
};

const INITIAL_DELIVERY_RECEPTION_STATE: DeliveryReceptionState = {
    loading: true,
    value: null,
    error: null,
};

export function useDeliveryReceptionForm({
    isEdition,
    deliveryReceptionId,
}: UseDeliveryReceptionFormProps) {
    const [
        isLoadingRegisteringDeliveryReception,
        setIsLoadingRegisteringDeliveryReception,
    ] = useState(false);
    const [deliveryReception, setDeliveryReception] = useState(
        INITIAL_DELIVERY_RECEPTION_STATE
    );
    const hasLoaded = useRef(false);
    const FORM_INITIAL_VALUES = useMemo(
        () => ({
            generalData: "",
            otherFacts: "",
            procedureReport: "",
            financialResources: "",
            humanResources: "",
            materialResources: "",
            areaBudgetStatus: "",
            programmaticStatus: "",
            procedureReportFile: null,
            financialResourcesFile: null,
            humanResourcesFile: null,
            materialResourcesFile: null,
            areaBudgetStatusFile: null,
            programmaticStatusFile: null,
            employeeNumberReceiver: "",
        }),
        []
    );
    const router = useRouter();

    const {
        register,
        trigger,
        handleSubmit: submitWrapper,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: FORM_INITIAL_VALUES,
        mode: "onChange",
        reValidateMode: "onChange",
        shouldUnregister: false,
    });

    const finishLoadingDeliveryReception = useCallback(
        (deliveryReception: DeliveryReceptionWithAllInformation) => {
            setDeliveryReception({
                loading: false,
                value: deliveryReception,
                error: null,
            });
        },
        []
    );

    const fireErrorLoadingDeliveryReception = useCallback((message: string) => {
        setDeliveryReception({
            loading: false,
            value: null,
            error:
                message ??
                "Estamos teniendo problemas para cargar la entrega-recepción, por favor inténtelo más tarde",
        });
    }, []);

    const loadDeliveryReception = useCallback(async () => {
        try {
            const { data: deliveryReception } = await sgerpCfeAPI.get(
                `/deliveries-receptions/${deliveryReceptionId}`
            );

            reset({
                ...deliveryReception,
            });

            finishLoadingDeliveryReception(deliveryReception);
        } catch (error) {
            let message =
                "Por el momento el sistema no se encuentra disponible, por favor intente más tarde";
            if (
                isAxiosError(error) &&
                isClientErrorHTTPCode(Number(error.response?.status)) &&
                error.response?.status !== HttpStatusCodes.TOO_MANY_REQUESTS
            ) {
                message =
                    "Hubo un error al cargar la entrega-recepción, ya que no se pudo localizar en el servidor";
            }
            fireErrorLoadingDeliveryReception(message);
        }
    }, [
        finishLoadingDeliveryReception,
        fireErrorLoadingDeliveryReception,
        deliveryReceptionId,
        reset,
    ]);

    useEffect(() => {
        if (hasLoaded.current) return;
        loadDeliveryReception();
        hasLoaded.current = true;
    }, [loadDeliveryReception]);

    const onSubmit: SubmitHandler<DeliveryReceptionInformationForm> = async ({
        generalData,
        procedureReport,
        otherFacts,
        financialResources,
        humanResources,
        materialResources,
        areaBudgetStatus,
        programmaticStatus,
        procedureReportFile,
        financialResourcesFile,
        humanResourcesFile,
        materialResourcesFile,
        areaBudgetStatusFile,
        programmaticStatusFile,
        employeeNumberReceiver,
    }) => {
        setIsLoadingRegisteringDeliveryReception(true);

        generalData = generalData.trim();
        procedureReport = procedureReport.trim();
        otherFacts = otherFacts.trim();
        financialResources = financialResources.trim();
        humanResources = humanResources.trim();
        materialResources = materialResources.trim();
        areaBudgetStatus = areaBudgetStatus.trim();
        programmaticStatus = programmaticStatus.trim();

        const fileToBase64 = (
            file: File,
            category: EvidenceCategories
        ): Promise<IFile> =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const base64Content = (reader.result as string).split(
                        ","
                    )[1];
                    resolve({
                        category,
                        name: file.name,
                        content: base64Content,
                    });
                };
                reader.onerror = (error) => reject(error);
            });

        const [
            procedureReportIFile,
            financialResourcesIFile,
            humanResourcesIFile,
            materialResourcesIFile,
            areaBudgetStatusIFile,
            programmaticStatusIFile,
        ] = await Promise.all([
            procedureReportFile?.[0] instanceof File
                ? fileToBase64(
                      procedureReportFile[0],
                      EvidenceCategories.REPORT
                  )
                : Promise.resolve(deliveryReception.value!.procedureReportFile),
            financialResourcesFile?.[0] instanceof File
                ? fileToBase64(
                      financialResourcesFile[0],
                      EvidenceCategories.FINANCE
                  )
                : Promise.resolve(
                      deliveryReception.value!.financialResourcesFile
                  ),
            humanResourcesFile?.[0] instanceof File
                ? fileToBase64(humanResourcesFile[0], EvidenceCategories.HUMAN)
                : Promise.resolve(deliveryReception.value!.humanResourcesFile),
            materialResourcesFile?.[0] instanceof File
                ? fileToBase64(
                      materialResourcesFile[0],
                      EvidenceCategories.MATERIAL
                  )
                : Promise.resolve(
                      deliveryReception.value!.materialResourcesFile
                  ),
            areaBudgetStatusFile?.[0] instanceof File
                ? fileToBase64(
                      areaBudgetStatusFile[0],
                      EvidenceCategories.BUDGET
                  )
                : Promise.resolve(
                      deliveryReception.value!.areaBudgetStatusFile
                  ),
            programmaticStatusFile?.[0] instanceof File
                ? fileToBase64(
                      programmaticStatusFile[0],
                      EvidenceCategories.PROGRAMMATIC
                  )
                : Promise.resolve(
                      deliveryReception.value!.programmaticStatusFile
                  ),
        ]);

        try {
            const requestBodyToCreateDeliveryReception = {
                employeeNumberReceiver,
                generalData,
                procedureReport,
                otherFacts,
                financialResources,
                humanResources,
                materialResources,
                areaBudgetStatus,
                programmaticStatus,
                procedureReportFile: procedureReportIFile,
                financialResourcesFile: financialResourcesIFile,
                humanResourcesFile: humanResourcesIFile,
                materialResourcesFile: materialResourcesIFile,
                areaBudgetStatusFile: areaBudgetStatusIFile,
                programmaticStatusFile: programmaticStatusIFile,
            };

            const requestBodyToUpdateDeliveryReception = {
                employeeNumberReceiver,
                generalData,
                procedureReport,
                otherFacts,
                financialResources,
                humanResources,
                materialResources,
                areaBudgetStatus,
                programmaticStatus,
                procedureReportFile: procedureReportIFile,
                financialResourcesFile: financialResourcesIFile,
                humanResourcesFile: humanResourcesIFile,
                materialResourcesFile: materialResourcesIFile,
                areaBudgetStatusFile: areaBudgetStatusIFile,
                programmaticStatusFile: programmaticStatusIFile,
            };

            let notificationInfo: NotificationInfo;

            if (!isEdition) {
                await sgerpCfeAPI.post(
                    "/deliveries-receptions",
                    requestBodyToCreateDeliveryReception
                );

                notificationInfo = {
                    title: "Entrega-Recepción registrada correctamente",
                    message:
                        "La entrega-recepción se registró correctamente en el sistema y se le envió a todos los involucrados",
                    type: NotificationTypes.SUCCESS,
                };
            } else {
                await sgerpCfeAPI.put(
                    `/deliveries-receptions/${deliveryReception.value!.id}`,
                    requestBodyToUpdateDeliveryReception
                );

                notificationInfo = {
                    title: "Entrega-Recepción actualizada correctamente",
                    message:
                        "La entrega-recepción se actualizó correctamente en el sistema y se le envió un correo a todos los involucrados notificándoles de los cambios",
                    type: NotificationTypes.SUCCESS,
                };
            }

            notify(notificationInfo);
            router.push("/entregas-recepciones-realizadas");
        } catch (error) {
            console.log(error);
            const notificationInfo: NotificationInfo = {
                title: "Servicio no disponible",
                message:
                    "Por el momento el sistema no se encuentra disponible, por favor intente más tarde",
                type: NotificationTypes.ERROR,
            };

            if (
                isAxiosError(error) &&
                isClientErrorHTTPCode(Number(error.response?.status)) &&
                error.response?.status !== HttpStatusCodes.TOO_MANY_REQUESTS
            ) {
                if (error.response?.data?.errorCode) {
                    switch (error.response.data.errorCode) {
                        case CreateOrUpdateDeliveryReceptionErrorCodes.CATEGORY_NOT_FOUND:
                            notificationInfo.title = "Categoría no encontrada";
                            notificationInfo.message =
                                "No se pudo encontrar la categoría asociada a la entrega-recepción.";
                            notificationInfo.type = NotificationTypes.ERROR;
                            break;
                        case CreateOrUpdateDeliveryReceptionErrorCodes.RECEIVING_WORKER_NOT_FOUND:
                            notificationInfo.title =
                                "Trabajador receptor no encontrado";
                            notificationInfo.message =
                                "No se pudo encontrar al trabajador receptor asignado para esta entrega-recepción.";
                            notificationInfo.type = NotificationTypes.ERROR;
                            break;
                        case CreateOrUpdateDeliveryReceptionErrorCodes.DELIVERY_RECEPTION_ALREADY_EXISTS_FOR_WORKER:
                            notificationInfo.title =
                                "Entrega-recepción ya registrada para el trabajador";
                            notificationInfo.message =
                                "Este trabajador ya tiene registrada una entrega-recepción, no se puede duplicar.";
                            notificationInfo.type = NotificationTypes.ERROR;
                            break;
                        case CreateOrUpdateDeliveryReceptionErrorCodes.DELIVERY_RECEPTION_NOT_FOUND:
                            notificationInfo.title =
                                "Entrega-recepción no encontrada";
                            notificationInfo.message =
                                "No se pudo encontrar la entrega-recepción que se quiere actualizar o visualizar.";
                            notificationInfo.type = NotificationTypes.ERROR;
                            break;
                        case CreateOrUpdateDeliveryReceptionErrorCodes.DELIVERY_RECEPTION_CANNOT_BE_MODIFIED:
                            notificationInfo.title =
                                "Entrega-recepción no modificable";
                            notificationInfo.message =
                                "Esta entrega-recepción no puede ser modificada debido a que ya se empezó a aceptar";
                            notificationInfo.type = NotificationTypes.ERROR;
                            break;
                    }
                }
            }

            notify(notificationInfo);
        } finally {
            setIsLoadingRegisteringDeliveryReception(false);
        }
    };
    const handleSubmit = submitWrapper(onSubmit);

    return {
        deliveryReception,
        register,
        trigger,
        errors,
        handleSubmit,
        isLoadingRegisteringDeliveryReception,
    };
}

export type { DeliveryReceptionInformationForm };
