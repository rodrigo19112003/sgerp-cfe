import UserRoles from "@/types/enums/user_roles";
import { AuthActions, AuthActionTypes } from "@/types/types/contexts/actions";
import { AuthState } from "@/types/types/contexts/states";

export function authReducer(state: AuthState, action: AuthActions): AuthState {
    switch (action.type) {
        case AuthActionTypes.START_USER_SESSION:
            return {
                ...state,
                roles: action.payload.roles,
                userProfile: action.payload,
            };
        case AuthActionTypes.END_SESSION:
            return {
                ...state,
                roles: [UserRoles.GUEST],
                userProfile: null,
            };
        default:
            return state;
    }
}
