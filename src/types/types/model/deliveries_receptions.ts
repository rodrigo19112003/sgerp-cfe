import DeliveryReceptionStatusCodes from "@/types/enums/delivery_reception_status_codes";
import EvidenceCategories from "@/types/enums/evidence_categories";

interface IFile {
    category: EvidenceCategories;
    name: string;
    content: string | Buffer;
}

type DeliveryReception = {
    id: number;
    status: DeliveryReceptionStatusCodes;
    employeeNumberReceiver?: string;
    fullNameReceiver?: string;
    employeeNumberMaker?: string;
    fullNameMaker?: string;
    deliveryReceptionId: number;
};

type DeliveryReceptionWithAllInformation = {
    id?: number;
    generalData?: string;
    otherFacts?: string;
    procedureReport?: string;
    financialResources?: string;
    humanResources?: string;
    materialResources?: string;
    areaBudgetStatus?: string;
    programmaticStatus?: string;
    procedureReportFile?: IFile;
    financialResourcesFile?: IFile;
    humanResourcesFile?: IFile;
    materialResourcesFile?: IFile;
    areaBudgetStatusFile?: IFile;
    programmaticStatusFile?: IFile;
    employeeNumberReceiver?: string;
    fullNameReceiver?: string;
    employeeNumberMaker?: string;
    fullNameMaker?: string;
    status: DeliveryReceptionStatusCodes;
};

type Comment = {
    id: number;
    text: string;
    zoneManagerEmployeeNumberAndFullName: string;
};

export type {
    DeliveryReception,
    DeliveryReceptionWithAllInformation,
    Comment,
    IFile,
};
