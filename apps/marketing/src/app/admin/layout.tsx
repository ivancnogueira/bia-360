import React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata = {
  title: "Painel de Gestao | BIA 360",
  description: "Plataforma integrada de gestao inteligente para barbearias e escolas de barbeiros.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f2ff] flex antialiased">
      {/* Barra de Navegacao Lateral Fixa */}
      <AdminSidebar />

      {/* Conteudo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

