"use client";
import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const FormWrapper = () => {
    return (
        <>
            <header className="flex flex-col items-center">
                <Image
                    priority
                    src="plain-logo.svg"
                    alt="Logo de CFE con nombre incluido"
                    width={180}
                    height={180}
                />
                <h2 className="text-green-cfe text-center">
                    SISTEMA DE GESTIÓN DE ENTREGA-RECEPCIÓN DE PUESTOS
                </h2>
            </header>
            <main>
                <LoginForm />
            </main>
        </>
    );
};
