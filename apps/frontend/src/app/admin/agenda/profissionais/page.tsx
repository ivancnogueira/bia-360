"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Plus,
  Mail,
  Phone,
  Clock,
  Globe,
  Copy,
  Check,
  Percent,
  ArrowLeft,
  Pencil,
  Power,
  Shield,
  Sparkles,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";

interface ScheduleScheme {
  id: string;
  name: string;
  timeZone: string;
  isDefault: boolean;
}

interface Professional {
  id: string;
  organizationId: string;
  name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  slug: string | null;
  commissionRate: number;
  color: string | null;
  scheduleId: string | null;
  active: boolean;
  schedule?: ScheduleScheme | null;
}

const PALETA_CORES = [
  "#c22ef3", // Roxo neon BIA
  "#3B82F6", // Azul elétrico
  "#10B981", // Verde esmeralda
  "#F59E0B", // Âmbar / Dourado
  "#EF4444", // Vermelho rubi
  "#EC4899", // Rosa vibrante
  "#06B6D4", // Ciano
  "#8B5CF6", // Índigo
];

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [schemes, setSchemes] = useState<ScheduleScheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modo In-Focus: "list" ou "form" (Zero modais)
  const [view, setView] = useState<"list" | "form">("list");
  const [editingProfId, setEditingProfId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos do Formulário In-Focus
  const [formName, setFormName] = useState("");
  const [formNickname, setFormNickname] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCommissionRate, setFormCommissionRate] = useState(50);
  const [formColor, setFormColor] = useState("#c22ef3");
  const [formScheduleId, setFormScheduleId] = useState("");
  const [formActive, setFormActive] = useState(true);

  const fetchSchemes = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/api/v1/availability/schemes?organizationId=org-barone-matriz");
      if (res.ok) {
        const json = await res.json();
        setSchemes(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchProfessionals = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:3001/api/v1/professionals?organizationId=org-barone-matriz");
      if (res.ok) {
        const json = await res.json();
        setProfessionals(json.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar profissionais.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
    fetchSchemes();
  }, [fetchProfessionals, fetchSchemes]);

  // Abertura do formulário In-Focus para novo cadastro
  const handleOpenNew = () => {
    setEditingProfId(null);
    setFormName("");
    setFormNickname("");
    setFormEmail("");
    setFormPhone("");
    setFormSlug("");
    setFormCommissionRate(50);
    setFormColor("#c22ef3");
    setFormScheduleId(schemes.length > 0 ? schemes[0].id : "");
    setFormActive(true);
    setView("form");
  };

  // Abertura do formulário In-Focus para edição
  const handleOpenEdit = (prof: Professional) => {
    setEditingProfId(prof.id);
    setFormName(prof.name);
    setFormNickname(prof.nickname || "");
    setFormEmail(prof.email || "");
    setFormPhone(prof.phone || "");
    setFormSlug(prof.slug || "");
    setFormCommissionRate(prof.commissionRate || 50);
    setFormColor(prof.color || "#c22ef3");
    setFormScheduleId(prof.scheduleId || (schemes.length > 0 ? schemes[0].id : ""));
    setFormActive(prof.active);
    setView("form");
  };

  // Geração automática de slug a partir do nome se o usuário não digitar um
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingProfId && !formSlug) {
      const autoSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setFormSlug(autoSlug);
    }
  };

  // Submissão do Formulário In-Focus (POST ou PUT)
  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Informe o nome do profissional.");
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingProfId
        ? `http://localhost:3001/api/v1/professionals/${editingProfId}`
        : "http://localhost:3001/api/v1/professionals";

      const method = editingProfId ? "PUT" : "POST";

      const payload = {
        organizationId: "org-barone-matriz",
        name: formName.trim(),
        nickname: formNickname.trim() || null,
        email: formEmail.trim() || null,
        phone: formPhone.trim() || null,
        slug: formSlug.trim() || null,
        commissionRate: Number(formCommissionRate),
        color: formColor,
        scheduleId: formScheduleId || null,
        active: formActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar profissional.");
      }

      toast.success(editingProfId ? "Barbeiro atualizado com sucesso!" : "Barbeiro cadastrado com sucesso!");
      setView("list");
      fetchProfessionals();
    } catch (err: any) {
      toast.error(err.message || "Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualização rápida de Slug direto na listagem
  const handleInlineSlugUpdate = async (profId: string, slugVal: string) => {
    const cleanSlug = slugVal.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-|-$/g, "");
    try {
      const res = await fetch(`http://localhost:3001/api/v1/professionals/${profId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: cleanSlug }),
      });
      if (res.ok) {
        toast.success("Link público atualizado!");
        fetchProfessionals();
      }
    } catch {
      toast.error("Erro ao atualizar link.");
    }
  };

  // Alternar status ativo/inativo
  const handleToggleActive = async (prof: Professional) => {
    try {
      const res = await fetch(`http://localhost:3001/api/v1/professionals/${prof.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !prof.active }),
      });
      if (res.ok) {
        toast.success(prof.active ? "Barbeiro pausado." : "Barbeiro ativado!");
        fetchProfessionals();
      }
    } catch {
      toast.error("Erro ao alterar status.");
    }
  };

  const copyPublicLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/agendar/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    toast.success("Link copiado para a área de transferência!");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // =========================================================================
  // VIEW IN-FOCUS: FORMULÁRIO DE BARBEIRO (ZERO MODAIS)
  // =========================================================================
  if (view === "form") {
    return (
      <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
        {/* Cabeçalho In-Focus */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("list")}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#14171C] hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-colors"
              title="Voltar para a Lista"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                <span>Barbeiros & Profissionais</span>
                <span>/</span>
                <span className="text-[#c22ef3] font-semibold">
                  {editingProfId ? "Editar Barbeiro" : "Novo Cadastro"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <User className="w-6 h-6 text-[#c22ef3]" />
                {editingProfId ? "Editar Cadastro do Barbeiro" : "Cadastrar Novo Barbeiro"}
              </h1>
            </div>
          </div>

          <button
            onClick={() => setView("list")}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors self-start sm:self-auto"
          >
            ← Voltar para a Lista
          </button>
        </div>

        {/* Card do Formulário In-Focus */}
        <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xs transition-colors">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Perfil & Jornada de Atendimento</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Configure os dados cadastrais, porcentagem de comissão, link da agenda pública individual e vincule ao esquema de horários.
            </p>
          </div>

          <form onSubmit={handleSaveProfessional} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#c22ef3]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  Apelido / Nome na Cadeira
                </label>
                <input
                  type="text"
                  placeholder="Ex: Barone, Vitinho, Mestre"
                  value={formNickname}
                  onChange={(e) => setFormNickname(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#c22ef3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  Telefone WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Ex: (41) 98888-7777"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#c22ef3]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="Ex: barbeiro@baroneacademy.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#c22ef3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Slug da Agenda Pública */}
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  Slug da Agenda Pública Individual
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 focus-within:border-[#c22ef3]">
                  <span className="text-xs text-gray-500 font-mono select-none">/agendar/</span>
                  <input
                    type="text"
                    placeholder="carlos-barone"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    className="flex-1 bg-transparent border-none outline-none text-xs font-mono font-bold text-[#c22ef3] placeholder-gray-400 dark:placeholder-gray-600 ml-1"
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Link que o barbeiro pode colocar na bio do Instagram para reservas exclusivas.
                </p>
              </div>

              {/* Comissão Padrão (%) */}
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  Taxa de Comissão (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formCommissionRate}
                    onChange={(e) => setFormCommissionRate(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#c22ef3]"
                  />
                  <Percent className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Vínculo ao Esquema de Disponibilidade */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                Esquema de Disponibilidade Vinculado *
              </label>
              <select
                value={formScheduleId}
                onChange={(e) => setFormScheduleId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#c22ef3]"
              >
                {schemes.map((scheme) => (
                  <option key={scheme.id} value={scheme.id}>
                    {scheme.name} {scheme.isDefault ? "(Padrão da Barbearia)" : ""} • {scheme.timeZone}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Conecta a grade semanal de atendimento, intervalos de almoço e folgas deste barbeiro.
              </p>
            </div>

            {/* Cor de Identificação na Grade da Agenda */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
                Cor de Identificação na Agenda
              </label>
              <div className="flex items-center gap-3">
                {PALETA_CORES.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setFormColor(cor)}
                    className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center shadow-xs ${
                      formColor === cor ? "scale-115 ring-2 ring-offset-2 ring-[#c22ef3]" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: cor }}
                  >
                    {formColor === cor && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setView("list")}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-black tracking-wide shadow-lg shadow-[#c22ef3]/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? <Spinner className="w-4 h-4 text-white" /> : <Check className="w-4 h-4" />}
                {editingProfId ? "Salvar Alterações" : "Cadastrar Barbeiro"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW PRINCIPAL: LISTA DE BARBEIROS (ESTILO NAVICHATS)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-[#c22ef3]" />
            Barbeiros & Profissionais
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Gerencie os barbeiros da barbearia, links públicos individuais de agendamento e esquemas de trabalho.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-black tracking-wide shadow-lg shadow-[#c22ef3]/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Novo Barbeiro
        </button>
      </div>

      {/* Lista de Barbeiros */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 bg-white dark:bg-[#14171C] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
          <Spinner className="w-8 h-8 text-[#c22ef3]" />
        </div>
      ) : professionals.length === 0 ? (
        <div className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#c22ef3]/10 text-[#c22ef3] flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Nenhum barbeiro cadastrado
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">
            Cadastre os membros da equipe para habilitar colunas na agenda e links públicos de atendimento.
          </p>
          <button
            onClick={handleOpenNew}
            className="px-5 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-bold transition-all"
          >
            Cadastrar Primeiro Barbeiro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {professionals.map((prof) => {
            const schemeName = prof.schedule?.name || "Esquema Comercial Padrão";
            const currentSlug = prof.slug || `barbeiro-${prof.id.slice(0, 5)}`;

            return (
              <div
                key={prof.id}
                className="bg-white dark:bg-[#14171C] border border-gray-200 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-xs hover:border-[#c22ef3]/40 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Avatar e Identificação */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0"
                      style={{ backgroundColor: prof.color || "#c22ef3" }}
                    >
                      {prof.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base tracking-tight">
                          {prof.name}
                        </h3>
                        {prof.nickname && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                            {prof.nickname}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                            prof.active
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                          }`}
                        >
                          {prof.active ? "Ativo" : "Pausado"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {prof.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {prof.phone}
                          </span>
                        )}
                        {prof.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {prof.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Percent className="w-3.5 h-3.5" />
                          Comissão: {prof.commissionRate}%
                        </span>
                        <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {schemeName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleToggleActive(prof)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        prof.active
                          ? "border-gray-200 dark:border-white/10 text-gray-500 hover:text-amber-500 hover:bg-amber-500/10"
                          : "border-emerald-500/30 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                      }`}
                      title={prof.active ? "Pausar Atendimentos" : "Ativar Barbeiro"}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(prof)}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0D11] hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  </div>
                </div>

                {/* Barra do Link Público da Agenda Individual (estilo NaviChats) */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
                      Link Público:
                    </span>
                    <div className="flex-1 flex items-center bg-slate-100 dark:bg-[#0B0D11] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-1.5 focus-within:border-[#c22ef3]">
                      <span className="text-xs text-gray-500 font-mono select-none">/agendar/</span>
                      <input
                        type="text"
                        defaultValue={currentSlug}
                        onBlur={(e) => {
                          if (e.target.value !== currentSlug) {
                            handleInlineSlugUpdate(prof.id, e.target.value);
                          }
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-xs font-mono font-bold text-[#c22ef3] ml-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyPublicLink(currentSlug)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0D11] hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1.5"
                      title="Copiar Link de Agendamento"
                    >
                      {copiedSlug === currentSlug ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`/agendar/${currentSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0D11] hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                      title="Abrir página pública de agendamento"
                    >
                      <Globe className="w-4 h-4 text-[#c22ef3]" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

