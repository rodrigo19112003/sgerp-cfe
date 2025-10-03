import { VALIDATION_PASSWORD_PATTERN } from "@/utils/regexp";
import { usePasswordForm } from "../_hooks/usePasswordForm";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";

interface PasswordFormProps {
    email: string;
    code: string;
    onStepCompleted: (completed: boolean, code?: string) => void;
}

export const PasswordForm = ({
    email,
    code,
    onStepCompleted,
}: PasswordFormProps) => {
    const { handleSubmit, errors, watch, register, isLoadingUpdatingPassword } =
        usePasswordForm({
            email,
            code,
            onSuccess: () => {
                onStepCompleted(true);
            },
            onError: () => {
                onStepCompleted(false);
            },
        });

    const password = watch("password");
    return (
        <form onSubmit={handleSubmit}>
            <h4>Deberá tener:</h4>
            <ul>
                <li>Entre 8 y 16 caracteres</li>
                <li>Al menos una letra mayúscula</li>
                <li>Al menos una letra minúscula</li>
                <li>Al menos un número</li>
                <li>Al menos un carácter especial: !$%&_¿?</li>
            </ul>
            <div className={`form-group ${errors.password ? "invalid" : ""}`}>
                <label htmlFor="password">Contraseña nueva</label>
                <input
                    {...register("password", {
                        required: true,
                        pattern: VALIDATION_PASSWORD_PATTERN,
                    })}
                    id="password"
                    type="password"
                />
                <p className="error">Contraseña inválida</p>
            </div>

            <div
                className={`form-group ${
                    errors.passwordConfirmation ? "invalid" : ""
                }`}
            >
                <label htmlFor="passwordConfirmation">
                    Confirma tu contraseña
                </label>
                <input
                    {...register("passwordConfirmation", {
                        required: true,
                        pattern: VALIDATION_PASSWORD_PATTERN,
                        validate: (value) => value === password,
                    })}
                    id="passwordConfirmation"
                    type="password"
                />
                <p className="error">Las contraseñas no coinciden</p>
            </div>

            <div className="mt-5 flex justify-end">
                <PrimaryButton disabled={isLoadingUpdatingPassword}>
                    {isLoadingUpdatingPassword
                        ? "Enviando..."
                        : "Cambiar contraseña"}
                </PrimaryButton>
            </div>
        </form>
    );
};
