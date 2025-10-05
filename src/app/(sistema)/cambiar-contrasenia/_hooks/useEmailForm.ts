import { HttpStatusCodes } from "@/types/enums/http";
import { NotificationTypes } from "@/types/enums/notifications";
import sgerpCfeAPI from "@/utils/axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { notify } from "@/utils/notifications";
import { isAxiosError } from "axios";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { NotificationInfo } from "@/types/types/components/notifications";

type UserEmailForm = {
    email: string;
};

type UseEmailFormOptions = {
    onSuccess: (email: string) => void;
    onError: () => void;
};

export function useEmailForm({ onSuccess, onError }: UseEmailFormOptions) {
    const [isLoadingSendingCodeToEmail, setIsLoadingSendingCodeToEmail] =
        useState(false);
    const FORM_INITIAL_VALUES = useMemo(
        () => ({
            email: "",
        }),
        []
    );

    const {
        register,
        handleSubmit: submitWrapper,
        formState: { errors },
    } = useForm({
        defaultValues: FORM_INITIAL_VALUES,
    });

    const onSubmit: SubmitHandler<UserEmailForm> = async ({ email }) => {
        setIsLoadingSendingCodeToEmail(true);

        email = email.trim();

        try {
            const requestBody = {
                email,
            };

            await sgerpCfeAPI.post(
                "/authentications/password-reset/request",
                requestBody
            );

            onSuccess(email);
        } catch (error) {
            console.log(error);
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
            setIsLoadingSendingCodeToEmail(false);
        }
    };
    const handleSubmit = submitWrapper(onSubmit);

    return {
        register,
        errors,
        handleSubmit,
        isLoadingSendingCodeToEmail,
    };
}
