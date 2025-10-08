import { useCallback, useEffect, useRef, useState } from "react";
import sgerpCfeAPI from "@/utils/axios";
import { NotificationInfo } from "@/types/types/components/notifications";
import { NotificationTypes } from "@/types/enums/notifications";
import { isAxiosError } from "axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { HttpStatusCodes } from "@/types/enums/http";
import { notify } from "@/utils/notifications";
import { User } from "@/types/types/model/users";
import { DeleteUserErrorCodes } from "@/types/enums/error_codes";
import { UsersResponse } from "@/types/types/api/users";
import { useSearchParams } from "next/navigation";

type UsersListState = {
    loading: boolean;
    value: User[];
    error: null | string;
    stillUsersToLoad: boolean;
};

const INITIAL_USERS_LIST_STATE: UsersListState = {
    loading: false,
    value: [],
    error: null,
    stillUsersToLoad: true,
};

export function useUsers() {
    const searchParams = useSearchParams();
    const [usersList, setUsersList] = useState<UsersListState>(
        INITIAL_USERS_LIST_STATE
    );
    const savedScrollRef = useRef<number>(0);
    const bottomOfUsersListRef = useRef<HTMLDivElement | null>(null);

    const inFlightRef = useRef(false);

    const startUsersLoading = useCallback(() => {
        setUsersList((prev) => ({ ...prev, loading: true, error: null }));
    }, []);

    const finishUsersLoading = useCallback(
        (users: User[], stillUsersToLoad: boolean) => {
            setUsersList((prev) => ({
                loading: false,
                value: [...prev.value, ...users],
                error: null,
                stillUsersToLoad,
            }));
        },
        []
    );

    const fireErrorLoadingUsers = useCallback((message?: string) => {
        setUsersList((prev) => ({
            ...prev,
            loading: false,
            error:
                message ??
                "Estamos teniendo problemas para cargar los usuarios, por favor intente más tarde",
            stillUsersToLoad: false,
        }));
    }, []);

    const loadUsers = useCallback(
        async (
            usersBatchSize: number,
            totalUsersToOmit: number,
            searchQuery: string
        ) => {
            if (inFlightRef.current) return;
            inFlightRef.current = true;
            savedScrollRef.current = window.scrollY;

            startUsersLoading();
            try {
                const params: {
                    limit: number;
                    offset?: number;
                    query?: string;
                } = { limit: usersBatchSize };
                if (totalUsersToOmit > 0) params.offset = totalUsersToOmit;
                if (searchQuery) params.query = searchQuery;

                console.log(params);

                const { data: users } = await sgerpCfeAPI.get<UsersResponse>(
                    "/users",
                    { params }
                );

                const stillUsersToLoad = users.length >= usersBatchSize;
                finishUsersLoading(users, stillUsersToLoad);
            } catch (error) {
                let message =
                    "Por el momento el sistema no se encuentra disponible, por favor intente más tarde";
                if (
                    isAxiosError(error) &&
                    isClientErrorHTTPCode(Number(error.response?.status)) &&
                    error.response?.status !== HttpStatusCodes.TOO_MANY_REQUESTS
                ) {
                    message =
                        "No se pudieron obtener los usuarios porque el administrador no se pudo identificar";
                }
                fireErrorLoadingUsers(message);
            } finally {
                inFlightRef.current = false;
            }
        },
        [startUsersLoading, finishUsersLoading, fireErrorLoadingUsers]
    );

    useEffect(() => {
        const searchQuery = searchParams.get("busqueda") || "";
        if (searchQuery === undefined || searchQuery === null) return;

        setUsersList(INITIAL_USERS_LIST_STATE);
        loadUsers(12, 0, searchQuery);
    }, [loadUsers, searchParams]);

    useEffect(() => {
        const searchQuery = searchParams.get("busqueda") || "";
        if (usersList.value.length === 0) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    !usersList.loading &&
                    usersList.stillUsersToLoad
                ) {
                    loadUsers(12, usersList.value.length, searchQuery);
                }
            },
            { rootMargin: "0px", threshold: 0.1 }
        );

        const target = bottomOfUsersListRef.current;
        if (target) observer.observe(target);

        return () => observer.disconnect();
    }, [
        usersList.value.length,
        loadUsers,
        searchParams,
        usersList.loading,
        usersList.stillUsersToLoad,
    ]);

    useEffect(() => {
        if (savedScrollRef.current > 0) {
            window.scrollTo(0, savedScrollRef.current);
            savedScrollRef.current = 0;
        }
    }, [usersList.value.length]);

    const deleteUser = useCallback(async (id: number) => {
        try {
            await sgerpCfeAPI.delete(`/users/${id}`);
            setUsersList((prev) => ({
                ...prev,
                value: prev.value.filter((u) => u.id !== id),
            }));
        } catch (error) {
            const notificationInfo: NotificationInfo = {
                title: "Servicio no disponible",
                message:
                    "Por el momento el sistema no se encuentra disponible, por favor intente más tarde",
                type: NotificationTypes.ERROR,
            };

            if (
                isAxiosError(error) &&
                isClientErrorHTTPCode(Number(error.response?.status)) &&
                error.response?.status !== HttpStatusCodes.TOO_MANY_REQUESTS
            ) {
                const errorCode = error.response?.data?.errorCode;
                if (errorCode === DeleteUserErrorCodes.USER_NOT_FOUND) {
                    notificationInfo.title = "Usuario no encontrado";
                    notificationInfo.message =
                        "No se pudo eliminar el usuario porque no se encontró en el sistema";
                }
            }
            notify(notificationInfo);
        }
    }, []);

    return { usersList, bottomOfUsersListRef, deleteUser };
}
