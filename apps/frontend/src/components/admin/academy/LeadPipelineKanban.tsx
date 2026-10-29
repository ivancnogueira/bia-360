"use client";

import React from "react";
import { MessageSquare, Phone, User, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface AcademyLead {
  id: string;
  name: string;
  phone: string;
  courseInterest: string;
  stage: "NEW" | "CONTACTED" | "VISIT_SCHEDULED" | "PRE_ENROLLED" | "ENROLLED";
  capturedAt: string;
}

export interface LeadPipelineKanbanProps {
  leads: AcademyLead[];
  onAdvanceStage: (leadId: string) => void;
}

export const LeadPipelineKanban: React.FC<LeadPipelineKanbanProps> = ({
  leads,
  onAdvanceStage,
}) => {
  const stages: {
    key: AcademyLead["stage"];
    label: string;
    badgeVariant: "purple" | "info" | "warning" | "success" | "neutral";
  }[] = [
    { key: "NEW", label: "Novos Contatos", badgeVariant: "purple" },
    { key: "CONTACTED", label: "Em Conversa (BIA)", badgeVariant: "info" },
    { key: "VISIT_SCHEDULED", label: "Visita Agendada", badgeVariant: "warning" },
    { key: "PRE_ENROLLED", label: "Pre-Matriculados", badgeVariant: "success" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-white">Funil Comercial de Alunos</h2>
        <p className="text-xs text-[#baacc7]">
          Fluxo de conversao de interessados capturados via WhatsApp e campanhas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stg) => {
          const stageLeads = leads.filter((l) => l.stage === stg.key);

          return (
            <div
              key={stg.key}
              className="bg-[#100b17] border border-[#d798ff22] rounded-2xl p-4 flex flex-col h-[520px]"
            >
              {/* Header da Coluna */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#d798ff15]">
                <span className="text-xs font-black text-white">{stg.label}</span>
                <Badge variant={stg.badgeVariant} size="sm">
                  {stageLeads.length}
                </Badge>
              </div>

              {/* Lista de Leads */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-xl bg-[#160d20] border border-[#d798ff22] hover:border-[#c22ef3aa] transition-all space-y-2.5"
                  >
                    <div>
                      <div className="text-xs font-black text-white">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-[#de74f6] font-medium mt-0.5">
                        Interesse: {lead.courseInterest}
                      </div>
                    </div>

                    <div className="text-[10px] text-[#baacc7] font-mono">
                      Captura: {lead.capturedAt}
                    </div>

                    {/* Acoes Rapidas */}
                    <div className="pt-2 border-t border-[#d798ff15] flex items-center justify-between">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <MessageSquare size={13} />
                        <span>Conversar</span>
                      </a>

                      <button
                        onClick={() => onAdvanceStage(lead.id)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#baacc7] hover:text-white transition-colors"
                        title="Avancar etapa do funil"
                      >
                        <span>Avancar</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 ? (
                  <div className="h-28 flex items-center justify-center border border-dashed border-[#d798ff15] rounded-xl text-xs text-[#887591]">
                    Nenhum lead nesta etapa
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

