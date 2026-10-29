"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  Wallet,
  GraduationCap,
  Users,
  BarChart3,
  Settings,
  Bot,
  ChevronRight,
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Agenda Inteligente", href: "/admin/agenda", icon: CalendarDays },
  { name: "Comandas e PDV", href: "/admin/comandas", icon: Receipt },
  { name: "Caixa Diario", href: "/admin/caixa", icon: Wallet },
  { name: "Escola Barone", href: "/admin/escola", icon: GraduationCap },
  { name: "Clientes e Leads", href: "/admin/clientes", icon: Users },
  { name: "Metricas e KPIs", href: "/admin/metricas", icon: BarChart3 },
  { name: "Configuracoes", href: "/admin/configuracoes", icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#08070d] border-r border-[#d798ff22] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Identidade Visual Cyberpunk */}
        <div className="p-6 border-b border-[#d798ff22]">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c22ef3] to-[#f33199] flex items-center justify-center shadow-lg shadow-[#c22ef344] group-hover:brightness-110 transition-all">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <div className="font-black text-lg text-white tracking-wider">
                BIA <span className="text-[#de74f6]">360</span>
              </div>
              <div className="text-[10px] text-[#baacc7] uppercase tracking-widest font-semibold">
                Plataforma de Gestao
              </div>
            </div>
          </Link>
        </div>

        {/* Menu de Navegacao */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-[#887591] uppercase tracking-widest">
            Modulos do Sistema
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-[#c22ef322] to-[#f3319911] text-white border border-[#c22ef355] shadow-sm shadow-[#c22ef333]"
                    : "text-[#baacc7] hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? "text-[#de74f6]"
                        : "text-[#887591] group-hover:text-white transition-colors"
                    }
                  />
                  <span>{item.name}</span>
                </div>
                {isActive ? (
                  <ChevronRight size={14} className="text-[#de74f6]" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Card da Assistente BIA no Rodape da Sidebar */}
      <div className="p-4 border-t border-[#d798ff22]">
        <div className="rounded-xl bg-gradient-to-br from-[#c783ff18] to-[#20122e70] p-3.5 border border-[#d798ff33]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-white tracking-wide">
              BIA WhatsApp Ativa
            </span>
          </div>
          <p className="text-[10px] text-[#baacc7] leading-relaxed">
            Motor de IA em operacao continua com roteamento Gemini e Grok.
          </p>
        </div>
      </div>
    </aside>
  );
};

