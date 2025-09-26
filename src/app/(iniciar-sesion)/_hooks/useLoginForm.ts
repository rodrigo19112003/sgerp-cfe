import { HttpStatusCodes } from "@/types/enums/http";
import { NotificationTypes } from "@/types/enums/notifications";
import { LoginResponse } from "@/types/types/api/auth";
import shopAndGoAPI from "@/utils/axios";
import { isClientErrorHTTPCode } from "@/utils/http";
import { notify } from "@/utils/notifications";
import { isAxiosError } from "axios";
import { useContext, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Cookies from "js-cookie";
import AuthContext from "@/contexts/auth/context";
import { NotificationInfo } from "@/types/types/components/notifications";

type UserLoginForm = {
    employeeNumber: string;
    password: string;
};

export function useLoginForm() {
    const { login } = useContext(AuthContext);
    const [isLoadingLogin, setIsLoadingLogin] = useState(false);
    const FORM_INITIAL_VALUES = useMemo(
        () => ({
            employeeNumber: "",
            password: "",
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

    const onSubmit: SubmitHandler<UserLoginForm> = async ({
        employeeNumber,
        password,
    }) => {
        setIsLoadingLogin(true);

        employeeNumber = employeeNumber.trim();
        password = password.trim();

        try {
            const requestBody = {
                employeeNumber,
                password,
            };

            const { data: profile } = await shopAndGoAPI.post<LoginResponse>(
                "/sessions",
                requestBody
            );

            Cookies.set("token", profile.token, { expires: 1 });
            login(profile);
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
                notificationInfo.title = "Credenciales inválidas";
                notificationInfo.message =
                    "Los datos ingresados son incorrectos, verifíquelos e intente de nuevo";
                notificationInfo.type = NotificationTypes.WARNING;
            }

            notify(notificationInfo);
        } finally {
            setIsLoadingLogin(false);
        }
    };
    const handleSubmit = submitWrapper(onSubmit);

    return {
        register,
        errors,
        handleSubmit,
        isLoadingLogin,
    };
}
