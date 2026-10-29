"use client";

import React from "react";
import { Clock, ShieldAlert, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface ProfessionalColumn {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface AppointmentSlot {
  id: string;
  professionalId: string;
  customerName: string;
  serviceName: string;
  startTime: string; // Ex: "09:00"
  endTime: string; // Ex: "09:45"
  priceFormatted: string;
  status: "CONFIRMED" | "SCHEDULED" | "IN_PROGRESS" | "HOLD";
  holdExpiresInSeconds?: number;
}

export interface AgendaGridProps {
  professionals: ProfessionalColumn[];
  appointments: AppointmentSlot[];
  timeSlots: string[]; // Ex: ["08:00", "08:30", "09:00", ...]
  onSelectSlot: (professionalId: string, time: string) => void;
  onSelectAppointment: (appointment: AppointmentSlot) => void;
}

export const AgendaGrid: React.FC<AgendaGridProps> = ({
  professionals,
  appointments,
  timeSlots,
  onSelectSlot,
  onSelectAppointment,
}) => {
  return (
    <div className="bg-[#100b17] border border-[#d798ff22] rounded-2xl overflow-x-auto shadow-2xl shadow-black/40">
      <div className="min-w-[850px]">
        {/* Cabecalho de Profissionais */}
        <div className="grid grid-cols-[100px_repeat(auto-fit,minmax(220px,1fr))] border-b border-[#d798ff22] bg-[#160d20]">
          <div className="p-3.5 text-[11px] font-black text-[#887591] uppercase tracking-wider flex items-center justify-center border-r border-[#d798ff22]">
            Horario
          </div>
          {professionals.map((prof) => (
            <div
              key={prof.id}
              className="p-3.5 flex items-center gap-3 border-r border-[#d798ff22] last:border-r-0"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#c22ef3] to-[#f33199] flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-[#c22ef333]">
                {prof.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-tight">
                  {prof.name}
                </div>
                <div className="text-[10px] text-[#baacc7]">{prof.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Linhas de Horarios */}
        <div className="divide-y divide-[#d798ff15]">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid grid-cols-[100px_repeat(auto-fit,minmax(220px,1fr))] min-h-[70px]"
            >
              {/* Eixo de Tempo */}
              <div className="p-3 text-xs font-semibold text-[#baacc7] flex items-start justify-center border-r border-[#d798ff22] bg-[#0c0813]">
                {time}
              </div>

              {/* Colunas dos Barbeiros */}
              {professionals.map((prof) => {
                const app = appointments.find(
                  (a) => a.professionalId === prof.id && a.startTime === time
                );

                return (
                  <div
                    key={`${prof.id}-${time}`}
                    className="p-1.5 border-r border-[#d798ff22] last:border-r-0 relative hover:bg-white/[0.02] transition-colors"
                  >
                    {app ? (
                      <div
                        onClick={() => onSelectAppointment(app)}
                        className={`h-full rounded-xl p-2.5 cursor-pointer transition-all border ${
                          app.status === "HOLD"
                            ? "bg-gradient-to-br from-[#c22ef322] to-[#f3319933] border-[#f33199] shadow-[0_0_15px_#f3319933] animate-pulse"
                            : app.status === "CONFIRMED"
                            ? "bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400"
                            : app.status === "IN_PROGRESS"
                            ? "bg-amber-950/40 border-amber-500/40 hover:border-amber-400"
                            : "bg-[#1f132b]/80 border-[#c22ef344] hover:border-[#c22ef3]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-white truncate max-w-[130px]">
                            {app.customerName}
                          </span>
                          {app.status === "HOLD" ? (
                            <Badge variant="warning" size="sm">
                              Reserva 10m
                            </Badge>
                          ) : app.status === "CONFIRMED" ? (
                            <Badge variant="success" size="sm">
                              Confirmado
                            </Badge>
                          ) : app.status === "IN_PROGRESS" ? (
                            <Badge variant="warning" size="sm">
                              Em Cadeira
                            </Badge>
                          ) : (
                            <Badge variant="purple" size="sm">
                              Agendado
                            </Badge>
                          )}
                        </div>

                        <div className="text-[11px] text-[#eee3f7] font-medium truncate">
                          {app.serviceName}
                        </div>

                        <div className="flex items-center justify-between mt-1 text-[10px] text-[#baacc7]">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={10} />
                            {app.startTime} as {app.endTime}
                          </span>
                          <span className="font-bold text-[#de74f6]">
                            {app.priceFormatted}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectSlot(prof.id, time)}
                        className="w-full h-full min-h-[50px] rounded-lg border border-dashed border-[#d798ff22] hover:border-[#c22ef377] hover:bg-[#c22ef30a] flex items-center justify-center text-[10px] font-semibold text-[#887591] hover:text-[#de74f6] transition-all"
                      >
                        + Disponivel
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

