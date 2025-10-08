import { EndpointContexts } from "./endpoint_contexts";

enum DeleteUserErrorCodes {
    USER_NOT_FOUND = EndpointContexts.DELETE_USER + "-400001",
}

enum CreateUserErrorCodes {
    ROLE_NOT_FOUND = EndpointContexts.CREATE_USER + "-400001",
    TWO_WITNESSES_ALREADY_EXIST = EndpointContexts.CREATE_USER + "-400002",
}

export { DeleteUserErrorCodes, CreateUserErrorCodes };
