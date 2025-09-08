import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

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
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}