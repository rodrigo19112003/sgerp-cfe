import { AuthState } from "@/types/types/contexts/states";
import { User } from "@/types/types/model/users";
import { createContext } from "react";

type AuthContext = AuthState & {
    login: (profile: User) => void;
    logout: () => void;
};

const AuthContext = createContext({} as AuthContext);

export default AuthContext;
