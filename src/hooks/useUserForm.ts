import { HttpStatusCodes } from "@/types/enums/http";
import { NotificationTypes } from "@/types/enums/notifications";
import sgerpCfeAPI from "@/utils/axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { notify } from "@/utils/notifications";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { NotificationInfo } from "@/types/types/components/notifications";
import UserRoles from "@/types/enums/user_roles";
import { CreateOrUpdateUserErrorCodes } from "@/types/enums/error_codes";
import { useRouter } from "next/navigation";
import { User } from "@/types/types/model/users";

type UseUserFormProps = {
    isEdition: boolean;
    employeeNumber?: string;
};

type UserInformationForm = {
    employeeNumber: string;
    fullName: string;
    email: string;
    mainRole: string;
    extraRoles?: string[];
};

type UserState = {
    loading: boolean;
    value: null | User;
    error: null | string;
};

const INITIAL_USER_STATE: UserState = {
    loading: true,
    value: null,
    error: null,
};

export function useUserForm({ isEdition, employeeNumber }: UseUserFormProps) {
    const [isLoadingRegisteringUser, setIsLoadingRegisteringUser] =
        useState(false);
    const [user, setUser] = useState(INITIAL_USER_STATE);
    const hasLoaded = useRef(false);
    const FORM_INITIAL_VALUES = useMemo(
        () => ({
            employeeNumber: "",
            fullName: "",
            email: "",
            mainRole: "",
            extraRoles: [],
        }),
        []
    );
    const router = useRouter();

    const {
        register,
        handleSubmit: submitWrapper,
        formState: { errors },
        watch,
        reset,
        setValue,
    } = useForm({
        defaultValues: FORM_INITIAL_VALUES,
    });

    const finishLoadingUser = useCallback((user: User) => {
        setUser({
            loading: false,
            value: user,
            error: null,
        });
    }, []);

    const fireErrorLoadingUser = useCallback((message: string) => {
        setUser({
            loading: false,
            value: null,
            error:
                message ??
                "Estamos teniendo problemas para cargar al usuario, por favor inténtelo más tarde",
        });
    }, []);

    const loadUser = useCallback(async () => {
        try {
            const { data: user } = await sgerpCfeAPI.get(
                `/users/${employeeNumber}`
            );

            const mainRole = user.roles.includes(UserRoles.WORKER)
                ? UserRoles.WORKER
                : UserRoles.ZONE_MANAGER;

            const extraRoles: string[] = [];

            if (user.roles.includes(UserRoles.WITNESS)) {
                extraRoles.push(UserRoles.WITNESS);
            } else if (user.roles.includes(UserRoles.ADMINISTRATOR)) {
                extraRoles.push(UserRoles.ADMINISTRATOR);
            }

            reset({
                ...user,
                mainRole,
                extraRoles,
            });
            finishLoadingUser(user);
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
            fireErrorLoadingUser(message);
        }
    }, [finishLoadingUser, fireErrorLoadingUser, reset, employeeNumber]);

    useEffect(() => {
        if (hasLoaded.current) return;
        loadUser();
        hasLoaded.current = true;
    }, [loadUser]);

    const onSubmit: SubmitHandler<UserInformationForm> = async ({
        employeeNumber,
        fullName,
        email,
        mainRole,
        extraRoles,
    }) => {
        setIsLoadingRegisteringUser(true);
        const userRoles: UserRoles[] = [];
        extraRoles = extraRoles || [];

        employeeNumber = employeeNumber.trim();
        fullName = fullName.trim();
        email = email.trim();
        userRoles.push(mainRole as UserRoles);
        if (extraRoles.length >= 1) {
            userRoles.push(...(extraRoles as UserRoles[]));
        }

        try {
            const requestBodyToCreateUser = {
                employeeNumber,
                fullName,
                email,
                userRoles,
            };

            const requestBodyToUpdateteUser = {
                employeeNumber,
                fullName,
                userRoles,
            };

            let notificationInfo: NotificationInfo;

            if (!isEdition) {
                await sgerpCfeAPI.post("/users", requestBodyToCreateUser);

                notificationInfo = {
                    title: "Usuario registrado correctamente",
                    message:
                        "El usuario se registró correctamente en el sistema y se le envió un correo con sus credenciales",
                    type: NotificationTypes.SUCCESS,
                };
            } else {
                await sgerpCfeAPI.put(
                    `/users/${user.value!.id}`,
                    requestBodyToUpdateteUser
                );

                notificationInfo = {
                    title: "Usuario actualizado correctamente",
                    message:
                        "El usuario se actualizó correctamente en el sistema y se le envió un correo notificándole de los cambios",
                    type: NotificationTypes.SUCCESS,
                };
            }

            notify(notificationInfo);
            router.push("/usuarios");
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
                if (
                    error.response?.data?.errorCode ===
                    CreateOrUpdateUserErrorCodes.ROLE_NOT_FOUND
                ) {
                    notificationInfo.title = "Un rol no fue encontrado";
                    notificationInfo.message =
                        "Uno de los roles que regsitraste no fue encontrado en el sistema, por lo que no puede registrar al usuario";
                    notificationInfo.type = NotificationTypes.ERROR;
                }
                if (
                    error.response?.data?.errorCode ===
                    CreateOrUpdateUserErrorCodes.TWO_WITNESSES_ALREADY_EXIST
                ) {
                    notificationInfo.title =
                        "Ya existen dos testigos registrados";
                    notificationInfo.message =
                        "No es posible registrar un testigo más. Deberá dar de baja uno de los registrados para registrar otro";
                    notificationInfo.type = NotificationTypes.ERROR;
                }
                if (
                    error.response?.data?.errorCode ===
                    CreateOrUpdateUserErrorCodes.EMPLOYEE_NUMBER_ALREADY_EXIST
                ) {
                    notificationInfo.title =
                        "Ya existe un usuario con el mismo RPE/RTT";
                    notificationInfo.message =
                        "No es posible registrar más de un usuario con el mismo RPE/RTT, ya que este es único";
                    notificationInfo.type = NotificationTypes.ERROR;
                }
                if (
                    error.response?.data?.errorCode ===
                    CreateOrUpdateUserErrorCodes.USER_NOT_FOUND
                ) {
                    notificationInfo.title = "No se encontró el usuario";
                    notificationInfo.message =
                        "No se pudo encontrar el usuario que se quiere actualizar, ya no existe en el sistema";
                    notificationInfo.type = NotificationTypes.ERROR;
                }
            }

            notify(notificationInfo);
        } finally {
            setIsLoadingRegisteringUser(false);
        }
    };
    const handleSubmit = submitWrapper(onSubmit);

    return {
        user,
        register,
        errors,
        watch,
        setValue,
        handleSubmit,
        isLoadingRegisteringUser,
    };
}
