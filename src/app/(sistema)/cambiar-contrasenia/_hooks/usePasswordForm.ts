import { HttpStatusCodes } from "@/types/enums/http";
import { NotificationTypes } from "@/types/enums/notifications";
import sgerpCfeAPI from "@/utils/axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { notify } from "@/utils/notifications";
import { isAxiosError } from "axios";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { NotificationInfo } from "@/types/types/components/notifications";

type UserPasswordForm = {
    password: string;
    passwordConfirmation: string;
};

type UsePasswordFormOptions = {
    email: string;
    code: string;
    onSuccess: (code: string) => void;
    onError: () => void;
};

export function usePasswordForm({
    email,
    code,
    onSuccess,
    onError,
}: UsePasswordFormOptions) {
    const [isLoadingUpdatingPassword, setIsLoadingUpdatingPassword] =
        useState(false);
    const FORM_INITIAL_VALUES = useMemo(
        () => ({
            password: "",
            passwordConfirmation: "",
        }),
        []
    );

    const {
        register,
        handleSubmit: submitWrapper,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: FORM_INITIAL_VALUES,
    });

    const onSubmit: SubmitHandler<UserPasswordForm> = async ({ password }) => {
        setIsLoadingUpdatingPassword(true);

        password = password.trim();

        try {
            const requestBody = {
                email,
                code,
                password,
            };

            await sgerpCfeAPI.post(
                "/authentications/password-reset/change",
                requestBody
            );

            onSuccess(code);

            const notificationInfo: NotificationInfo = {
                title: "Contraseña cambiada correctamente",
                message:
                    "Ya se registró tu nueva contraseña, inicia sesión en el sistema con ella",
                type: NotificationTypes.SUCCESS,
            };

            notify(notificationInfo);
        } catch (error) {
            onError();

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
                notificationInfo.title = "Email inválido";
                notificationInfo.message =
                    "El email ingresado no se encuentra asociado a ninguna cuenta, verifíquelo e ingréselo de nuevo";
                notificationInfo.type = NotificationTypes.WARNING;
            }

            notify(notificationInfo);
        } finally {
            setIsLoadingUpdatingPassword(false);
        }
    };
    const handleSubmit = submitWrapper(onSubmit);

    return {
        register,
        errors,
        watch,
        handleSubmit,
        isLoadingUpdatingPassword,
    };
}
