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
                    width={300}
                    height={300}
                />
                <h1 className="text-green-cfe text-center">
                    SISTEMA DE GESTIÓN DE ENTREGA-RECEPCIÓN DE PUESTOS
                </h1>
            </header>
            <main>
                <LoginForm />
            </main>
        </>
    );
};
