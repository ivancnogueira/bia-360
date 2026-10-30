"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Scissors, Clock, Users } from "lucide-react";

const subMenuItems = [
  {
    href: "/admin/agenda",
    label: "Reservas & Grade",
    icon: CalendarDays,
    exact: true,
  },
  {
    href: "/admin/agenda/servicos",
    label: "Catálogo de Serviços",
    icon: Scissors,
    exact: false,
  },
  {
    href: "/admin/agenda/disponibilidade",
    label: "Disponibilidade & Esquemas",
    icon: Clock,
    exact: false,
  },
  {
    href: "/admin/agenda/profissionais",
    label: "Barbeiros & Profissionais",
    icon: Users,
    exact: false,
  },
];

export default function AgendaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* SubSidebar estilo NaviChats / Cal.com */}
      <aside className="w-full md:w-60 flex-shrink-0 bg-white dark:bg-[#090a0f] border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 flex flex-col transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 rounded-full bg-[#c22ef3]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Agenda & Horários
            </h2>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Gestão de cadeiras, procedimentos e disponibilidade dos barbeiros.
          </p>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {subMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? "bg-[#c22ef3]/15 text-[#c22ef3] font-black border-l-2 border-[#c22ef3] shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 font-semibold"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#c22ef3]" : "text-gray-400 dark:text-gray-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Conteúdo Principal com suporte pleno a Light/Dark Mode */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#08070d] p-4 md:p-6 transition-colors">
        {children}
      </main>
    </div>
  );
}

