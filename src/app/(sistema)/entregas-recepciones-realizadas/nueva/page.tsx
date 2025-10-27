import { Metadata } from "next";
import { FormWrapper } from "./_components/FormWrapper";

export const metadata: Metadata = {
    title: "Registrar Usuario",
};

export default function UserRegistration() {
    return (
        <div className="my-20 mx-auto max-w-md px-5 pt-12">
            <FormWrapper />
        </div>
    );
}
