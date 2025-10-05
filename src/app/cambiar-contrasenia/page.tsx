import { FormWrapper } from "./_components/FormWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cambio de contraseña",
};

export default function PasswordChange() {
    return (
        <div className="my-20 mx-auto max-w-md px-5">
            <FormWrapper />
        </div>
    );
}
