"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Activity,
  Bot,
  UserCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
} from "lucide-react";

export interface ActivityEvent {
  id: string;
  type: "APPOINTMENT_CONFIRMED" | "ORDER_PAID" | "HUMAN_HANDOFF" | "LEAD_CAPTURED";
  title: string;
  description: string;
  timeAgo: string;
  actionUrl?: string;
}

const defaultActivities: ActivityEvent[] = [
  {
    id: "act-1",
    type: "HUMAN_HANDOFF",
    title: "Cliente solicitou atendente humano",
    description: "Carlos Peixoto tem dúvida sobre condições de pagamento parcelado do curso.",
    timeAgo: "Há 3 minutos",
    actionUrl: "/admin/clientes",
  },
  {
    id: "act-2",
    type: "APPOINTMENT_CONFIRMED",
    title: "Agendamento confirmado via BIA WhatsApp",
    description: "Marcos Vinicius agendou Corte e Barboterapia com Rodrigo Barone para hoje às 11:00.",
    timeAgo: "Há 12 minutos",
  },
  {
    id: "act-3",
    type: "ORDER_PAID",
    title: "Comanda liquidada no PDV",
    description: "Comanda CMD-1044 (Eduardo Camargo) paga via PIX no valor de R$ 135,00.",
    timeAgo: "Há 28 minutos",
  },
  {
    id: "act-4",
    type: "LEAD_CAPTURED",
    title: "Novo interessado na Academy",
    description: "Rafael Martins iniciou simulação do curso de Formação Profissional de Barbeiro.",
    timeAgo: "Há 45 minutos",
  },
];

export const RecentActivityFeed: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-emerald-500 dark:text-[#de74f6]" />
          <CardTitle>Atividades Recentes e Notificações</CardTitle>
        </div>
        <Badge variant="purple" size="sm">
          Tempo Real
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {defaultActivities.map((act) => (
            <div
              key={act.id}
              className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    act.type === "HUMAN_HANDOFF"
                      ? "bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400"
                      : act.type === "APPOINTMENT_CONFIRMED"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : act.type === "ORDER_PAID"
                      ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
                      : "bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-[#de74f6]"
                  }`}
                >
                  {act.type === "HUMAN_HANDOFF" ? (
                    <UserCheck size={16} />
                  ) : act.type === "APPOINTMENT_CONFIRMED" ? (
                    <Bot size={16} />
                  ) : act.type === "ORDER_PAID" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <MessageSquare size={16} />
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-foreground">{act.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                    {act.description}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono mt-1">
                    <Clock size={10} />
                    <span>{act.timeAgo}</span>
                  </div>
                </div>
              </div>

              {act.type === "HUMAN_HANDOFF" ? (
                <Button variant="danger" size="sm">
                  Assumir Chat
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
