"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Clock,
  Scissors,
  Check,
  Edit2,
  Trash2,
  Users,
  ArrowLeft,
  X,
  Palette,
  FolderPlus,
  Tag,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { toast } from "@/lib/toast";

interface ServiceCategory {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  _count?: { services: number };
}

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceInCents: number;
  category: string;
  categoryId: string | null;
  serviceCategory?: { id: string; name: string; color: string | null } | null;
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

const PRESET_COLORS = [
  "#3B82F6", // Azul
  "#8B5CF6", // Roxo
  "#EC4899", // Rosa
  "#EF4444", // Vermelho
  "#F97316", // Laranja
  "#EAB308", // Amarelo
  "#10B981", // Verde
  "#06B6D4", // Ciano
  "#c22ef3", // BIA Magenta
];

export default function ServicosAgendaPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // In-Focus Form State (Substitui a Lista na Tela - Sem Modais)
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceNumber, setPriceNumber] = useState<number>(60);
  const [durationMinutes, setDurationMinutes] = useState(35);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(5);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [color, setColor] = useState("#3B82F6");
  const [active, setActive] = useState(true);
  const [selectedProfIds, setSelectedProfIds] = useState<string[]>([]);

  // Inline New Category
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/api/v1/service-categories?organizationId=org-barone-matriz");
      if (res.ok) {
        const json = await res.json();
        const data: ServiceCategory[] = json.data || [];
        setCategories(data);
        if (data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedCategoryId]);

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
    fetchCategories();
    fetchServices();
    fetchProfessionals();
  }, [fetchCategories, fetchServices, fetchProfessionals]);

  // Transição In-Focus: Abrir Formulário de Criação
  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPriceNumber(60.0);
    setDurationMinutes(35);
    setBufferBefore(0);
    setBufferAfter(5);
    if (categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
    setColor("#3B82F6");
    setActive(true);
    setSelectedProfIds(professionals.map((p) => p.id));
    setViewMode("form");
  };

  // Transição In-Focus: Abrir Formulário de Edição
  const handleOpenEdit = (svc: ServiceItem) => {
    setEditingId(svc.id);
    setName(svc.name);
    setDescription(svc.description || "");
    setPriceNumber(svc.priceInCents / 100);
    setDurationMinutes(svc.durationMinutes);
    setBufferBefore(svc.bufferBeforeMinutes || 0);
    setBufferAfter(svc.bufferAfterMinutes || 0);
    setSelectedCategoryId(svc.categoryId || (categories[0]?.id ?? ""));
    setColor(svc.color || "#3B82F6");
    setActive(svc.active);
    setSelectedProfIds(svc.professionals?.map((p) => p.professional.id) || []);
    setViewMode("form");
  };

  const handleToggleProf = (profId: string) => {
    setSelectedProfIds((prev) =>
      prev.includes(profId) ? prev.filter((id) => id !== profId) : [...prev, profId]
    );
  };

  // Cadastrar Categoria Dinâmica no PostgreSQL
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Informe o nome da categoria.");
      return;
    }

    try {
      setIsSavingCategory(true);
      const res = await fetch("http://localhost:3001/api/v1/service-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: "org-barone-matriz",
          name: newCategoryName.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar categoria.");
      }

      const json = await res.json();
      const created = json.data;
      toast.success(`Categoria "${created.name}" cadastrada!`);
      setNewCategoryName("");
      setIsAddingNewCategory(false);
      await fetchCategories();
      setSelectedCategoryId(created.id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Excluir Categoria do PostgreSQL
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Deseja realmente excluir a categoria "${catName}"?`)) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/v1/service-categories/${catId}?organizationId=org-barone-matriz`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao excluir categoria.");
      }

      toast.success("Categoria removida com sucesso.");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Salvar Serviço
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome do serviço é obrigatório.");
      return;
    }

    if (priceNumber === undefined || priceNumber === null || priceNumber < 0) {
      toast.error("Informe um preço válido.");
      return;
    }

    try {
      setIsSaving(true);
      const priceInCents = Math.round(priceNumber * 100);
      const selectedCat = categories.find((c) => c.id === selectedCategoryId);

      const payload = {
        organizationId: "org-barone-matriz",
        name: name.trim(),
        description: description.trim(),
        priceInCents,
        durationMinutes: Number(durationMinutes),
        bufferBeforeMinutes: Number(bufferBefore),
        bufferAfterMinutes: Number(bufferAfter),
        categoryId: selectedCategoryId || null,
        category: selectedCat ? selectedCat.name : "Geral",
        color,
        active,
      };

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
        toast.success("Serviço criado com sucesso!");
      }

      // Retorno suave da visão In-Focus para a Lista
      setViewMode("list");
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
    const matchesCat =
      selectedCategoryFilter === "all" ||
      s.categoryId === selectedCategoryFilter ||
      s.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // =========================================================================
  // VIEW: FORMULÁRIO IN-FOCUS (SUBSTITUI A LISTA NA TELA INTEIRA)
  // =========================================================================
  if (viewMode === "form") {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Cabeçalho In-Focus com Botão de Voltar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("list")}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#100b17] hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2 text-xs font-bold"
              title="Voltar ao Catálogo"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Catálogo</span>
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#c22ef3]" />
                {editingId ? "Editar Serviço da Barbearia" : "Novo Serviço da Barbearia"}
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#baacc7] mt-0.5">
                Defina preços, tempos de execução e vincule aos barbeiros da equipe.
              </p>
            </div>
          </div>
        </div>

        {/* Card do Formulário In-Focus */}
        <div className="bg-white dark:bg-[#100b17] border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
            {/* Nome do Procedimento */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Nome do Procedimento *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Corte na Tesoura & Finalização"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#08070d] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-[#c22ef3] transition-colors"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Descrição / Detalhes
              </label>
              <textarea
                rows={3}
                placeholder="Explicação do serviço, produtos inclusos, toalha quente, técnicas aplicadas, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#08070d] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-[#c22ef3] resize-none transition-colors"
              />
            </div>

            {/* Preço (MoneyInput Chefinanças) & Categoria Dinâmica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Preço com MoneyInput BRL */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Preço do Serviço *
                </label>
                <MoneyInput
                  value={priceNumber}
                  onChange={(val) => setPriceNumber(val)}
                  placeholder="0,00"
                  required
                />
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                  Máscara automática em Reais (R$).
                </span>
              </div>

              {/* Categoria Dinâmica no PostgreSQL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Categoria (PostgreSQL) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                    className="text-[11px] font-bold text-[#c22ef3] hover:underline flex items-center gap-1"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    {isAddingNewCategory ? "Fechar" : "+ Nova Categoria"}
                  </button>
                </div>

                {/* Seletor Dinâmico */}
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#08070d] border border-gray-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#c22ef3] transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#100b17] text-gray-900 dark:text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Formulário Inline para Nova Categoria */}
                {isAddingNewCategory && (
                  <div className="mt-2 p-3 rounded-xl bg-gray-100 dark:bg-[#08070d] border border-gray-200 dark:border-white/10 space-y-2 animate-in fade-in duration-150">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                      Cadastrar Categoria no Banco
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nome da categoria (ex: Barboterapia)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#100b17] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#c22ef3]"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={isSavingCategory}
                        className="px-3 py-1.5 bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-bold rounded-lg whitespace-nowrap transition-all"
                      >
                        {isSavingCategory ? <Spinner className="w-3 h-3 text-white" /> : "Criar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tempos de Execução & Buffers */}
            <div className="p-4 bg-slate-50 dark:bg-[#08070d] rounded-xl border border-gray-200 dark:border-white/10 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white block">
                Tempos de Execução & Buffers de Limpeza
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                    Duração na Cadeira (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#100b17] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white text-center font-bold focus:outline-none focus:border-[#c22ef3]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                    Buffer Antes / Preparo (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={bufferBefore}
                    onChange={(e) => setBufferBefore(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#100b17] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white text-center focus:outline-none focus:border-[#c22ef3]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                    Buffer Depois / Higienização (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={bufferAfter}
                    onChange={(e) => setBufferAfter(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#100b17] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white text-center focus:outline-none focus:border-[#c22ef3]"
                  />
                </div>
              </div>
            </div>

            {/* Cor do Card na Agenda */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                Cor de Identificação Visual na Agenda
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c
                        ? "border-[#c22ef3] scale-110 shadow-md ring-2 ring-[#c22ef3]/30"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Barbeiros Habilitados */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                Barbeiros Habilitados a Executar
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {professionals.map((prof) => {
                  const isChecked = selectedProfIds.includes(prof.id);
                  return (
                    <button
                      type="button"
                      key={prof.id}
                      onClick={() => handleToggleProf(prof.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                        isChecked
                          ? "bg-[#c22ef3]/10 border-[#c22ef3] text-gray-900 dark:text-white"
                          : "bg-slate-50 dark:bg-[#08070d] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
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

            {/* Ativo Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="svc-active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#c22ef3] bg-white dark:bg-[#08070d] border-gray-300 dark:border-white/10 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="svc-active" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                Serviço ativo para agendamento online, balcão e BIA no WhatsApp
              </label>
            </div>

            {/* Botões do Formulário In-Focus */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#100b17] hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
    );
  }

  // =========================================================================
  // VIEW: LISTA DE SERVIÇOS (COM BUSCA, CATEGORIAS E CARDS)
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Scissors className="w-6 h-6 text-[#c22ef3]" />
            Catálogo de Serviços da Barbearia
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#baacc7] mt-0.5">
            Defina tempos de cadeira, buffers de higienização, valores em reais e barbeiros habilitados.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-black tracking-wide shadow-lg shadow-[#c22ef3]/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Novo Serviço
        </button>
      </div>

      {/* Filtros e Busca com Categorias Dinâmicas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#100b17] p-3 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por serviço ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#08070d] border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-[#c22ef3] transition-colors"
          />
        </div>

        {/* Categorias Pills Dinâmicas vindas do PostgreSQL */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategoryFilter === "all"
                ? "bg-[#c22ef3] text-white shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
          >
            Todos ({services.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategoryFilter === cat.id
                  ? "bg-[#c22ef3] text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              <span>{cat.name}</span>
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
        <div className="text-center py-20 bg-white dark:bg-[#100b17] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8">
          <Scissors className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-900 dark:text-white font-bold text-sm">Nenhum serviço encontrado</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cadastre os procedimentos executados na barbearia para habilitar os agendamentos online e da BIA.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 bg-[#c22ef3] hover:bg-[#a825d4] text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Cadastrar Primeiro Serviço
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white dark:bg-[#100b17] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-[#c22ef3]/50 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: svc.color || "#3B82F6" }}
                    />
                    <h3 className="font-black text-gray-900 dark:text-white text-base tracking-tight group-hover:text-[#c22ef3] transition-colors">
                      {svc.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      svc.active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    }`}
                  >
                    {svc.active ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* Descrição */}
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                  {svc.description || "Sem descrição informada."}
                </p>

                {/* Bloco de Valores & Métricas */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-[#08070d] p-3 rounded-xl border border-gray-200 dark:border-white/5 mb-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">Preço</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      R$ {(svc.priceInCents / 100).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">Duração</span>
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {svc.durationMinutes} min
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>
                      Buffer antes: <strong className="text-gray-900 dark:text-gray-300">{svc.bufferBeforeMinutes}m</strong>
                    </span>
                    <span>
                      Buffer depois: <strong className="text-gray-900 dark:text-gray-300">{svc.bufferAfterMinutes}m</strong>
                    </span>
                  </div>
                </div>

                {/* Categoria */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Categoria:</span>
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    {svc.serviceCategory?.name || svc.category}
                  </span>
                </div>

                {/* Barbeiros Habilitados */}
                <div className="mb-4">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#c22ef3]" />
                    Barbeiros Habilitados
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {svc.professionals && svc.professionals.length > 0 ? (
                      svc.professionals.map((p) => (
                        <span
                          key={p.professional.id}
                          className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
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

              {/* Botão de Ação */}
              <div className="pt-3 border-t border-gray-200 dark:border-white/5 flex items-center justify-end">
                <button
                  onClick={() => handleOpenEdit(svc)}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
