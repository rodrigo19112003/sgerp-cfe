import { HttpStatusCodes } from "@/types/enums/http";
import { NotificationTypes } from "@/types/enums/notifications";
import sgerpCfeAPI from "@/utils/axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { notify } from "@/utils/notifications";
import { isAxiosError } from "axios";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { NotificationInfo } from "@/types/types/components/notifications";
import UserRoles from "@/types/enums/user_roles";
import { CreateUserErrorCodes } from "@/types/enums/error_codes";
import { useRouter } from "next/navigation";

type UserInformationForm = {
    employeeNumber: string;
    fullName: string;
    email: string;
    mainRole: string;
    extraRoles?: string[];
};

export function useUserRegistrationForm() {
    const [isLoadingRegisteringUser, setIsLoadingRegisteringUser] =
        useState(false);
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
    } = useForm({
        defaultValues: FORM_INITIAL_VALUES,
    });

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
            const requestBody = {
                employeeNumber,
                fullName,
                email,
                userRoles,
            };

            await sgerpCfeAPI.post("/users", requestBody);

            const notificationInfo: NotificationInfo = {
                title: "Usuario registrado correctamente",
                message:
                    "El usuario se registró correctamente en el sistema y se le envió un correo con sus credenciales",
                type: NotificationTypes.SUCCESS,
            };

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
                    CreateUserErrorCodes.ROLE_NOT_FOUND
                ) {
                    notificationInfo.title = "Un rol no fue encontrado";
                    notificationInfo.message =
                        "Uno de los roles que regsitraste no fue encontrado en el sistema, por lo que no puede registrar al usuario";
                    notificationInfo.type = NotificationTypes.ERROR;
                }
                if (
                    error.response?.data?.errorCode ===
                    CreateUserErrorCodes.TWO_WITNESSES_ALREADY_EXIST
                ) {
                    notificationInfo.title =
                        "Ya existen dos testigos registrados";
                    notificationInfo.message =
                        "No es posible registrar un testigo más. Deberá dar de baja uno de los registrados para registrar otro";
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
        register,
        errors,
        watch,
        handleSubmit,
        isLoadingRegisteringUser,
    };
}
