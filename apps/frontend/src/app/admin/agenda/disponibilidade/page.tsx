"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Coffee,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";

const DIAS_SEMANA = [
  { id: 1, label: "Segunda-feira" },
  { id: 2, label: "Terça-feira" },
  { id: 3, label: "Quarta-feira" },
  { id: 4, label: "Quinta-feira" },
  { id: 5, label: "Sexta-feira" },
  { id: 6, label: "Sábado" },
  { id: 0, label: "Domingo" },
];

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4).toString().padStart(2, "0");
  const minutes = ((i % 4) * 15).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
});

interface DaySchedule {
  dayOfWeek: number;
  active: boolean;
  startTime: string;
  endTime: string;
  hasBreak: boolean;
  breakStartTime: string;
  breakEndTime: string;
}

interface Professional {
  id: string;
  name: string;
  nickname: string | null;
  color: string | null;
  active: boolean;
  workSchedules: any[];
}

interface ScheduleException {
  id: string;
  professionalId: string | null;
  date: string;
  isAvailable: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  professional?: { name: string };
}

// Componente TimePicker Customizado de 15 minutos
function CustomTimePicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-slate-100 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 hover:border-[#c22ef3]/50 rounded-xl h-9 px-3 w-28 text-xs transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "text-gray-900 dark:text-white cursor-pointer"
        }`}
      >
        <span className="font-bold tracking-tight">{value}</span>
        <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-28 bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/15 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-56 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/20">
            {TIME_OPTIONS.map((time) => (
              <button
                type="button"
                key={time}
                onClick={() => {
                  onChange(time);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  value === time
                    ? "bg-[#c22ef3] text-white font-bold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {time}
                {value === time && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DisponibilidadeAgendaPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfId, setSelectedProfId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Grade Semanal do Barbeiro Selecionado
  const [schedules, setSchedules] = useState<Record<number, DaySchedule>>({
    1: { dayOfWeek: 1, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
    2: { dayOfWeek: 2, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
    3: { dayOfWeek: 3, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
    4: { dayOfWeek: 4, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
    5: { dayOfWeek: 5, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
    6: { dayOfWeek: 6, active: true, startTime: "08:30", endTime: "18:00", hasBreak: true, breakStartTime: "12:30", breakEndTime: "13:30" },
    0: { dayOfWeek: 0, active: false, startTime: "09:00", endTime: "14:00", hasBreak: false, breakStartTime: "12:00", breakEndTime: "13:00" },
  });

  // Excecoes e Folgas Pontuais
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [newExceptionReason, setNewExceptionReason] = useState("");
  const [isAddingException, setIsAddingException] = useState(false);

  const fetchProfessionals = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:3001/api/v1/professionals?organizationId=org-barone-matriz");
      if (res.ok) {
        const json = await res.json();
        const profs: Professional[] = json.data || [];
        setProfessionals(profs);
        if (profs.length > 0 && !selectedProfId) {
          setSelectedProfId(profs[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar lista de profissionais.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProfId]);

  const fetchExceptions = useCallback(async (profId?: string) => {
    try {
      const url = profId
        ? `http://localhost:3001/api/v1/availability/exceptions?organizationId=org-barone-matriz&professionalId=${profId}`
        : `http://localhost:3001/api/v1/availability/exceptions?organizationId=org-barone-matriz`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setExceptions(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  // Ao mudar o profissional selecionado, carrega suas escalas do banco
  useEffect(() => {
    if (!selectedProfId) return;

    const prof = professionals.find((p) => p.id === selectedProfId);
    if (prof && prof.workSchedules && prof.workSchedules.length > 0) {
      const mapped: Record<number, DaySchedule> = { ...schedules };
      DIAS_SEMANA.forEach((d) => {
        const found = prof.workSchedules.find((ws: any) => ws.dayOfWeek === d.id);
        if (found) {
          mapped[d.id] = {
            dayOfWeek: d.id,
            active: found.active,
            startTime: found.startTime || "09:00",
            endTime: found.endTime || "19:00",
            hasBreak: Boolean(found.breakStartTime && found.breakEndTime),
            breakStartTime: found.breakStartTime || "12:00",
            breakEndTime: found.breakEndTime || "13:00",
          };
        } else {
          mapped[d.id] = {
            dayOfWeek: d.id,
            active: false,
            startTime: "09:00",
            endTime: "19:00",
            hasBreak: false,
            breakStartTime: "12:00",
            breakEndTime: "13:00",
          };
        }
      });
      setSchedules(mapped);
    }

    fetchExceptions(selectedProfId);
  }, [selectedProfId, professionals, fetchExceptions]);

  const handleToggleDay = (dayOfWeek: number) => {
    setSchedules((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        active: !prev[dayOfWeek].active,
      },
    }));
  };

  const handleToggleBreak = (dayOfWeek: number) => {
    setSchedules((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        hasBreak: !prev[dayOfWeek].hasBreak,
      },
    }));
  };

  const handleUpdateSchedule = (dayOfWeek: number, field: keyof DaySchedule, value: any) => {
    setSchedules((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }));
  };

  const handleSaveSchedules = async () => {
    if (!selectedProfId) return;

    try {
      setIsSaving(true);
      const payload = Object.values(schedules).map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        breakStartTime: s.hasBreak ? s.breakStartTime : null,
        breakEndTime: s.hasBreak ? s.breakEndTime : null,
        active: s.active,
      }));

      const res = await fetch("http://localhost:3001/api/v1/availability/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: "org-barone-matriz",
          professionalId: selectedProfId,
          schedules: payload,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar escalas no servidor.");
      toast.success("Grade de horários do barbeiro salva com sucesso!");
      fetchProfessionals();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExceptionDate) {
      toast.error("Informe a data da folga ou exceção.");
      return;
    }

    try {
      setIsAddingException(true);
      const res = await fetch("http://localhost:3001/api/v1/availability/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: "org-barone-matriz",
          professionalId: selectedProfId || null,
          date: newExceptionDate,
          isAvailable: false, // folga/bloqueio
          reason: newExceptionReason || "Folga / Não atende",
        }),
      });

      if (!res.ok) throw new Error("Falha ao registrar exceção.");
      toast.success("Exceção de agenda cadastrada!");
      setNewExceptionDate("");
      setNewExceptionReason("");
      fetchExceptions(selectedProfId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAddingException(false);
    }
  };

  const handleDeleteException = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/v1/availability/exceptions/${id}?organizationId=org-barone-matriz`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Exceção removida.");
        fetchExceptions(selectedProfId);
      }
    } catch {
      toast.error("Erro ao remover exceção.");
    }
  };

  const currentProf = professionals.find((p) => p.id === selectedProfId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#c22ef3]" />
            Gestão de Escalas & Disponibilidade
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Defina as jornadas semanais de atendimento, intervalos de almoço e bloqueios pontuais por profissional.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleSaveSchedules}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-black tracking-wide shadow-lg shadow-[#c22ef3]/20 transition-all flex items-center gap-2"
          >
            {isSaving ? <Spinner className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            Salvar Escala Semanal
          </button>
        </div>
      </div>

      {/* Seletor de Barbeiro */}
      <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-xs transition-colors">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">
          Selecione o Barbeiro / Profissional para Ajustar a Grade
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {professionals.map((prof) => {
            const isSelected = prof.id === selectedProfId;
            return (
              <button
                key={prof.id}
                onClick={() => setSelectedProfId(prof.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#c22ef3]/15 border-[#c22ef3] text-gray-900 dark:text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#0B0D11] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: prof.color || "#c22ef3" }}
                />
                <span>{prof.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#c22ef3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Semanal */}
      <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#c22ef3]" />
              Jornada Semanal de Atendimento
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Horários de início, término e intervalo de descanso para{" "}
              <strong className="text-gray-900 dark:text-white">{currentProf?.name || "o profissional"}</strong>.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-600 dark:text-gray-300">
            Fuso: America/São Paulo (-03:00)
          </span>
        </div>

        {/* Lista de Dias da Semana */}
        <div className="space-y-3">
          {DIAS_SEMANA.map((dia) => {
            const item = schedules[dia.id] || {
              dayOfWeek: dia.id,
              active: false,
              startTime: "09:00",
              endTime: "19:00",
              hasBreak: false,
              breakStartTime: "12:00",
              breakEndTime: "13:00",
            };

            return (
              <div
                key={dia.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.active
                    ? "bg-slate-50 dark:bg-[#0B0D11] border-gray-200 dark:border-white/10"
                    : "bg-slate-50/50 dark:bg-[#0B0D11]/40 border-gray-100 dark:border-white/5 opacity-60"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Dia & Ativo Toggle */}
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(dia.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        item.active ? "bg-[#c22ef3]" : "bg-gray-300 dark:bg-white/15"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          item.active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{dia.label}</span>
                  </div>

                  {/* Horário Principal de Trabalho */}
                  {item.active ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Das</span>
                        <CustomTimePicker
                          value={item.startTime}
                          onChange={(val) => handleUpdateSchedule(dia.id, "startTime", val)}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">às</span>
                        <CustomTimePicker
                          value={item.endTime}
                          onChange={(val) => handleUpdateSchedule(dia.id, "endTime", val)}
                        />
                      </div>

                      {/* Intervalo de Almoço / Pausa */}
                      <div className="flex items-center gap-2 pl-2 lg:border-l border-gray-200 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => handleToggleBreak(dia.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            item.hasBreak
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "bg-slate-200/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          <Coffee className="w-3.5 h-3.5" />
                          {item.hasBreak ? "Almoço Ativo" : "+ Intervalo Almoço"}
                        </button>

                        {item.hasBreak && (
                          <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                            <CustomTimePicker
                              value={item.breakStartTime}
                              onChange={(val) => handleUpdateSchedule(dia.id, "breakStartTime", val)}
                            />
                            <span className="text-xs text-gray-400 dark:text-gray-500">às</span>
                            <CustomTimePicker
                              value={item.breakEndTime}
                              onChange={(val) => handleUpdateSchedule(dia.id, "breakEndTime", val)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">Folga / Não atende neste dia</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exceções e Folgas Pontuais por Data */}
      <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Exceções & Folgas Pontuais (Data Específica)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Bloqueie feriados, atestados médicos ou folgas pontuais sem alterar a escala semanal regular.
            </p>
          </div>
        </div>

        {/* Formulário Rápido de Adição */}
        <form onSubmit={handleAddException} className="flex flex-col sm:flex-row items-center gap-3 mb-6 bg-slate-50 dark:bg-[#0B0D11] p-3 rounded-xl border border-gray-200 dark:border-white/5">
          <input
            type="date"
            required
            value={newExceptionDate}
            onChange={(e) => setNewExceptionDate(e.target.value)}
            className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#c22ef3] w-full sm:w-auto"
          />
          <input
            type="text"
            placeholder="Motivo (ex: Feriado Nacional, Consulta Médica, Treinamento)"
            value={newExceptionReason}
            onChange={(e) => setNewExceptionReason(e.target.value)}
            className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#c22ef3] flex-1 w-full"
          />
          <button
            type="submit"
            disabled={isAddingException}
            className="px-4 py-2 bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-md transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center"
          >
            {isAddingException ? <Spinner className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            Bloquear Data
          </button>
        </form>

        {/* Tabela de Exceções Cadastradas */}
        {exceptions.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-6">
            Nenhuma folga ou exceção registrada para este barbeiro.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {exceptions.map((exc) => (
              <div
                key={exc.id}
                className="bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/5 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-black text-amber-600 dark:text-amber-400 block">{exc.date}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-[11px]">{exc.reason || "Bloqueio Integral"}</span>
                </div>
                <button
                  onClick={() => handleDeleteException(exc.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                  title="Remover Bloqueio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

