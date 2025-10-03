import { HttpStatusCodes } from "@/types/enums/http";
import { NotificationTypes } from "@/types/enums/notifications";
import sgerpCfeAPI from "@/utils/axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { notify } from "@/utils/notifications";
import { isAxiosError } from "axios";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { NotificationInfo } from "@/types/types/components/notifications";

type UserCodeForm = {
    code: string;
};

type UseCodeFormOptions = {
    email: string;
    onSuccess: (code: string) => void;
    onError: () => void;
};

export function useCodeForm({ email, onSuccess, onError }: UseCodeFormOptions) {
    const [isLoadingSendingValidationCode, setIsLoadingSendingValidationCode] =
        useState(false);
    const FORM_INITIAL_VALUES = useMemo(
        () => ({
            code: "",
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

    const onSubmit: SubmitHandler<UserCodeForm> = async ({ code }) => {
        setIsLoadingSendingValidationCode(true);

        code = code.trim();

        try {
            const requestBody = {
                email,
                code,
            };

            await sgerpCfeAPI.post(
                "/authentications/password-reset/verify",
                requestBody
            );

            onSuccess(code);
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
            setIsLoadingSendingValidationCode(false);
        }
    };
    const handleSubmit = submitWrapper(onSubmit);

    return {
        register,
        errors,
        handleSubmit,
        isLoadingSendingValidationCode,
    };
}
