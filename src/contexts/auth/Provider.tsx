"use client";
import {
    FC,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from "react";
import Cookies from "js-cookie";
import AuthContext from "./context";
import UserRoles from "@/types/enums/user_roles";
import { authReducer } from "./reducer";
import { AuthState } from "@/types/types/contexts/states";
import { User } from "@/types/types/model/users";
import { AuthActionTypes } from "@/types/types/contexts/actions";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import sgerpCfeAPI from "@/utils/axios";
import { GetProfileResponse } from "@/types/types/api/auth";
import {
    ADMIN_ROUTES,
    GUEST_ROUTES,
    WORKER_ROUTES,
    ZONE_MANAGER_ROUTES,
    WITNESS_ROUTES,
} from "@/utils/constants";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { getDefaultPageForRole, isRouteInRoutesArray } from "@/utils/routing";

type AuthProviderProps = {
    children: ReactNode;
};

const AUTH_BASE_STATE: AuthState = {
    roles: [UserRoles.GUEST],
    userProfile: null,
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, AUTH_BASE_STATE);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const ROUTE_ROLE_MAP = useMemo(
        () => ({
            [UserRoles.ADMINISTRATOR]: ADMIN_ROUTES,
            [UserRoles.GUEST]: GUEST_ROUTES,
            [UserRoles.WITNESS]: WITNESS_ROUTES,
            [UserRoles.WORKER]: WORKER_ROUTES,
            [UserRoles.ZONE_MANAGER]: ZONE_MANAGER_ROUTES,
        }),
        []
    );

    const startSession = useCallback((profile: User) => {
        dispatch({
            type: AuthActionTypes.START_USER_SESSION,
            payload: profile,
        });
    }, []);

    const redirectToRequestedPage = useCallback(
        (profileRoles: UserRoles[]) => {
            const requestedPage = searchParams.get("p");

            router.replace(
                requestedPage ?? getDefaultPageForRole(profileRoles)
            );
        },
        [router, searchParams]
    );

    const login = useCallback(
        (profile: User) => {
            startSession(profile);
            redirectToRequestedPage(profile.roles);
        },
        [redirectToRequestedPage, startSession]
    );

    const logout = useCallback(() => {
        Cookies.remove("token");
        dispatch({ type: AuthActionTypes.END_SESSION });
        router.replace("/");
    }, [router]);

    const refreshSession = useCallback(async () => {
        try {
            const { data: profile } = await sgerpCfeAPI.get<GetProfileResponse>(
                "/sessions/profile"
            );
            startSession(profile);
        } catch {
            logout();
        } finally {
            setIsLoadingProfile(false);
        }
    }, [startSession, logout]);

    useEffect(() => {
        const isProtectedPage =
            (isRouteInRoutesArray(pathname, ADMIN_ROUTES) ||
                isRouteInRoutesArray(pathname, WORKER_ROUTES) ||
                isRouteInRoutesArray(pathname, WITNESS_ROUTES) ||
                isRouteInRoutesArray(pathname, ZONE_MANAGER_ROUTES)) &&
            Cookies.get("token");

        if (isProtectedPage && state.userProfile === null) {
            refreshSession();
        } else {
            setIsLoadingProfile(false);
        }
    }, [pathname, state.userProfile, refreshSession]);

    useEffect(() => {
        const userRoles = state.userProfile?.roles || [UserRoles.GUEST];

        const allowedRoutes: (string | RegExp)[] = userRoles.flatMap(
            (role) => ROUTE_ROLE_MAP[role] || []
        );

        const isAllowedRoute = isRouteInRoutesArray(pathname, allowedRoutes);

        if (!isAllowedRoute && !isLoadingProfile) {
            if (userRoles[0] === UserRoles.GUEST) {
                const login = `/?p=${pathname}`;
                router.replace(login);
            }

            router.replace(getDefaultPageForRole(userRoles));
        }
    }, [state.userProfile, pathname, ROUTE_ROLE_MAP, router, isLoadingProfile]);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
            }}
        >
            {isLoadingProfile ? <FullScreenLoader /> : children}
        </AuthContext.Provider>
    );
};
