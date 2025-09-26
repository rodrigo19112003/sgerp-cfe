import { FormWrapper } from "./_components/FormWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Inicio de sesión",
};

export default function Login() {
    return (
        <div className="my-20 mx-auto max-w-md px-5">
            <FormWrapper />
        </div>
    );
}
