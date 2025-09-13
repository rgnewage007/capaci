import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/components/providers/query-client-provider";
import { ToastContainer } from "@/components/toast-container";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Sistema de Capacitación",
    description: "Plataforma de gestión de cursos y certificaciones",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <QueryProvider>
                    {children}
                    <ToastContainer />
                </QueryProvider>
            </body>
        </html>
    );
}