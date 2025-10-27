import { EndpointContexts } from "./endpoint_contexts";

enum DeleteUserErrorCodes {
    USER_NOT_FOUND = EndpointContexts.DELETE_USER + "-400001",
}

enum CreateOrUpdateUserErrorCodes {
    ROLE_NOT_FOUND = EndpointContexts.CREATE_UPDATE_USER + "-400001",
    TWO_WITNESSES_ALREADY_EXIST = EndpointContexts.CREATE_UPDATE_USER +
        "-400002",
    EMPLOYEE_NUMBER_ALREADY_EXIST = EndpointContexts.CREATE_UPDATE_USER +
        "-400003",
    EMAIL_ALREADY_EXIST = EndpointContexts.CREATE_UPDATE_USER + "-400004",
    USER_NOT_FOUND = EndpointContexts.CREATE_UPDATE_USER + "-400005",
}

enum DeleteDeliveryReceptionMadeErrorCodes {
    DELIVERY_RECEPTION_MADE_NOT_FOUND = EndpointContexts.DELETE_DELIVERY_RECEPTION_MADE +
        "-400001",
    DELIVERY_RECEPTION_MADE_CANNOT_BE_DELETED = EndpointContexts.DELETE_DELIVERY_RECEPTION_MADE +
        "-400002",
}

enum CreateOrUpdateDeliveryReceptionErrorCodes {
    CATEGORY_NOT_FOUND = EndpointContexts.CREATE_UPDATE_DELIVERY_RECEPTION +
        "-400001",
    RECEIVING_WORKER_NOT_FOUND = EndpointContexts.CREATE_UPDATE_DELIVERY_RECEPTION +
        "-400002",
    DELIVERY_RECEPTION_ALREADY_EXISTS_FOR_WORKER = EndpointContexts.CREATE_UPDATE_DELIVERY_RECEPTION +
        "-400003",
    DELIVERY_RECEPTION_NOT_FOUND = EndpointContexts.CREATE_UPDATE_DELIVERY_RECEPTION +
        "-400004",
    DELIVERY_RECEPTION_CANNOT_BE_MODIFIED = EndpointContexts.CREATE_UPDATE_DELIVERY_RECEPTION +
        "-400005",
}

export {
    DeleteUserErrorCodes,
    CreateOrUpdateUserErrorCodes,
    DeleteDeliveryReceptionMadeErrorCodes,
    CreateOrUpdateDeliveryReceptionErrorCodes,
};
