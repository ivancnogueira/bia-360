import React from "react";
import { KpiSummaryCards } from "@/components/admin/dashboard/KpiSummaryCards";
import { AnalyticsCharts } from "@/components/admin/dashboard/AnalyticsCharts";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Cabecalho da Pagina */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Painel de Controle e Metricas Executivas
        </h1>
        <p className="text-xs text-[#baacc7] mt-1">
          Visao consolidada em tempo real da Barbearia Barone Matriz e Barone Academy.
        </p>
      </div>

      {/* Indicadores-Chave (KPIs) */}
      <KpiSummaryCards />

      {/* Graficos de Desempenho */}
      <AnalyticsCharts />

      {/* Feed de Atividades e Transbordo Humano */}
      <RecentActivityFeed />
    </div>
  );
}

