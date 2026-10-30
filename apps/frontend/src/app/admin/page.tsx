"use client";

import React from "react";
import { KpiSummaryCards } from "@/components/admin/dashboard/KpiSummaryCards";
import { AnalyticsCharts } from "@/components/admin/dashboard/AnalyticsCharts";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";
import { useBusinessMode } from "@/components/providers/business-mode-provider";

export default function AdminDashboardPage() {
  const { currentUnit, businessType, activeFilter } = useBusinessMode();

  const getHeaderInfo = () => {
    if (businessType === "BARBERSHOP" || (businessType === "HYBRID" && activeFilter === "BARBERSHOP")) {
      return {
        title: "Painel de Controle — CRM Barbearia",
        subtitle: `Visão operacional em tempo real de agendamentos, comandas e faturamento da ${currentUnit.name}.`,
      };
    }

    if (businessType === "ACADEMY" || (businessType === "HYBRID" && activeFilter === "ACADEMY")) {
      return {
        title: "Painel de Controle — CRM Academy",
        subtitle: `Gestão de turmas, alunos ativos, matrículas e frequência acadêmica da ${currentUnit.name}.`,
      };
    }

    return {
      title: "Painel de Controle — Visão Executiva 360°",
      subtitle: `Visão consolidada em tempo real da barbearia comercial e da escola de formação (${currentUnit.name}).`,
    };
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página Contextual */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle}
        </p>
      </div>

      {/* Indicadores-Chave (KPIs Contextuais) */}
      <KpiSummaryCards />

      {/* Gráficos de Desempenho */}
      <AnalyticsCharts />

      {/* Feed de Atividades e Transbordo Humano */}
      <RecentActivityFeed />
    </div>
  );
}
