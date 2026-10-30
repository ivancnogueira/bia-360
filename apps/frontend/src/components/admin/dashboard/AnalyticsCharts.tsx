"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TrendingUp, Scissors, PieChart } from "lucide-react";

export const AnalyticsCharts: React.FC = () => {
  const weeklyRevenue = [
    { day: "Seg", amount: 3200, label: "R$ 3.200" },
    { day: "Ter", amount: 4850, label: "R$ 4.850" },
    { day: "Qua", amount: 5600, label: "R$ 5.600" },
    { day: "Qui", amount: 7200, label: "R$ 7.200" },
    { day: "Sex", amount: 10400, label: "R$ 10.400" },
    { day: "Sab", amount: 12800, label: "R$ 12.800" },
    { day: "Dom", amount: 4700, label: "R$ 4.700" },
  ];

  const maxWeekly = Math.max(...weeklyRevenue.map((w) => w.amount));

  const professionalsPerformance = [
    { name: "Rodrigo Barone", revenue: "R$ 19.400,00", commission: "R$ 9.700,00", percent: 85 },
    { name: "Carlos Eduardo", revenue: "R$ 14.800,00", commission: "R$ 7.400,00", percent: 65 },
    { name: "Lucas Ferreira", revenue: "R$ 14.550,00", commission: "R$ 7.275,00", percent: 62 },
  ];

  const categoriesShare = [
    { name: "Cortes e Degradê", share: "38%", color: "bg-[#c22ef3]" },
    { name: "Barba e Tratamentos", share: "24%", color: "bg-[#f33199]" },
    { name: "Produtos e Pomadas", share: "18%", color: "bg-[#de74f6]" },
    { name: "Cursos Academy", share: "20%", color: "bg-emerald-500" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gráfico 1: Tendência de Faturamento Semanal */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500 dark:text-[#de74f6]" />
            <CardTitle>Evolução de Faturamento Semanal</CardTitle>
          </div>
          <span className="text-[11px] font-bold text-muted-foreground">Últimos 7 dias</span>
        </CardHeader>
        <CardContent>
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {weeklyRevenue.map((item) => {
              const heightPercent = Math.round((item.amount / maxWeekly) * 100);

              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-foreground bg-card border border-border px-1.5 py-0.5 rounded shadow-lg">
                    {item.label}
                  </div>
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-[#c22ef3] to-[#f33199] rounded-t-lg transition-all duration-300 group-hover:brightness-125 shadow-md shadow-[#c22ef322]"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 2: Distribuição por Categoria */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart size={16} className="text-emerald-500 dark:text-[#de74f6]" />
            <CardTitle>Mix de Receita</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-2">
            {categoriesShare.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-semibold">{cat.name}</span>
                  <span className="font-mono font-bold text-foreground">{cat.share}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border">
                  <div
                    className={`h-full ${cat.color} rounded-full`}
                    style={{ width: cat.share }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 3: Desempenho e Comissões dos Profissionais */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scissors size={16} className="text-emerald-500 dark:text-[#de74f6]" />
            <CardTitle>Produção Bruta e Comissões da Equipe</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">
            Valores apurados em centavos inteiros no modelo 50% de repasse
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {professionalsPerformance.map((p) => (
              <div
                key={p.name}
                className="bg-card border border-border rounded-xl p-4 space-y-2 hover:border-emerald-500/40 dark:hover:border-[#c22ef377] transition-all"
              >
                <div className="text-sm font-extrabold text-foreground">{p.name}</div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Faturamento Bruto:</span>
                    <span className="font-bold text-foreground font-mono">{p.revenue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Comissão a Repassar:</span>
                    <span className="font-bold text-emerald-500 dark:text-emerald-400 font-mono">
                      {p.commission}
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-[#c22ef3] to-[#f33199]"
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
