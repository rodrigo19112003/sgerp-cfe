import { EMAIL_PATTERN } from "@/utils/regexp";
import { useEmailForm } from "../_hooks/useEmailForm";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";

interface EmailFormProps {
    onStepCompleted: (completed: boolean, email?: string) => void;
}

export const EmailForm = ({ onStepCompleted }: EmailFormProps) => {
    const { handleSubmit, errors, register, isLoadingSendingCodeToEmail } =
        useEmailForm({
            onSuccess: (email: string) => {
                onStepCompleted(true, email);
            },
            onError: () => {
                onStepCompleted(false);
            },
        });

    return (
        <form onSubmit={handleSubmit}>
            <div className={`form-group ${errors.email ? "invalid" : ""}`}>
                <label htmlFor="email">Correo electrónico</label>
                <input
                    {...register("email", {
                        required: true,
                        pattern: EMAIL_PATTERN,
                    })}
                    id="email"
                    type="text"
                />
                <p className="error">Correo electrónico inválido</p>
            </div>

            <div className="mt-5 flex justify-end">
                <PrimaryButton disabled={isLoadingSendingCodeToEmail}>
                    {isLoadingSendingCodeToEmail
                        ? "Enviando..."
                        : "Enviar código"}
                </PrimaryButton>
            </div>
        </form>
    );
};
