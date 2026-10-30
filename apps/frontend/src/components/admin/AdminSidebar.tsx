"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ChevronLeft,
  ChevronRight,
  Scissors,
  Clock,
  BookOpen,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BiaLogo } from "@/components/ui/bia-logo";
import { useBusinessMode } from "@/components/providers/business-mode-provider";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const {
    currentUnit,
    businessType,
    activeFilter,
    setActiveFilter,
    isBarbershopVisible,
    isAcademyVisible,
  } = useBusinessMode();

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("bia360-sidebar-collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // localStorage indisponível
    }
  }, []);

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("bia360-sidebar-collapsed", String(next));
      } catch {
        // localStorage indisponível
      }
      return next;
    });
  };

  // Construir grupos dinamicamente com base no perfil ativo
  const getNavGroups = (): NavGroup[] => {
    // 1. MODO PURO: BARBEARIA
    if (businessType === "BARBERSHOP" || (businessType === "HYBRID" && activeFilter === "BARBERSHOP")) {
      return [
        {
          id: "barbearia-principal",
          title: "CRM Barbearia",
          items: [
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
            { name: "Agenda Inteligente", href: "/admin/agenda", icon: CalendarDays },
            { name: "Comandas e PDV", href: "/admin/comandas", icon: Receipt },
            { name: "Caixa Diário", href: "/admin/caixa", icon: Wallet },
            { name: "Clientes da Barbearia", href: "/admin/clientes", icon: Users },
            { name: "Métricas e Comissões", href: "/admin/metricas", icon: BarChart3 },
            { name: "Configurações", href: "/admin/configuracoes", icon: Settings },
          ],
        },
      ];
    }

    // 2. MODO PURO: ACADEMY (ESCOLA)
    if (businessType === "ACADEMY" || (businessType === "HYBRID" && activeFilter === "ACADEMY")) {
      return [
        {
          id: "academy-principal",
          title: "CRM Academy",
          items: [
            { name: "Dashboard Academy", href: "/admin", icon: LayoutDashboard },
            { name: "Academy (Cursos & Turmas)", href: "/admin/escola", icon: GraduationCap },
            { name: "Funil de Matrículas", href: "/admin/escola#matriculas", icon: BookOpen },
            { name: "Alunos e Leads", href: "/admin/clientes", icon: Users },
            { name: "Caixa e Mensalidades", href: "/admin/caixa", icon: Wallet },
            { name: "Métricas Acadêmicas", href: "/admin/metricas", icon: BarChart3 },
            { name: "Configurações", href: "/admin/configuracoes", icon: Settings },
          ],
        },
      ];
    }

    // 3. MODO HÍBRIDO CONSOLIDADO (2 CRMs em 1 - VISÃO 360°)
    return [
      {
        id: "visao-geral",
        title: "Visão Geral",
        items: [
          { name: "Dashboard 360°", href: "/admin", icon: LayoutDashboard },
        ],
      },
      {
        id: "crm-barbearia",
        title: "CRM Barbearia",
        items: [
          { name: "Agenda Inteligente", href: "/admin/agenda", icon: CalendarDays },
          { name: "Comandas e PDV", href: "/admin/comandas", icon: Receipt },
          { name: "Caixa Diário", href: "/admin/caixa", icon: Wallet },
        ],
      },
      {
        id: "crm-academy",
        title: "CRM Academy",
        items: [
          { name: "Academy", href: "/admin/escola", icon: GraduationCap },
          { name: "Matrículas & Leads", href: "/admin/clientes", icon: BookOpen },
        ],
      },
      {
        id: "governanca",
        title: "Governança",
        items: [
          { name: "Métricas e KPIs", href: "/admin/metricas", icon: BarChart3 },
          { name: "Configurações", href: "/admin/configuracoes", icon: Settings },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

  return (
    <aside
      className={cn(
        "relative h-screen bg-card border-r border-border flex flex-col justify-between transition-all duration-200 ease-in-out select-none z-30 shrink-0",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* =====================================================================
       * 1. HEADER DA SIDEBAR: AVATAR ROSTO BIA + LOGO BIA 360 (IDÊNTICO BIA-360)
       * ===================================================================== */}
      <div className="h-14 px-4 border-b border-border flex items-center justify-between flex-shrink-0 relative">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 min-w-0 pr-4">
            {/* Avatar Oficial (Apenas o Rosto da BIA com Dot Verde sobreposto) */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/40 ring-2 ring-emerald-500/20 shadow-xs">
                <Image
                  src="/avatar_bia_face.jpg"
                  alt="BIA"
                  width={36}
                  height={36}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card z-20 shadow-xs" />
            </div>

            {/* Logotipo Oficial BIA 360 */}
            <Link
              href="/admin"
              className="flex items-center outline-none group hover:opacity-90 transition-opacity"
              title="BIA 360 - Painel de Gestão"
            >
              <BiaLogo size="md" showText={true} />
            </Link>
          </div>
        ) : (
          /* Modo Recolhido: Avatar centralizado */
          <div className="w-full flex justify-center">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/40 ring-2 ring-emerald-500/20 shadow-xs">
                <Image
                  src="/avatar_bia_face.jpg"
                  alt="BIA"
                  width={36}
                  height={36}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card z-20 shadow-xs" />
            </div>
          </div>
        )}

        {/* Botão de Recolher/Expandir na Divisória */}
        <button
          type="button"
          onClick={handleToggle}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg border border-border bg-card shadow-sm hover:shadow flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all z-40 outline-none cursor-pointer"
          title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* =====================================================================
       * 2. SELETOR DE CONTEXTO RÁPIDO PARA NEGÓCIOS HÍBRIDOS (2 CRMS EM 1)
       * ===================================================================== */}
      {businessType === "HYBRID" && !isCollapsed && (
        <div className="px-3 pt-3 pb-1 border-b border-border/50">
          <div className="p-1 bg-muted/60 rounded-xl flex items-center gap-1 border border-border/60">
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={cn(
                "flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all text-center",
                activeFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Visão 360 consolidada"
            >
              360°
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("BARBERSHOP")}
              className={cn(
                "flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1",
                activeFilter === "BARBERSHOP"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Focar no CRM Barbearia"
            >
              <Scissors size={11} />
              <span>Barber</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("ACADEMY")}
              className={cn(
                "flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1",
                activeFilter === "ACADEMY"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Focar no CRM Academy"
            >
              <GraduationCap size={12} />
              <span>Academy</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
       * 3. CORPO DA NAVEGAÇÃO: GRUPOS SEMÂNTICOS E ITENS
       * ===================================================================== */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                {group.title}
              </p>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 py-2 text-xs font-semibold rounded-xl transition-all group",
                    isCollapsed
                      ? "px-2 justify-center h-10 w-10 mx-auto"
                      : "px-3",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon
                    size={17}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* =====================================================================
       * 4. RODAPÉ DA SIDEBAR: BADGE DE CONTEXTO E STATUS DA BIA
       * ===================================================================== */}
      <div className="p-3 border-t border-border flex-shrink-0">
        {!isCollapsed ? (
          <div className="rounded-xl bg-muted/60 p-2.5 border border-border">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-foreground">
                  BIA WhatsApp
                </span>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {businessType === "HYBRID" ? "Híbrido" : businessType === "BARBERSHOP" ? "Barbearia" : "Academy"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed truncate">
              {currentUnit.name}
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title={`BIA WhatsApp Ativa (${businessType})`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
