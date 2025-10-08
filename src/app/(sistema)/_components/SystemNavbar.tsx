"use client";
import { LogoutButton } from "@/components/buttons/LogoutButton";
import { Navbar } from "@/components/ui/Navbar";
import AuthContext from "@/contexts/auth/context";
import UserRoles from "@/types/enums/user_roles";
import { NavbarLink } from "@/types/types/components/navbar";
import { useContext, useMemo } from "react";

export const SystemNavbar = () => {
    const { roles } = useContext(AuthContext);
    const workerLinks = useMemo<NavbarLink[]>(
        () => [
            {
                label: "Entregas-Recepciones realizadas",
                route: "/entregas-recepciones-realizadas",
            },
            {
                label: "Entregas-Recepciones recibidas",
                route: "/entregas-recepciones-recibidas",
            },
        ],
        []
    );
    const zoneManagerLinks = useMemo<NavbarLink[]>(
        () => [
            {
                label: "Entregas-Recepciones pendientes",
                route: "/entregas-recepciones-pendientes",
            },
            {
                label: "Entregas-Recepciones en proceso",
                route: "/entregas-recepciones-en-proceso",
            },
            {
                label: "Entregas-Recepciones liberadas",
                route: "/entregas-recepciones-liberadass",
            },
        ],
        []
    );
    const adminLinks = useMemo<NavbarLink[]>(
        () => [...zoneManagerLinks, { label: "Usuarios", route: "/usuarios" }],
        [zoneManagerLinks]
    );

    return (
        <div className="px-3 md:px-12 max-w-screen-2xl py-2 md:py-5 mx-auto flex md:items-center justify-between">
            <Navbar
                links={
                    roles.includes(UserRoles.WORKER)
                        ? workerLinks
                        : roles.includes(UserRoles.ADMINISTRATOR)
                        ? adminLinks
                        : roles.includes(UserRoles.ZONE_MANAGER)
                        ? zoneManagerLinks
                        : []
                }
            />
            <div>
                <LogoutButton />
            </div>
        </div>
    );
};
