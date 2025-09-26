import { User } from "../model/users";

type LoginResponse = User & {
    token: string;
};

type GetProfileResponse = User;

export type { LoginResponse, GetProfileResponse };
