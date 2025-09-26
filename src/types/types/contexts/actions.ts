import { User } from "../model/users";

export enum AuthActionTypes {
    START_USER_SESSION = "[Auth] Start user session",
    END_SESSION = "[Auth] End session",
}

type AuthActions =
    | { type: AuthActionTypes.START_USER_SESSION; payload: User }
    | { type: AuthActionTypes.END_SESSION };

export type { AuthActions };
