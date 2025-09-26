import UserRoles from "@/types/enums/user_roles";
import { User } from "../model/users";

type AuthState = {
    roles: UserRoles[];
    userProfile: User | null;
};

export type { AuthState };
