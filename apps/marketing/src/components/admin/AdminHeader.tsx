"use client";

import React, { useState } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  UserCheck,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export const AdminHeader: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState("Barone Matriz Centro");
  const [unreadHandoffs] = useState(2);

  return (
    <header className="h-16 bg-[#08070d]/90 backdrop-blur-md border-b border-[#d798ff22] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Busca Rapida */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#887591]"
          />
          <input
            type="text"
            placeholder="Buscar cliente, servico, comanda ou turma..."
            className="w-full bg-[#100b17] border border-[#d798ff22] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#f7f2ff] placeholder-[#887591] focus:outline-none focus:border-[#c22ef3]"
          />
        </div>
      </div>

      {/* Acoes da Direita */}
      <div className="flex items-center gap-4">
        {/* Seletor de Unidade */}
        <div className="flex items-center gap-2 bg-[#100b17] border border-[#d798ff22] px-3 py-1.5 rounded-xl text-xs text-[#eee3f7]">
          <Building2 size={15} className="text-[#de74f6]" />
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="Barone Matriz Centro" className="bg-[#100b17]">
              Barone Matriz Centro
            </option>
            <option value="Barone Academy Unidade Sul" className="bg-[#100b17]">
              Barone Academy Unidade Sul
            </option>
          </select>
        </div>

        {/* Central de Handoff Humano (Notificacoes) */}
        <Link
          href="/admin/clientes"
          className="relative p-2 rounded-xl bg-[#100b17] border border-[#d798ff22] text-[#baacc7] hover:text-white hover:border-[#c22ef3] transition-all"
          title="Atendimentos aguardando operador humano"
        >
          <Bell size={18} />
          {unreadHandoffs > 0 ? (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#c22ef3] to-[#f33199] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
              {unreadHandoffs}
            </span>
          ) : null}
        </Link>

        {/* Link para Landing de Vendas Oficial */}
        <a
          href="https://ivancnogueira.github.io/bia-360/vendas/?v=menu4"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#de74f6] border border-[#c22ef344] hover:bg-[#c22ef315] transition-all"
        >
          <span>Pagina de Vendas</span>
          <ExternalLink size={13} />
        </a>

        {/* Perfil do Administrador */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#d798ff22]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c22ef3] to-[#f33199] flex items-center justify-center text-white font-black text-xs">
            GB
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-white leading-none">
              Gestor Barone
            </div>
            <div className="text-[10px] text-[#baacc7] font-medium mt-0.5">
              Administrador Geral
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

