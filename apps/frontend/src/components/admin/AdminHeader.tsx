"use client";

import React, { useState } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  UserCheck,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useBusinessMode } from "@/components/providers/business-mode-provider";

export const AdminHeader: React.FC = () => {
  const { currentUnit, units, setUnit } = useBusinessMode();
  const [unreadHandoffs] = useState(2);

  return (
    <header className="h-14 lg:h-16 bg-card/80 backdrop-blur-md border-b border-border px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 select-none transition-colors duration-200">
      {/* Busca Rápida */}
      <div className="flex items-center gap-4 w-72 lg:w-96">
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar cliente, serviço, comanda ou turma..."
            className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Ações da Direita */}
      <div className="flex items-center gap-2.5 lg:gap-3.5">
        {/* Seletor de Unidade e Modalidade */}
        <div className="hidden sm:flex items-center gap-2 bg-muted/50 border border-border px-3 py-1.5 rounded-xl text-xs text-foreground">
          <Building2 size={15} className="text-emerald-500" />
          <select
            value={currentUnit.id}
            onChange={(e) => setUnit(e.target.value)}
            className="bg-transparent text-xs text-foreground font-medium focus:outline-none cursor-pointer"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id} className="bg-card text-foreground">
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Central de Handoff Humano (Notificações) */}
        <Link
          href="/admin/clientes"
          className="relative p-2 rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          title="Atendimentos aguardando operador humano"
        >
          <Bell size={18} />
          {unreadHandoffs > 0 ? (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
              {unreadHandoffs}
            </span>
          ) : null}
        </Link>

        {/* Link para Landing de Vendas Oficial */}
        <a
          href="https://ivancnogueira.github.io/bia-360/vendas/?v=menu4"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-foreground border border-border bg-card/60 hover:bg-muted transition-all"
        >
          <span>Página de Vendas</span>
          <ExternalLink size={13} className="text-muted-foreground" />
        </a>

        {/* Botão de Alternância de Tema Animado (Magic UI View Transitions de bia-360) */}
        <AnimatedThemeToggler variant="circle" />

        {/* Perfil do Administrador Exclusivamente no Topo Direito (Agnóstico e Sem Nome Pessoal) */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
            AD
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-foreground leading-none">
              Administrador
            </div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
              Gestor Geral
            </div>
          </div>
          <Link
            href="/login"
            title="Sair da plataforma"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors ml-0.5"
          >
            <span className="text-xs font-semibold">Sair</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
