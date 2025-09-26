import UserRoles from "@/types/enums/user_roles";

function getDefaultPageForRole(userRoles: UserRoles[]): string {
    let userRole = UserRoles.WORKER;

    if (userRoles.includes(UserRoles.ZONE_MANAGER)) {
        userRole = UserRoles.ZONE_MANAGER;
    }

    const DEFAULT_ROUTES_MAP = {
        [UserRoles.WORKER]: "/",
        [UserRoles.ZONE_MANAGER]: "/",
    };

    return DEFAULT_ROUTES_MAP[userRole];
}

function isRouteInRoutesArray(
    pathName: string,
    routesArray: (string | RegExp)[]
) {
    return routesArray.some((route) => {
        let isMatch = false;

        if (typeof route === "string") {
            isMatch = route === pathName;
        } else if (route instanceof RegExp) {
            isMatch = route.test(pathName);
        }

        return isMatch;
    });
}

export { getDefaultPageForRole, isRouteInRoutesArray };
