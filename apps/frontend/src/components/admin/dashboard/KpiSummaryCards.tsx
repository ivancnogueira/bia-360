"use client";

import React from "react";
import { TrendingUp, CalendarCheck, GraduationCap, DollarSign, Users, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useBusinessMode } from "@/components/providers/business-mode-provider";

export interface KpiItem {
  id: string;
  title: string;
  value: string;
  comparison: string;
  isPositive: boolean;
  icon: "dollar" | "calendar" | "occupancy" | "students" | "ticket" | "leads" | "academy";
}

const iconsMap = {
  dollar: DollarSign,
  calendar: CalendarCheck,
  occupancy: TrendingUp,
  students: Users,
  ticket: TrendingUp,
  leads: GraduationCap,
  academy: Award,
};

const barbershopKpis: KpiItem[] = [
  {
    id: "kpi-b-rev",
    title: "Faturamento Serviços (Mês)",
    value: "R$ 38.450,00",
    comparison: "+16,2% em relação ao mês anterior",
    isPositive: true,
    icon: "dollar",
  },
  {
    id: "kpi-b-app",
    title: "Agendamentos Concluídos",
    value: "412",
    comparison: "Taxa de no-show de apenas 3,2%",
    isPositive: true,
    icon: "calendar",
  },
  {
    id: "kpi-b-occ",
    title: "Ocupação das Cadeiras",
    value: "84,5%",
    comparison: "+6,1% após ativação da BIA WhatsApp",
    isPositive: true,
    icon: "occupancy",
  },
  {
    id: "kpi-b-team",
    title: "Barbeiros em Atendimento",
    value: "6 Profissionais",
    comparison: "100% da equipe com agenda ativa",
    isPositive: true,
    icon: "students",
  },
  {
    id: "kpi-b-ticket",
    title: "Ticket Médio por Corte",
    value: "R$ 93,30",
    comparison: "+8,5% alavancado por barba e produtos",
    isPositive: true,
    icon: "ticket",
  },
];

const academyKpis: KpiItem[] = [
  {
    id: "kpi-a-rev",
    title: "Receita de Cursos (Mês)",
    value: "R$ 24.900,00",
    comparison: "+22,8% em novas matrículas",
    isPositive: true,
    icon: "dollar",
  },
  {
    id: "kpi-a-students",
    title: "Alunos Ativos na Academy",
    value: "32 Alunos",
    comparison: "3 turmas em andamento no período",
    isPositive: true,
    icon: "leads",
  },
  {
    id: "kpi-a-leads",
    title: "Leads e Interessados",
    value: "58 Contatos",
    comparison: "Aquecimento contínuo via BIA WhatsApp",
    isPositive: true,
    icon: "students",
  },
  {
    id: "kpi-a-occ",
    title: "Ocupação de Vagas",
    value: "91,4%",
    comparison: "Turmas do trimestre quase lotadas",
    isPositive: true,
    icon: "occupancy",
  },
  {
    id: "kpi-a-cert",
    title: "Certificados Emitidos",
    value: "14 Barbeiros",
    comparison: "100% aprovados com código anti-fraude",
    isPositive: true,
    icon: "academy",
  },
];

const hybridKpis: KpiItem[] = [
  {
    id: "kpi-h-rev",
    title: "Faturamento 360° (Mês)",
    value: "R$ 63.350,00",
    comparison: "+18,4% (Serviços + Academy)",
    isPositive: true,
    icon: "dollar",
  },
  {
    id: "kpi-h-app",
    title: "Atendimentos da Barbearia",
    value: "412",
    comparison: "Taxa de falta (no-show) de apenas 3,2%",
    isPositive: true,
    icon: "calendar",
  },
  {
    id: "kpi-h-occ",
    title: "Taxa de Ocupação Cadeiras",
    value: "84,5%",
    comparison: "+6,1% após ativação BIA",
    isPositive: true,
    icon: "occupancy",
  },
  {
    id: "kpi-h-students",
    title: "Alunos Ativos Academy",
    value: "32 Alunos",
    comparison: "3 turmas em andamento",
    isPositive: true,
    icon: "leads",
  },
  {
    id: "kpi-h-ticket",
    title: "Ticket Médio Consolidado",
    value: "R$ 138,50",
    comparison: "+14,2% com venda cruzada e kits",
    isPositive: true,
    icon: "ticket",
  },
];

export const KpiSummaryCards: React.FC = () => {
  const { businessType, activeFilter } = useBusinessMode();

  let activeKpis: KpiItem[];
  if (businessType === "BARBERSHOP" || (businessType === "HYBRID" && activeFilter === "BARBERSHOP")) {
    activeKpis = barbershopKpis;
  } else if (businessType === "ACADEMY" || (businessType === "HYBRID" && activeFilter === "ACADEMY")) {
    activeKpis = academyKpis;
  } else {
    activeKpis = hybridKpis;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {activeKpis.map((kpi) => {
        const IconComponent = iconsMap[kpi.icon];

        return (
          <Card
            key={kpi.id}
            className="flex flex-col justify-between p-4 hover:border-emerald-500/40 dark:hover:border-[#c22ef3aa] transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider line-clamp-1">
                {kpi.title}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:bg-[#c22ef31a] dark:border-[#c22ef333] dark:text-[#de74f6] flex items-center justify-center shrink-0">
                <IconComponent size={16} />
              </div>
            </div>

            <div>
              <div className="text-xl font-black text-foreground font-mono tracking-tight">
                {kpi.value}
              </div>
              <div
                className={`text-[10px] font-semibold mt-1 line-clamp-1 ${
                  kpi.isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                }`}
              >
                {kpi.comparison}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
