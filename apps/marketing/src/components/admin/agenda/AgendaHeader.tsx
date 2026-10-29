"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Users,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface AgendaHeaderProps {
  currentDateFormatted: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  viewMode: "professionals" | "week";
  onViewModeChange: (mode: "professionals" | "week") => void;
  onNewAppointment: () => void;
}

export const AgendaHeader: React.FC<AgendaHeaderProps> = ({
  currentDateFormatted,
  onPrevDay,
  onNextDay,
  onToday,
  viewMode,
  onViewModeChange,
  onNewAppointment,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#100b17] border border-[#d798ff22] rounded-2xl p-4 mb-6 shadow-xl shadow-black/20">
      {/* Navegacao de Datas */}
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onToday}>
          Hoje
        </Button>
        <div className="flex items-center bg-[#160d20] border border-[#d798ff22] rounded-xl p-1">
          <button
            onClick={onPrevDay}
            className="p-1.5 rounded-lg text-[#baacc7] hover:text-white hover:bg-white/5 transition-colors"
            title="Dia anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2 px-3 text-xs font-bold text-white">
            <CalendarIcon size={14} className="text-[#de74f6]" />
            <span>{currentDateFormatted}</span>
          </div>
          <button
            onClick={onNextDay}
            className="p-1.5 rounded-lg text-[#baacc7] hover:text-white hover:bg-white/5 transition-colors"
            title="Proximo dia"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Acoes da Direita */}
      <div className="flex items-center gap-3">
        {/* Alternador de Modo de Visao */}
        <div className="flex items-center bg-[#160d20] border border-[#d798ff22] p-1 rounded-xl">
          <button
            onClick={() => onViewModeChange("professionals")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "professionals"
                ? "bg-[#c22ef333] text-white border border-[#c22ef355]"
                : "text-[#baacc7] hover:text-white"
            }`}
          >
            <Users size={14} />
            <span>Por Profissional</span>
          </button>
          <button
            onClick={() => onViewModeChange("week")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "week"
                ? "bg-[#c22ef333] text-white border border-[#c22ef355]"
                : "text-[#baacc7] hover:text-white"
            }`}
          >
            <Grid size={14} />
            <span>Visao Semanal</span>
          </button>
        </div>

        {/* Botao de Novo Agendamento */}
        <Button variant="primary" size="md" onClick={onNewAppointment}>
          <Plus size={16} />
          <span>Novo Agendamento</span>
        </Button>
      </div>
    </div>
  );
};

