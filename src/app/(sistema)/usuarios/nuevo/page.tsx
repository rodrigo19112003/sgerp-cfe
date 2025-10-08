import { FormWrapper } from "./_components/FormWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Registrar Usuario",
};

export default function Login() {
    return (
        <div className="my-20 mx-auto max-w-md px-5 pt-12">
            <FormWrapper />
        </div>
    );
}
