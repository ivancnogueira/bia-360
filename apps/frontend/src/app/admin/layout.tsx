import React from "react";
import "@/app/globals.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { BusinessModeProvider } from "@/components/providers/business-mode-provider";

export const metadata = {
  title: "Painel de Gestao | BIA 360",
  description: "Plataforma integrada de gestao inteligente para barbearias e escolas de barbeiros.",
  icons: {
    icon: [
      { url: "/images/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/images/favicon.ico",
    apple: [
      { url: "/images/apple-icon.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BusinessModeProvider>
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex antialiased">
        {/* Barra de Navegacao Lateral com suporte a recolher/expandir e filtragem de perfil */}
        <AdminSidebar />

        {/* Conteudo Principal Full Width */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </BusinessModeProvider>
  );
}
