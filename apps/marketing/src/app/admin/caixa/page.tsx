"use client";

import React, { useState } from "react";
import {
  CashSessionPanel,
  CashSessionData,
} from "@/components/admin/pos/CashSessionPanel";

const initialSession: CashSessionData = {
  id: "csh-session-1",
  status: "OPEN",
  openedAt: "Hoje as 07:45 por Operador Matriz",
  openingBalanceInCents: 20000, // R$ 200,00 de troco
  totalIncomeInCents: 85000,    // R$ 850,00 de entradas
  totalExpenseInCents: 15000,   // R$ 150,00 de sangria
  expectedBalanceInCents: 90000, // R$ 900,00 esperado
};

export default function CaixaPage() {
  const [session, setSession] = useState<CashSessionData>(initialSession);

  const handleSangria = (amountInCents: number, reason: string) => {
    setSession((prev: CashSessionData) => ({
      ...prev,
      totalExpenseInCents: prev.totalExpenseInCents + amountInCents,
      expectedBalanceInCents: prev.expectedBalanceInCents - amountInCents,
    }));
    alert(`Sangria registrada: R$ ${(amountInCents / 100).toFixed(2).replace(".", ",")} - Motivo: ${reason}`);
  };

  const handleSuprimento = (amountInCents: number, reason: string) => {
    setSession((prev: CashSessionData) => ({
      ...prev,
      totalIncomeInCents: prev.totalIncomeInCents + amountInCents,
      expectedBalanceInCents: prev.expectedBalanceInCents + amountInCents,
    }));
    alert(`Suprimento registrado: R$ ${(amountInCents / 100).toFixed(2).replace(".", ",")} - Motivo: ${reason}`);
  };

  const handleCloseSession = (countedInCents: number, notes?: string) => {
    const diff = countedInCents - session.expectedBalanceInCents;
    const diffFormatted = `R$ ${(Math.abs(diff) / 100).toFixed(2).replace(".", ",")}`;
    const resultMsg =
      diff === 0
        ? "Conferencia exata! Sem sobras ou quebras."
        : diff > 0
        ? `Sobra de caixa identificada: +${diffFormatted}`
        : `Quebra de caixa identificada: -${diffFormatted}`;

    setSession((prev: CashSessionData) => ({
      ...prev,
      status: "CLOSED",
    }));

    alert(`Fechamento concluido com sucesso!\n${resultMsg}\nObservacoes: ${notes || "Nenhuma"}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Gestao de Caixa Diario
        </h1>
        <p className="text-xs text-[#baacc7] mt-1">
          Controle de fundo de troco, sangrias para despesas operacionais e conferencia cega de fechamento.
        </p>
      </div>

      <CashSessionPanel
        session={session}
        onSangria={handleSangria}
        onSuprimento={handleSuprimento}
        onCloseSession={handleCloseSession}
      />
    </div>
  );
}
