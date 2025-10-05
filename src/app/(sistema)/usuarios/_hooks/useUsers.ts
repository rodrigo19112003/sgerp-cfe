import { useCallback, useEffect, useState } from "react";
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

type UsersState = {
    loading: boolean;
    value: User[] | [];
    error: null | string;
};

const INITIA_USERS_LIST_STATE = {
    loading: false,
    value: [],
    error: null,
};

export function useUsers() {
    const [users, setUsers] = useState<UsersState>(INITIA_USERS_LIST_STATE);

    const getUsers = useCallback(async () => {
        try {
            setUsers(() => ({
                loading: true,
                value: [],
                error: null,
            }));

            const { data } = await sgerpCfeAPI.get<UsersResponse>(`/users`);

            setUsers(() => ({
                loading: false,
                value: data,
                error: null,
            }));
        } catch (error) {
            let errorMessage =
                "Por el momento el sistema no se encuentra disponible, por favor intente más tarde";

            if (
                isAxiosError(error) &&
                isClientErrorHTTPCode(Number(error.response?.status)) &&
                error.response?.status !== HttpStatusCodes.TOO_MANY_REQUESTS
            ) {
                errorMessage =
                    "No se pudieron obtener los usuarios porque el administrador no se pudo identificar";
            }

            setUsers(() => ({
                loading: false,
                value: [],
                error: errorMessage,
            }));
        }
    }, []);

    const deleteUser = useCallback(async (id: number) => {
        try {
            await sgerpCfeAPI.delete(`/users/${id}`);

            setUsers((previousUsersState) => ({
                ...previousUsersState,
                value: previousUsersState.value!.filter(
                    (user) => user.id !== id
                ),
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
                    notificationInfo.type = NotificationTypes.ERROR;
                }
            }

            notify(notificationInfo);
        }
    }, []);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    return {
        users,
        deleteUser,
    };
}
