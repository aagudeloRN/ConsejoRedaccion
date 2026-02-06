import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import UserSelector from "@/components/UserSelector";
import AuthGuard from "@/components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consejo de Redacción CTi",
  description: "Sistema de gestión y priorización de noticias CTI Ruta N",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <AuthGuard>
            <div className="min-h-screen flex flex-col">
              <header className="bg-white shadow px-4 py-2 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Consejo Redacción CTi</h1>
                <UserSelector />
              </header>
              <main className="flex-grow p-4">
                {children}
              </main>
            </div>
          </AuthGuard>
        </UserProvider>
      </body>
    </html>
  );
}
