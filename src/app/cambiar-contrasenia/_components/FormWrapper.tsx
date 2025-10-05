"use client";
import { useState } from "react";
import { EmailForm } from "./EmailForm";
import { CodeForm } from "./CodeForm";
import { PasswordForm } from "./PasswordForm";
import { useRouter } from "next/navigation";

export const FormWrapper = () => {
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState<string>("");
    const [validationCode, setValidationCode] = useState<string>("");
    const router = useRouter();

    return (
        <>
            <header className="flex flex-col items-center">
                <h1 className="text-green-cfe text-center">
                    CAMBIO DE CONTRASEÑA
                </h1>
            </header>
            <main>
                <div className="mt-12">
                    {step === 1 && (
                        <>
                            <h3 className="text-center">
                                Te enviaremos un código a tu correo electrónico
                                CFE
                            </h3>
                            <EmailForm
                                onStepCompleted={(completed, email) => {
                                    if (completed && email) {
                                        setUserEmail(email);
                                        setStep(2);
                                    }
                                }}
                            />
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <h3 className="text-center">
                                Te hemos enviado un código a tu correo
                                electrónico CFE. Ingresa el código a
                                continuación
                            </h3>
                            <CodeForm
                                email={userEmail}
                                onStepCompleted={(completed, code) => {
                                    if (completed && code) {
                                        setValidationCode(code);
                                        setStep(3);
                                    }
                                }}
                            />
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <h3 className="text-center">
                                El código fue validado correctamente. Ahora
                                ingrese su nueva contraseña
                            </h3>
                            <PasswordForm
                                email={userEmail}
                                code={validationCode}
                                onStepCompleted={(completed) => {
                                    if (completed) {
                                        router.push("/");
                                    }
                                }}
                            />
                        </>
                    )}
                </div>
            </main>
        </>
    );
};
