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

export { DeleteUserErrorCodes, CreateOrUpdateUserErrorCodes };
