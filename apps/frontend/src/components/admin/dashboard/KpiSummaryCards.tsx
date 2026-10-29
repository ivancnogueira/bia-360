"use client";

import React from "react";
import { TrendingUp, Users, CalendarCheck, GraduationCap, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface KpiItem {
  id: string;
  title: string;
  value: string;
  comparison: string;
  isPositive: boolean;
  icon: "dollar" | "calendar" | "occupancy" | "students" | "ticket";
}

const iconsMap = {
  dollar: DollarSign,
  calendar: CalendarCheck,
  occupancy: TrendingUp,
  students: GraduationCap,
  ticket: TrendingUp,
};

export interface KpiSummaryCardsProps {
  kpis?: KpiItem[];
}

const defaultKpis: KpiItem[] = [
  {
    id: "kpi-revenue",
    title: "Faturamento Bruto (Mes)",
    value: "R$ 48.750,00",
    comparison: "+18,4% em relacao ao mes anterior",
    isPositive: true,
    icon: "dollar",
  },
  {
    id: "kpi-appointments",
    title: "Agendamentos Concluidos",
    value: "412",
    comparison: "Taxa de falta (no-show) de apenas 3,2%",
    isPositive: true,
    icon: "calendar",
  },
  {
    id: "kpi-occupancy",
    title: "Taxa de Ocupacao das Cadeiras",
    value: "84,5%",
    comparison: "+6,1% apos ativacao da BIA WhatsApp",
    isPositive: true,
    icon: "occupancy",
  },
  {
    id: "kpi-academy",
    title: "Alunos Ativos na Escola",
    value: "32 Alunos",
    comparison: "3 turmas em andamento no periodo",
    isPositive: true,
    icon: "students",
  },
  {
    id: "kpi-ticket",
    title: "Ticket Medio por Atendimento",
    value: "R$ 118,30",
    comparison: "+14,2% alavancado por vendas de pomadas",
    isPositive: true,
    icon: "ticket",
  },
];

export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({
  kpis = defaultKpis,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => {
        const IconComponent = iconsMap[kpi.icon];

        return (
          <Card
            key={kpi.id}
            className="flex flex-col justify-between p-4 bg-gradient-to-br from-[#100b17] to-[#160d20] border-[#d798ff22] hover:border-[#c22ef3aa] transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#baacc7] uppercase tracking-wider line-clamp-1">
                {kpi.title}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#c22ef31a] border border-[#c22ef333] flex items-center justify-center text-[#de74f6] shrink-0">
                <IconComponent size={16} />
              </div>
            </div>

            <div>
              <div className="text-xl font-black text-white font-mono tracking-tight">
                {kpi.value}
              </div>
              <div
                className={`text-[10px] font-semibold mt-1 line-clamp-1 ${
                  kpi.isPositive ? "text-emerald-400" : "text-rose-400"
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

