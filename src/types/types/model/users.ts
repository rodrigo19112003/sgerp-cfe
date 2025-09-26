import UserRoles from "@/types/enums/user_roles";

type User = {
    id: number;
    employeeNumber: string;
    fullName: string;
    email: string;
    roles: UserRoles[];
};

export type { User };
