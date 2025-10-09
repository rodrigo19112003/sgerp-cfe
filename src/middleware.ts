import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import {
    ADMIN_ROUTES,
    GUEST_ROUTES,
    WITNESS_ROUTES,
    ZONE_MANAGER_ROUTES,
    WORKER_ROUTES,
} from "./utils/constants";
import { CustomPayload } from "./types/types/api//jwt";
import UserRoles from "./types/enums/user_roles";
import { getDefaultPageForRole, isRouteInRoutesArray } from "./utils/routing";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value ?? "";
    const requestedPage = request.nextUrl.pathname;
    let jwtPayload: CustomPayload | null = null;

    try {
        const secretKeyBuffer = new TextEncoder().encode(
            process.env.JWT_SECRET
        );
        const jwt = await jwtVerify(token, secretKeyBuffer);
        jwtPayload = jwt.payload as CustomPayload;
    } catch {}

    const ROUTE_ROLE_MAP = {
        [UserRoles.ADMINISTRATOR]: ADMIN_ROUTES,
        [UserRoles.GUEST]: GUEST_ROUTES,
        [UserRoles.WITNESS]: WITNESS_ROUTES,
        [UserRoles.WORKER]: WORKER_ROUTES,
        [UserRoles.ZONE_MANAGER]: ZONE_MANAGER_ROUTES,
    };

    const userRoles = jwtPayload?.userRoles || [UserRoles.GUEST];

    const allowedRoutes: (string | RegExp)[] = userRoles.flatMap(
        (role) => ROUTE_ROLE_MAP[role] || []
    );

    const isAllowedRoute = isRouteInRoutesArray(requestedPage, allowedRoutes);
    if (!isAllowedRoute) {
        if (userRoles[0] === UserRoles.GUEST) {
            const login = new URL(`/?p=${requestedPage}`, request.url);
            return NextResponse.redirect(login);
        }

        return NextResponse.redirect(
            new URL(getDefaultPageForRole(userRoles), request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/cambiar-contrasenia",
        "/entregas-recepciones-pendientes",
        "/entregas-recepciones-realizadas",
        "/usuarios",
        "/usuarios/nuevo",
        "/usuarios/edicion/[employeeNumber]",
    ],
};
