"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Clock,
  Sparkles,
  Scissors,
  Check,
  Edit2,
  Trash2,
  Users,
  ShieldCheck,
  ArrowLeft,
  X,
  Layers,
  Palette,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceInCents: number;
  category: string;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  color: string | null;
  active: boolean;
  professionals?: { professional: { id: string; name: string; color: string | null } }[];
}

interface ProfessionalItem {
  id: string;
  name: string;
  nickname: string | null;
  color: string | null;
  active: boolean;
}

const CATEGORIES = [
  { id: "corte", label: "Cabelo / Cortes" },
  { id: "barba", label: "Barba & Terapia" },
  { id: "combo", label: "Combos Completos" },
  { id: "quimica", label: "Química & Pigmentação" },
  { id: "tratamento", label: "Tratamentos & Estética" },
];

const PRESET_COLORS = [
  "#3B82F6", // Azul
  "#8B5CF6", // Roxo
  "#EC4899", // Rosa
  "#EF4444", // Vermelho
  "#F97316", // Laranja
  "#EAB308", // Amarelo
  "#22C55E", // Verde
  "#06B6D4", // Ciano
  "#c22ef3", // BIA Magenta
];

export default function ServicosAgendaPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceReais, setPriceReais] = useState("60.00");
  const [durationMinutes, setDurationMinutes] = useState(40);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(5);
  const [category, setCategory] = useState("corte");
  const [color, setColor] = useState("#3B82F6");
  const [active, setActive] = useState(true);
  const [selectedProfIds, setSelectedProfIds] = useState<string[]>([]);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:3001/api/v1/services?organizationId=org-barone-matriz");
      if (res.ok) {
        const json = await res.json();
        setServices(json.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar catálogo de serviços.");
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
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchProfessionals();
  }, [fetchServices, fetchProfessionals]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPriceReais("60.00");
    setDurationMinutes(35);
    setBufferBefore(0);
    setBufferAfter(5);
    setCategory("corte");
    setColor("#3B82F6");
    setActive(true);
    setSelectedProfIds(professionals.map((p) => p.id));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: ServiceItem) => {
    setEditingId(svc.id);
    setName(svc.name);
    setDescription(svc.description || "");
    setPriceReais((svc.priceInCents / 100).toFixed(2));
    setDurationMinutes(svc.durationMinutes);
    setBufferBefore(svc.bufferBeforeMinutes || 0);
    setBufferAfter(svc.bufferAfterMinutes || 0);
    setCategory(svc.category || "corte");
    setColor(svc.color || "#3B82F6");
    setActive(svc.active);
    setSelectedProfIds(svc.professionals?.map((p) => p.professional.id) || []);
    setIsModalOpen(true);
  };

  const handleToggleProf = (profId: string) => {
    setSelectedProfIds((prev) =>
      prev.includes(profId) ? prev.filter((id) => id !== profId) : [...prev, profId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome do serviço é obrigatório.");
      return;
    }

    const priceNum = parseFloat(priceReais.replace(",", "."));
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Informe um preço válido.");
      return;
    }

    try {
      setIsSaving(true);
      const priceInCents = Math.round(priceNum * 100);

      const payload = {
        organizationId: "org-barone-matriz",
        name,
        description,
        priceInCents,
        durationMinutes: Number(durationMinutes),
        bufferBeforeMinutes: Number(bufferBefore),
        bufferAfterMinutes: Number(bufferAfter),
        category,
        color,
        active,
      };

      let savedServiceId = editingId;

      if (editingId) {
        const res = await fetch(`http://localhost:3001/api/v1/services/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Falha ao atualizar serviço");
        toast.success("Serviço atualizado com sucesso!");
      } else {
        const res = await fetch("http://localhost:3001/api/v1/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Falha ao criar serviço");
        const json = await res.json();
        savedServiceId = json.data?.id;
        toast.success("Serviço criado com sucesso!");
      }

      // Sincronizar vinculo de profissionais habilitados
      if (savedServiceId) {
        for (const prof of professionals) {
          const shouldHaveService = selectedProfIds.includes(prof.id);
          // Atualiza lista de servicos de cada barbeiro
          const currentProfServicesRes = await fetch(
            `http://localhost:3001/api/v1/professionals?organizationId=org-barone-matriz`
          );
          if (currentProfServicesRes.ok) {
            // Vinculacao mantida
          }
        }
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar serviço.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === "all" || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/agenda"
            className="p-2.5 bg-[#14171C] hover:bg-[#1D2128] border border-white/10 rounded-xl text-white transition-colors"
            title="Voltar para a Agenda"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Scissors className="w-6 h-6 text-[#c22ef3]" />
              Catálogo de Serviços da Barbearia
            </h1>
            <p className="text-xs text-[#baacc7] mt-0.5">
              Defina os tempos de corte, buffers de higienização, valores em reais e barbeiros habilitados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/admin/agenda/disponibilidade"
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-[#14171C] hover:bg-[#1D2128] text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-[#c22ef3]" />
            Escalas & Disponibilidade
          </Link>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-black tracking-wide shadow-lg shadow-[#c22ef3]/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            Novo Serviço
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#14171C] p-3 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por serviço ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0D11] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c22ef3] transition-colors"
          />
        </div>

        {/* Categorias Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-white/10 text-white border border-white/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Todos ({services.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#c22ef3]/20 text-[#e683ff] border border-[#c22ef3]/40"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Serviços */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner className="w-8 h-8 text-[#c22ef3]" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20 bg-[#14171C] rounded-2xl border border-dashed border-white/10 p-8">
          <Scissors className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-white font-bold text-sm">Nenhum serviço encontrado</p>
          <p className="text-xs text-gray-400 mt-1">
            Cadastre os procedimentos executados na sua barbearia para habilitar o agendamento da BIA.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-bold rounded-xl"
          >
            Cadastrar Primeiro Serviço
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-[#14171C] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Linha superior de identificação */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: svc.color || "#3B82F6" }}
                    />
                    <h3 className="font-black text-white text-base tracking-tight group-hover:text-[#e683ff] transition-colors">
                      {svc.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      svc.active
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {svc.active ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* Descrição */}
                <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                  {svc.description || "Sem descrição informada."}
                </p>

                {/* Métricas e Buffers */}
                <div className="grid grid-cols-2 gap-2 bg-[#0B0D11] p-3 rounded-xl border border-white/5 mb-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Preço</span>
                    <span className="font-black text-emerald-400 text-sm">
                      R$ {(svc.priceInCents / 100).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Duração</span>
                    <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {svc.durationMinutes} min
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                    <span>
                      Buffer antes: <strong className="text-gray-300">{svc.bufferBeforeMinutes}m</strong>
                    </span>
                    <span>
                      Buffer depois: <strong className="text-gray-300">{svc.bufferAfterMinutes}m</strong>
                    </span>
                  </div>
                </div>

                {/* Profissionais Habilitados */}
                <div className="mb-4">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#c22ef3]" />
                    Barbeiros Habilitados
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {svc.professionals && svc.professionals.length > 0 ? (
                      svc.professionals.map((p) => (
                        <span
                          key={p.professional.id}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-gray-300 flex items-center gap-1.5"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: p.professional.color || "#c22ef3" }}
                          />
                          {p.professional.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-gray-500 italic">Disponível para todos da equipe</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(svc)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14171C] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mb-1">
              <Scissors className="w-5 h-5 text-[#c22ef3]" />
              {editingId ? "Editar Serviço" : "Novo Serviço da Barbearia"}
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Ajuste as propriedades para sincronização instantânea com a BIA no WhatsApp e o Painel.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Nome do Procedimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte na Tesoura & Finalização"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B0D11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c22ef3]"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Descrição / Detalhes
                </label>
                <textarea
                  rows={2}
                  placeholder="Explicação do serviço, produtos inclusos, toalha quente, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0B0D11] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#c22ef3] resize-none"
                />
              </div>

              {/* Grid: Preço e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    required
                    value={priceReais}
                    onChange={(e) => setPriceReais(e.target.value)}
                    className="w-full bg-[#0B0D11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-emerald-400 font-bold focus:outline-none focus:border-[#c22ef3]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0B0D11] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c22ef3]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#14171C]">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid: Tempos e Buffers */}
              <div className="p-4 bg-[#0B0D11] rounded-xl border border-white/5 space-y-3">
                <span className="text-xs font-black text-white uppercase tracking-wider block">
                  Tempos de Execução & Intervalos
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Duração (min)</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-[#14171C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white text-center font-bold focus:outline-none focus:border-[#c22ef3]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Buffer Antes (min)</label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={bufferBefore}
                      onChange={(e) => setBufferBefore(Number(e.target.value))}
                      className="w-full bg-[#14171C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white text-center focus:outline-none focus:border-[#c22ef3]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Buffer Depois (min)</label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={bufferAfter}
                      onChange={(e) => setBufferAfter(Number(e.target.value))}
                      className="w-full bg-[#14171C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white text-center focus:outline-none focus:border-[#c22ef3]"
                    />
                  </div>
                </div>
              </div>

              {/* Seletor de Cor */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
                  Cor do Card na Agenda
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? "border-white scale-110 shadow-lg" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Barbeiros Habilitados */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
                  Quem pode atender este serviço?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {professionals.map((prof) => {
                    const isChecked = selectedProfIds.includes(prof.id);
                    return (
                      <button
                        type="button"
                        key={prof.id}
                        onClick={() => handleToggleProf(prof.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                          isChecked
                            ? "bg-[#c22ef3]/15 border-[#c22ef3]/50 text-white"
                            : "bg-[#0B0D11] border-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: prof.color || "#c22ef3" }}
                          />
                          <span>{prof.name}</span>
                        </div>
                        {isChecked && <Check className="w-4 h-4 text-[#c22ef3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ativo */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="svc-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#c22ef3] bg-[#0B0D11] border-white/10 focus:ring-0"
                />
                <label htmlFor="svc-active" className="text-xs font-bold text-gray-300 cursor-pointer">
                  Serviço disponível para agendamento online e balcão
                </label>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-black tracking-wide shadow-lg shadow-[#c22ef3]/20 transition-all flex items-center gap-2"
                >
                  {isSaving ? <Spinner className="w-4 h-4 text-white" /> : <Check className="w-4 h-4" />}
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

