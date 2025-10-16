import { UserForm } from "@/components/ui/UserForm";

export const FormWrapper = () => {
    return (
        <>
            <header className="flex flex-col items-center">
                <h1 className="text-green-cfe text-center">
                    REGISTRAR USUARIO
                </h1>
            </header>
            <main>
                <UserForm isEdition={false} />
            </main>
        </>
    );
};
