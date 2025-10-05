import { VALIDATION_CODE_PATTERN } from "@/utils/regexp";
import { useCodeForm } from "../_hooks/useCodeForm";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";

interface CodeFormProps {
    email: string;
    onStepCompleted: (completed: boolean, code?: string) => void;
}

export const CodeForm = ({ email, onStepCompleted }: CodeFormProps) => {
    const { handleSubmit, errors, register, isLoadingSendingValidationCode } =
        useCodeForm({
            email,
            onSuccess: (code: string) => {
                onStepCompleted(true, code);
            },
            onError: () => {
                onStepCompleted(false);
            },
        });

    return (
        <form onSubmit={handleSubmit}>
            <div className={`form-group ${errors.code ? "invalid" : ""}`}>
                <label htmlFor="code">Código</label>
                <input
                    {...register("code", {
                        required: true,
                        pattern: VALIDATION_CODE_PATTERN,
                    })}
                    id="code"
                    type="text"
                />
                <p className="error">Código inválido</p>
            </div>

            <div className="mt-5 flex justify-end">
                <PrimaryButton disabled={isLoadingSendingValidationCode}>
                    {isLoadingSendingValidationCode
                        ? "Enviando..."
                        : "Validar código"}
                </PrimaryButton>
            </div>
        </form>
    );
};
