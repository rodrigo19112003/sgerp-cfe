import UserRoles from "@/types/enums/user_roles";
import { JWTPayload } from "jose";

type CustomPayload = JWTPayload & {
    id: number;
    userRoles: UserRoles[];
};

export type { CustomPayload };
