"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Play,
  Check,
  XCircle,
  AlertTriangle,
  Users,
  Grid,
  CalendarDays,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";

type ViewMode = "day_columns" | "week" | "month";
type StatusFilter = "ALL" | "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

interface Appointment {
  id: string;
  professionalId: string;
  contactId: string;
  serviceId?: string | null;
  startTime: string; // ISO UTC
  endTime: string;   // ISO UTC
  status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  totalInCents: number;
  notes?: string | null;
  professional?: { id: string; name: string; nickname?: string | null; color?: string | null };
  contact?: { id: string; name: string; phone?: string | null };
  service?: { id: string; name: string; durationMinutes: number; priceInCents: number; color?: string | null };
}

interface Professional {
  id: string;
  name: string;
  nickname: string | null;
  color: string | null;
  active: boolean;
}

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  priceInCents: number;
  color: string | null;
  category: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  SCHEDULED: { label: "Agendado", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  CONFIRMED: { label: "Confirmado", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  IN_PROGRESS: { label: "Em Atendimento", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  COMPLETED: { label: "Concluído", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  CANCELLED: { label: "Cancelado", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  NO_SHOW: { label: "Não Compareceu", bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20" },
};

const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 20; h++) {
  const hh = h.toString().padStart(2, "0");
  TIME_SLOTS.push(`${hh}:00`);
  if (h < 20) {
    TIME_SLOTS.push(`${hh}:15`);
    TIME_SLOTS.push(`${hh}:30`);
    TIME_SLOTS.push(`${hh}:45`);
  }
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros e Navegação
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day_columns");
  const [selectedProfFilter, setSelectedProfFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilter>("ALL");

  // Modal Novo Agendamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formCustomerPhone, setFormCustomerPhone] = useState("");
  const [formProfId, setFormProfId] = useState("");
  const [formServiceId, setFormServiceId] = useState("");
  const [formTime, setFormTime] = useState("09:00");
  const [formNotes, setFormNotes] = useState("");

  // Ações do Card
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchProfessionals = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/api/v1/professionals?organizationId=org-barone-matriz");
      if (res.ok) {
        const json = await res.json();
        setProfessionals(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/api/v1/services?organizationId=org-barone-matriz");
      if (res.ok) {
        const json = await res.json();
        setServices(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      // Calcula intervalo de busca baseado na viewMode
      let start: Date;
      let end: Date;

      if (viewMode === "day_columns") {
        start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
      } else if (viewMode === "week") {
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        start = startOfMonth(subMonths(currentDate, 1));
        end = endOfMonth(addMonths(currentDate, 1));
      }

      const params = new URLSearchParams({
        organizationId: "org-barone-matriz",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      if (selectedProfFilter !== "ALL") {
        params.append("professionalId", selectedProfFilter);
      }
      if (selectedStatusFilter !== "ALL") {
        params.append("status", selectedStatusFilter);
      }

      const res = await fetch(`http://localhost:3001/api/v1/appointments?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setAppointments(json.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar reservas.");
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, viewMode, selectedProfFilter, selectedStatusFilter]);

  useEffect(() => {
    fetchProfessionals();
    fetchServices();
  }, [fetchProfessionals, fetchServices]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Navegação
  const handlePrev = () => {
    if (viewMode === "day_columns") setCurrentDate((d) => subDays(d, 1));
    else if (viewMode === "week") setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subMonths(d, 1));
  };

  const handleNext = () => {
    if (viewMode === "day_columns") setCurrentDate((d) => addDays(d, 1));
    else if (viewMode === "week") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addMonths(d, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Ações de Atualização de Status
  const handleUpdateStatus = async (appointmentId: string, status: string, msg: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/v1/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();
      toast.success(msg);
      setActiveMenuId(null);
      fetchAppointments();
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  };

  // Criar Agendamento Direto
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName || !formProfId || !formServiceId) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const startTime = new Date(`${dateStr}T${formTime}:00`);

      // Mock contact creation se necessario via backend
      const res = await fetch("http://localhost:3001/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: "org-barone-matriz",
          unitId: "unit-matriz",
          customerName: formCustomerName,
          customerPhone: formCustomerPhone || "41999999999",
          contactId: "contact-temp-balcao",
          professionalId: formProfId,
          serviceId: formServiceId,
          startTime: startTime.toISOString(),
          notes: formNotes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao agendar.");
      }

      toast.success("Agendamento criado com sucesso!");
      setIsModalOpen(false);
      setFormCustomerName("");
      setFormCustomerPhone("");
      setFormNotes("");
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || "Conflito de horário ou erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtragem e mapeamento para colunas de barbeiro no dia
  const activeProfessionals = useMemo(() => {
    if (selectedProfFilter === "ALL") {
      return professionals.filter((p) => p.active);
    }
    return professionals.filter((p) => p.id === selectedProfFilter && p.active);
  }, [professionals, selectedProfFilter]);

  const appointmentsByProf = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    activeProfessionals.forEach((p) => {
      map[p.id] = [];
    });

    appointments.forEach((app) => {
      if (map[app.professionalId]) {
        map[app.professionalId].push(app);
      }
    });

    return map;
  }, [activeProfessionals, appointments]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho Principal */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#c22ef3]" />
            Agenda Operacional da Barbearia
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Visão em tempo real das cadeiras de atendimento, reservas temporárias da BIA e encaixes de balcão.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              if (activeProfessionals.length > 0 && !formProfId) setFormProfId(activeProfessionals[0].id);
              if (services.length > 0 && !formServiceId) setFormServiceId(services[0].id);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-black tracking-wide shadow-lg shadow-[#c22ef3]/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Controles de Navegação e Alternador de Visão */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-[#14171C] p-3 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs transition-colors">
        {/* Navegação de Datas */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-[#c22ef3]/50 transition-all"
          >
            Hoje
          </button>
          <div className="flex items-center bg-slate-100 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl p-0.5">
            <button
              onClick={handlePrev}
              className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Período Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 text-xs font-bold text-gray-900 dark:text-white min-w-[200px] justify-center">
              <CalendarIcon className="w-3.5 h-3.5 text-[#c22ef3]" />
              <span className="capitalize">
                {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <button
              onClick={handleNext}
              className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Próximo Período"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filtros por Barbeiro e Status */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Barbeiro */}
          <select
            value={selectedProfFilter}
            onChange={(e) => setSelectedProfFilter(e.target.value)}
            className="bg-slate-100 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#c22ef3]"
          >
            <option value="ALL">Todos os Barbeiros ({professionals.length})</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Seletor de Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as StatusFilter)}
            className="bg-slate-100 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#c22ef3]"
          >
            <option value="ALL">Todos os Status</option>
            <option value="CONFIRMED">Confirmados</option>
            <option value="IN_PROGRESS">Em Atendimento</option>
            <option value="SCHEDULED">Agendados</option>
            <option value="COMPLETED">Concluídos</option>
            <option value="CANCELLED">Cancelados</option>
            <option value="NO_SHOW">Não Compareceu</option>
          </select>

          {/* Alternador de Modo de Visão */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 p-0.5 rounded-xl ml-2">
            <button
              onClick={() => setViewMode("day_columns")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "day_columns"
                  ? "bg-[#c22ef3] text-white shadow-md shadow-[#c22ef3]/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Colunas Barbeiros</span>
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "week"
                  ? "bg-[#c22ef3] text-white shadow-md shadow-[#c22ef3]/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Semana</span>
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "month"
                  ? "bg-[#c22ef3] text-white shadow-md shadow-[#c22ef3]/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Mês</span>
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA DE VISUALIZAÇÃO */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 bg-white dark:bg-[#14171C] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
          <Spinner className="w-8 h-8 text-[#c22ef3]" />
        </div>
      ) : viewMode === "day_columns" ? (
        /* VISÃO 1: DIA POR COLUNAS DE BARBEIROS */
        <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
          {/* Header das Colunas de Barbeiros */}
          <div
            className="grid border-b border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0D11]"
            style={{ gridTemplateColumns: `80px repeat(${activeProfessionals.length}, minmax(240px, 1fr))` }}
          >
            <div className="p-3 text-[10px] font-black uppercase tracking-wider text-gray-500 border-r border-gray-200 dark:border-white/10 flex items-center justify-center">
              Horário
            </div>
            {activeProfessionals.map((prof) => {
              const profApps = appointmentsByProf[prof.id] || [];
              return (
                <div
                  key={prof.id}
                  className="p-3.5 border-r border-gray-200 dark:border-white/10 last:border-r-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: prof.color || "#c22ef3" }}
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-xs tracking-tight">{prof.name}</h4>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{prof.nickname || "Barbeiro"}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                    {profApps.length} {profApps.length === 1 ? "reserva" : "reservas"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Linhas da Grade de Horários (15 em 15 minutos) */}
          <div className="max-h-[650px] overflow-y-auto divide-y divide-gray-100 dark:divide-white/5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/20">
            {TIME_SLOTS.map((timeSlot) => {
              const isHourHeader = timeSlot.endsWith(":00");
              return (
                <div
                  key={timeSlot}
                  className={`grid transition-colors ${
                    isHourHeader ? "bg-slate-50/50 dark:bg-white/[0.015]" : "hover:bg-slate-50/80 dark:hover:bg-white/[0.01]"
                  }`}
                  style={{ gridTemplateColumns: `80px repeat(${activeProfessionals.length}, minmax(240px, 1fr))` }}
                >
                  {/* Coluna de Horário */}
                  <div
                    className={`p-2 border-r border-gray-200 dark:border-white/10 flex items-center justify-center text-xs font-mono ${
                      isHourHeader ? "font-black text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500 text-[11px]"
                    }`}
                  >
                    {timeSlot}
                  </div>

                  {/* Células por Barbeiro */}
                  {activeProfessionals.map((prof) => {
                    const profApps = appointmentsByProf[prof.id] || [];
                    // Verifica se há agendamento iniciando neste slot
                    const appStartingHere = profApps.filter((a) => {
                      const startTimeUtc = new Date(a.startTime);
                      const timeStr = format(startTimeUtc, "HH:mm");
                      return timeStr === timeSlot;
                    });

                    return (
                      <div
                        key={prof.id}
                        className="p-1 border-r border-gray-200 dark:border-white/10 last:border-r-0 min-h-[46px] relative group"
                      >
                        {appStartingHere.map((app) => {
                          const statusInfo = STATUS_MAP[app.status] || STATUS_MAP.SCHEDULED;
                          const startTimeStr = format(new Date(app.startTime), "HH:mm");
                          const endTimeStr = format(new Date(app.endTime), "HH:mm");

                          return (
                            <div
                              key={app.id}
                              className="rounded-xl p-2.5 border transition-all shadow-xs relative group/card bg-slate-50 dark:bg-[#100b17] border-gray-200 dark:border-white/10"
                              style={{
                                borderLeftColor: app.service?.color || "#3B82F6",
                                borderLeftWidth: "4px",
                              }}
                            >
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <span className="font-bold text-gray-900 dark:text-white text-xs tracking-tight line-clamp-1">
                                  {app.contact?.name || "Cliente Balcão"}
                                </span>
                                <div className="relative">
                                  <button
                                    onClick={() =>
                                      setActiveMenuId(activeMenuId === app.id ? null : app.id)
                                    }
                                    className="p-1 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-md hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Menu de Ações (BookingActionMenu) */}
                                  {activeMenuId === app.id && (
                                    <div className="absolute right-0 top-6 z-50 w-44 bg-white dark:bg-[#0B0D11] border border-gray-200 dark:border-white/15 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100">
                                      <button
                                        onClick={() =>
                                          handleUpdateStatus(app.id, "IN_PROGRESS", "Atendimento iniciado!")
                                        }
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-colors text-left"
                                      >
                                        <Play className="w-3.5 h-3.5" /> Iniciar Atendimento
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleUpdateStatus(app.id, "COMPLETED", "Atendimento concluído!")
                                        }
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-purple-500 hover:bg-purple-500/10 transition-colors text-left"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Concluir Atendimento
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleUpdateStatus(app.id, "NO_SHOW", "Marcado como não compareceu.")
                                        }
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left"
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5" /> Não Compareceu
                                      </button>
                                      <div className="my-1 border-t border-gray-100 dark:border-white/5" />
                                      <button
                                        onClick={() =>
                                          handleUpdateStatus(app.id, "CANCELLED", "Agendamento cancelado.")
                                        }
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left"
                                      >
                                        <XCircle className="w-3.5 h-3.5" /> Cancelar Reserva
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium mb-1 line-clamp-1">
                                {app.service?.name || "Serviço Padrão"}
                              </p>

                              <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1 font-mono font-bold text-gray-700 dark:text-gray-200">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  {startTimeStr} - {endTimeStr}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border}`}
                                >
                                  {statusInfo.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Botão de Encaixe Rápido ao Passar o Mouse */}
                        {appStartingHere.length === 0 && (
                          <button
                            onClick={() => {
                              setFormProfId(prof.id);
                              setFormTime(timeSlot);
                              setIsModalOpen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-1 rounded-lg border border-dashed border-gray-300 dark:border-white/20 bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05] flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold"
                          >
                            + Encaixar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === "week" ? (
        /* VISÃO 2: SEMANA */
        <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xs">
          <div className="grid grid-cols-7 gap-3">
            {eachDayOfInterval({
              start: startOfWeek(currentDate, { weekStartsOn: 1 }),
              end: endOfWeek(currentDate, { weekStartsOn: 1 }),
            }).map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const isTodayDay = isToday(day);
              const dayApps = appointments.filter((a) => {
                const appDate = format(new Date(a.startTime), "yyyy-MM-dd");
                return appDate === dayStr;
              });

              return (
                <div
                  key={dayStr}
                  className={`bg-slate-50 dark:bg-[#0B0D11] border rounded-xl p-3 min-h-[350px] flex flex-col justify-between ${
                    isTodayDay ? "border-[#c22ef3]" : "border-gray-200 dark:border-white/5"
                  }`}
                >
                  <div>
                    <div className="text-center pb-2 border-b border-gray-200 dark:border-white/5 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                        {format(day, "EEE", { locale: ptBR })}
                      </span>
                      <span
                        className={`text-sm font-black inline-block px-2 py-0.5 rounded-md mt-0.5 ${
                          isTodayDay ? "bg-[#c22ef3] text-white" : "text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {format(day, "dd")}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {dayApps.slice(0, 4).map((app) => (
                        <div
                          key={app.id}
                          className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs shadow-xs"
                        >
                          <div className="font-bold text-gray-900 dark:text-white line-clamp-1">
                            {app.contact?.name || "Cliente"}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            {format(new Date(app.startTime), "HH:mm")} • {app.professional?.name}
                          </div>
                        </div>
                      ))}
                      {dayApps.length > 4 && (
                        <span className="text-[10px] text-gray-500 italic block text-center">
                          +{dayApps.length - 4} outros
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentDate(day);
                      setViewMode("day_columns");
                    }}
                    className="w-full py-1 bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg text-[10px] font-bold transition-colors mt-3"
                  >
                    Ver Dia
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VISÃO 3: MÊS */
        <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xs">
          <div className="grid grid-cols-7 gap-2">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((h) => (
              <div key={h} className="text-center text-xs font-black text-gray-500 uppercase pb-2">
                {h}
              </div>
            ))}
            {eachDayOfInterval({
              start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
              end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }),
            }).map((day) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDay = isToday(day);
              const dayStr = format(day, "yyyy-MM-dd");
              const dayApps = appointments.filter((a) => {
                const appDate = format(new Date(a.startTime), "yyyy-MM-dd");
                return appDate === dayStr;
              });

              return (
                <div
                  key={dayStr}
                  onClick={() => {
                    setCurrentDate(day);
                    setViewMode("day_columns");
                  }}
                  className={`bg-slate-50 dark:bg-[#0B0D11] border rounded-xl p-2 min-h-[90px] cursor-pointer transition-all hover:border-[#c22ef3]/50 flex flex-col justify-between ${
                    isTodayDay
                      ? "border-[#c22ef3]"
                      : isCurrentMonth
                      ? "border-gray-200 dark:border-white/5"
                      : "border-transparent opacity-30"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isTodayDay ? "text-[#c22ef3]" : isCurrentMonth ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayApps.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c22ef3]" />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                        {dayApps.length} {dayApps.length === 1 ? "reserva" : "reservas"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Criação de Agendamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative transition-colors">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 mb-1">
              <CalendarDays className="w-5 h-5 text-[#c22ef3]" />
              Novo Agendamento na Recepção
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Bloqueia o horário atômico no banco de dados e sincroniza com a BIA no WhatsApp.
            </p>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silveira"
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#c22ef3]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1">
                  Telefone WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: (41) 98888-7777"
                  value={formCustomerPhone}
                  onChange={(e) => setFormCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#c22ef3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1">
                    Barbeiro *
                  </label>
                  <select
                    value={formProfId}
                    onChange={(e) => setFormProfId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#c22ef3]"
                  >
                    {activeProfessionals.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1">
                    Horário de Início *
                  </label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white font-mono focus:outline-none focus:border-[#c22ef3]"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1">
                  Serviço Pretendido *
                </label>
                <select
                  value={formServiceId}
                  onChange={(e) => setFormServiceId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#c22ef3]"
                >
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} - R$ {(svc.priceInCents / 100).toFixed(2).replace(".", ",")} ({svc.durationMinutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1">
                  Notas / Preferências
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Prefere corte bem baixo na tesoura, cliente novo."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#c22ef3] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-black tracking-wide shadow-lg shadow-[#c22ef3]/20 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Spinner className="w-4 h-4 text-white" /> : <Check className="w-4 h-4" />}
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
