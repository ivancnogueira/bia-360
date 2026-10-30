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
  ArrowLeft,
  Pencil,
  Users,
  Shield,
  Sparkles,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";

const DIAS_SEMANA = [
  { id: 1, label: "Segunda-feira", short: "Seg" },
  { id: 2, label: "Terça-feira", short: "Ter" },
  { id: 3, label: "Quarta-feira", short: "Qua" },
  { id: 4, label: "Quinta-feira", short: "Qui" },
  { id: 5, label: "Sexta-feira", short: "Sex" },
  { id: 6, label: "Sábado", short: "Sáb" },
  { id: 0, label: "Domingo", short: "Dom" },
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
}

interface ScheduleScheme {
  id: string;
  organizationId: string;
  name: string;
  timeZone: string;
  isDefault: boolean;
  workSchedules: any[];
  professionals: { id: string; name: string; nickname?: string | null; color?: string | null; slug?: string | null }[];
}

interface ScheduleException {
  id: string;
  professionalId: string | null;
  date: string;
  isAvailable: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
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
  const [schemes, setSchemes] = useState<ScheduleScheme[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modo In-Focus: "list" ou "edit" (Zero modais)
  const [view, setView] = useState<"list" | "edit">("list");
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Campos do Esquema em Edição In-Focus
  const [formName, setFormName] = useState("Horário Comercial Padrão");
  const [formTimeZone, setFormTimeZone] = useState("America/Sao_Paulo");
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [selectedProfIds, setSelectedProfIds] = useState<string[]>([]);

  // Grade Semanal do Esquema em Edição
  const [schedules, setSchedules] = useState<Record<number, DaySchedule>>({
    1: { dayOfWeek: 1, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
    2: { dayOfWeek: 2, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
    3: { dayOfWeek: 3, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
    4: { dayOfWeek: 4, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
    5: { dayOfWeek: 5, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
    6: { dayOfWeek: 6, active: true, startTime: "08:30", endTime: "18:00", hasBreak: true, breakStartTime: "12:30", breakEndTime: "13:30" },
    0: { dayOfWeek: 0, active: false, startTime: "09:00", endTime: "14:00", hasBreak: false, breakStartTime: "12:00", breakEndTime: "13:00" },
  });

  // Exceções e Folgas Pontuais
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [newExceptionReason, setNewExceptionReason] = useState("");
  const [isAddingException, setIsAddingException] = useState(false);

  const fetchSchemes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:3001/api/v1/availability/schemes?organizationId=org-barone-matriz");
      if (res.ok) {
        const json = await res.json();
        setSchemes(json.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar esquemas de disponibilidade.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProfessionals = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/api/v1/professionals?organizationId=org-barone-matriz");
      if (res.ok) {
        const json = await res.json();
        setProfessionals(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchExceptions = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/api/v1/availability/exceptions?organizationId=org-barone-matriz");
      if (res.ok) {
        const json = await res.json();
        setExceptions(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchSchemes();
    fetchProfessionals();
    fetchExceptions();
  }, [fetchSchemes, fetchProfessionals, fetchExceptions]);

  // Abertura do modo In-Focus para novo esquema
  const handleOpenNewScheme = () => {
    setEditingSchemeId(null);
    setFormName("Novo Esquema de Atendimento");
    setFormTimeZone("America/Sao_Paulo");
    setFormIsDefault(false);
    setSelectedProfIds([]);
    setSchedules({
      1: { dayOfWeek: 1, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
      2: { dayOfWeek: 2, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
      3: { dayOfWeek: 3, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
      4: { dayOfWeek: 4, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
      5: { dayOfWeek: 5, active: true, startTime: "09:00", endTime: "19:00", hasBreak: true, breakStartTime: "12:00", breakEndTime: "13:00" },
      6: { dayOfWeek: 6, active: true, startTime: "08:30", endTime: "18:00", hasBreak: true, breakStartTime: "12:30", breakEndTime: "13:30" },
      0: { dayOfWeek: 0, active: false, startTime: "09:00", endTime: "14:00", hasBreak: false, breakStartTime: "12:00", breakEndTime: "13:00" },
    });
    setView("edit");
  };

  // Abertura do modo In-Focus para editar esquema existente
  const handleOpenEditScheme = (scheme: ScheduleScheme) => {
    setEditingSchemeId(scheme.id);
    setFormName(scheme.name);
    setFormTimeZone(scheme.timeZone || "America/Sao_Paulo");
    setFormIsDefault(scheme.isDefault);
    setSelectedProfIds(scheme.professionals.map((p) => p.id));

    // Mapeia grade semanal do esquema
    const mapped: Record<number, DaySchedule> = { ...schedules };
    DIAS_SEMANA.forEach((d) => {
      const found = scheme.workSchedules?.find((ws: any) => ws.dayOfWeek === d.id);
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
    setView("edit");
  };

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

  const handleToggleProfBinding = (profId: string) => {
    setSelectedProfIds((prev) =>
      prev.includes(profId) ? prev.filter((id) => id !== profId) : [...prev, profId]
    );
  };

  // Salvar Esquema In-Focus
  const handleSaveScheme = async () => {
    if (!formName.trim()) {
      toast.error("Informe o nome do esquema.");
      return;
    }

    try {
      setIsSaving(true);
      const payloadSchedules = Object.values(schedules).map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        breakStartTime: s.hasBreak ? s.breakStartTime : null,
        breakEndTime: s.hasBreak ? s.breakEndTime : null,
        active: s.active,
      }));

      const payload = {
        organizationId: "org-barone-matriz",
        name: formName.trim(),
        timeZone: formTimeZone,
        isDefault: formIsDefault,
        schedules: payloadSchedules,
        professionalIds: selectedProfIds,
      };

      const url = editingSchemeId
        ? `http://localhost:3001/api/v1/availability/schemes/${editingSchemeId}`
        : "http://localhost:3001/api/v1/availability/schemes";

      const method = editingSchemeId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar esquema.");
      }

      toast.success(editingSchemeId ? "Esquema atualizado com sucesso!" : "Novo esquema criado com sucesso!");
      setView("list");
      fetchSchemes();
      fetchProfessionals();
    } catch (err: any) {
      toast.error(err.message || "Erro inesperado.");
    } finally {
      setIsSaving(false);
    }
  };

  // Excluir Esquema
  const handleDeleteScheme = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error("Não é permitido excluir o esquema padrão da barbearia.");
      return;
    }
    if (!window.confirm("Deseja realmente excluir este esquema de disponibilidade?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/v1/availability/schemes/${id}?organizationId=org-barone-matriz`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Esquema excluído com sucesso.");
        fetchSchemes();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao excluir.");
      }
    } catch {
      toast.error("Erro ao excluir esquema.");
    }
  };

  // Folgas e Exceções Pontuais
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
          professionalId: null, // Bloqueio geral da barbearia
          date: newExceptionDate,
          isAvailable: false,
          reason: newExceptionReason || "Folga / Não atende",
        }),
      });

      if (!res.ok) throw new Error("Falha ao registrar exceção.");
      toast.success("Exceção cadastrada!");
      setNewExceptionDate("");
      setNewExceptionReason("");
      fetchExceptions();
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
        fetchExceptions();
      }
    } catch {
      toast.error("Erro ao remover exceção.");
    }
  };

  // Helper para resumo dos dias ativos
  const getDaysSummary = (scheme: ScheduleScheme) => {
    const activeDays = scheme.workSchedules?.filter((ws: any) => ws.active).map((ws: any) => {
      const found = DIAS_SEMANA.find((d) => d.id === ws.dayOfWeek);
      return found ? found.short : "";
    });
    return activeDays && activeDays.length > 0 ? activeDays.join(", ") : "Sem dias configurados";
  };

  // =========================================================================
  // VIEW IN-FOCUS: EDITOR DE ESQUEMA DE DISPONIBILIDADE (ZERO MODAIS)
  // =========================================================================
  if (view === "edit") {
    return (
      <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
        {/* Cabeçalho In-Focus */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("list")}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#14171C] hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-colors"
              title="Voltar para a Lista de Esquemas"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                <span>Disponibilidade</span>
                <span>/</span>
                <span className="text-[#c22ef3] font-semibold">
                  {editingSchemeId ? "Editar Esquema" : "Novo Esquema"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#c22ef3]" />
                {editingSchemeId ? formName : "Novo Esquema de Disponibilidade"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setView("list")}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Cancelar
            </button>
            <button
              onClick={handleSaveScheme}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-black tracking-wide shadow-lg shadow-[#c22ef3]/20 transition-all flex items-center gap-2"
            >
              {isSaving ? <Spinner className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
              Salvar Esquema
            </button>
          </div>
        </div>

        {/* Card de Configurações Gerais do Esquema */}
        <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xs transition-colors space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                Nome do Esquema de Atendimento *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Horário Comercial Padrão, Escala Fim de Semana, Turno Tarde"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#c22ef3]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                Fuso Horário
              </label>
              <select
                value={formTimeZone}
                onChange={(e) => setFormTimeZone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#c22ef3]"
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo (-03:00)</option>
                <option value="America/Manaus">America/Manaus (-04:00)</option>
                <option value="America/Cuiaba">America/Cuiaba (-04:00)</option>
              </select>
            </div>
          </div>

          {/* Switch de Esquema Padrão */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/5">
            <button
              type="button"
              onClick={() => setFormIsDefault(!formIsDefault)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                formIsDefault ? "bg-[#c22ef3]" : "bg-gray-300 dark:bg-white/15"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  formIsDefault ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white block">
                Definir como Esquema Padrão da Barbearia
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Novos barbeiros cadastrados assumirão automaticamente este esquema.
              </span>
            </div>
          </div>

          {/* Barbeiros Vinculados a este Esquema */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
              Barbeiros que Utilizam este Esquema ({selectedProfIds.length} selecionados)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {professionals.map((prof) => {
                const isChecked = selectedProfIds.includes(prof.id);
                return (
                  <button
                    type="button"
                    key={prof.id}
                    onClick={() => handleToggleProfBinding(prof.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isChecked
                        ? "bg-[#c22ef3]/15 border-[#c22ef3] text-gray-900 dark:text-white"
                        : "bg-slate-50 dark:bg-[#0B0D11] border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isChecked ? "bg-[#c22ef3] border-[#c22ef3]" : "border-gray-400 dark:border-white/20"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prof.color || "#c22ef3" }} />
                    <span className="truncate">{prof.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grade Semanal de Horários */}
        <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xs transition-colors">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#c22ef3]" />
              Jornada Semanal de Atendimento
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Ative os dias de funcionamento, defina os horários de início e término e pausas para almoço.
            </p>
          </div>

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
        <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xs transition-colors">
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
              placeholder="Motivo (ex: Feriado Nacional, Treinamento Barone Academy)"
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
            <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-4">
              Nenhuma folga ou exceção registrada.
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

  // =========================================================================
  // VIEW PRINCIPAL: LISTAGEM DE ESQUEMAS DE DISPONIBILIDADE (ESTILO NAVICHATS)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#c22ef3]" />
            Disponibilidade
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configure os horários em que a barbearia e os barbeiros estiverem disponíveis para reservas.
          </p>
        </div>

        <button
          onClick={handleOpenNewScheme}
          className="px-5 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-black tracking-wide shadow-lg shadow-[#c22ef3]/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Novo Esquema
        </button>
      </div>

      {/* Lista de Esquemas de Disponibilidade */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 bg-white dark:bg-[#14171C] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
          <Spinner className="w-8 h-8 text-[#c22ef3]" />
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#c22ef3]/10 text-[#c22ef3] flex items-center justify-center mx-auto mb-3">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Nenhum esquema de disponibilidade configurado
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">
            Crie jornadas de trabalho flexíveis para conectar aos profissionais e à grade de agendamentos.
          </p>
          <button
            onClick={handleOpenNewScheme}
            className="px-5 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-bold transition-all"
          >
            Criar Primeiro Esquema
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xs hover:border-[#c22ef3]/40 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                      {scheme.name}
                    </h3>
                    {scheme.isDefault && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#c22ef3]/10 text-[#c22ef3] border border-[#c22ef3]/30 text-[10px] font-black uppercase tracking-wider">
                        Padrão
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {getDaysSummary(scheme)}
                    </span>
                    <span>•</span>
                    <span>{scheme.timeZone}</span>
                    <span>•</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {scheme.professionals?.length || 0} barbeiro(s) vinculado(s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditScheme(scheme)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0D11] hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar Grade
                  </button>
                  {!scheme.isDefault && (
                    <button
                      onClick={() => handleDeleteScheme(scheme.id, scheme.isDefault)}
                      className="p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0D11] hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                      title="Excluir Esquema"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
