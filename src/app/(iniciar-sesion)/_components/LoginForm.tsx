import { EMPLOYEE_NUMBER_PATTERN } from "@/utils/regexp";
import { useLoginForm } from "../_hooks/useLoginForm";
import Link from "next/link";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";

export const LoginForm = () => {
    const { handleSubmit, errors, register, isLoadingLogin } = useLoginForm();

    return (
        <form onSubmit={handleSubmit}>
            <div
                className={`form-group ${
                    errors.employeeNumber ? "invalid" : ""
                }`}
            >
                <label htmlFor="employeeNumber">RTT o RPE</label>
                <input
                    {...register("employeeNumber", {
                        required: true,
                        maxLength: 5,
                        pattern: EMPLOYEE_NUMBER_PATTERN,
                    })}
                    id="employeeNumber"
                    type="text"
                />
                <p className="error">Registro personal inválido</p>
            </div>

            <div className={`form-group ${errors.password ? "invalid" : ""}`}>
                <label htmlFor="password">Contraseña</label>
                <input
                    {...register("password", {
                        required: true,
                        validate: (value) => value.trim() !== "",
                    })}
                    id="password"
                    type="password"
                />
                <p className="error">Ingrese su contraseña para continuar</p>
                <div className="mt-1 flex justify-start">
                    <Link
                        className="text-green-cfe"
                        href="/cambiar-contrasenia"
                    >
                        Cambiar contraseña
                    </Link>
                </div>
            </div>

            <div className="mt-5 flex justify-end">
                <PrimaryButton disabled={isLoadingLogin}>
                    {isLoadingLogin ? "Cargando..." : "Ingresar"}
                </PrimaryButton>
            </div>
        </form>
    );
};
