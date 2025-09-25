import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { Slide, ToastContainer } from "react-toastify";
import { AuthProvider } from "@/contexts/auth/Provider";
import { Suspense } from "react";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";

const noto = Noto_Sans({
    subsets: ["latin"],
    variable: "--font-noto",
});

export const metadata: Metadata = {
    title: {
        template: "SGERP | %s",
        default: "SGERP",
    },
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${noto.variable} antialiased`}>
                <Suspense fallback={<FullScreenLoader />}>
                    <AuthProvider>
                        {children}
                        <ToastContainer
                            position="top-right"
                            autoClose={6000}
                            hideProgressBar={true}
                            closeOnClick={true}
                            pauseOnHover={true}
                            draggable={false}
                            theme="light"
                            transition={Slide}
                        />
                    </AuthProvider>
                </Suspense>
            </body>
        </html>
    );
}
