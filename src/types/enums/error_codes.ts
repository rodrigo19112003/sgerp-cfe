import { EndpointContexts } from "./endpoint_contexts";

enum DeleteUserErrorCodes {
    USER_NOT_FOUND = EndpointContexts.DELETE_USER + "-400001",
}

export { DeleteUserErrorCodes };
