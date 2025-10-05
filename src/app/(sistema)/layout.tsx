import { SystemNavbar } from "./_components/SystemNavbar";

export default function StoreLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <header className="border-b border-gray-300 fixed top-0 w-full bg-white z-20">
                <SystemNavbar />
            </header>
            <div className="mt-20 md:mt-24">{children}</div>
        </>
    );
}
