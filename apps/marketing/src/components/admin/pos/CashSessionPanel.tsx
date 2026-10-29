"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Wallet, ArrowDownRight, ArrowUpRight, Lock, CheckCircle2 } from "lucide-react";

export interface CashSessionData {
  id: string;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  openingBalanceInCents: number;
  totalIncomeInCents: number;
  totalExpenseInCents: number;
  expectedBalanceInCents: number;
}

export interface CashSessionPanelProps {
  session: CashSessionData;
  onSangria: (amountInCents: number, reason: string) => void;
  onSuprimento: (amountInCents: number, reason: string) => void;
  onCloseSession: (countedBalanceInCents: number, notes?: string) => void;
}

export const CashSessionPanel: React.FC<CashSessionPanelProps> = ({
  session,
  onSangria,
  onSuprimento,
  onCloseSession,
}) => {
  const [isSangriaModalOpen, setIsSangriaModalOpen] = useState(false);
  const [isSuprimentoModalOpen, setIsSuprimentoModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const [amountReais, setAmountReais] = useState("");
  const [reason, setReason] = useState("");
  const [countedReais, setCountedReais] = useState("");
  const [closeNotes, setCloseNotes] = useState("");

  const formatBrl = (cents: number) =>
    `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

  const handleExecuteSangria = () => {
    const cents = Math.round(parseFloat(amountReais) * 100);
    if (!cents || !reason) return;
    onSangria(cents, reason);
    setIsSangriaModalOpen(false);
    setAmountReais("");
    setReason("");
  };

  const handleExecuteSuprimento = () => {
    const cents = Math.round(parseFloat(amountReais) * 100);
    if (!cents || !reason) return;
    onSuprimento(cents, reason);
    setIsSuprimentoModalOpen(false);
    setAmountReais("");
    setReason("");
  };

  const handleExecuteClose = () => {
    const cents = Math.round(parseFloat(countedReais) * 100);
    if (isNaN(cents)) return;
    onCloseSession(cents, closeNotes);
    setIsCloseModalOpen(false);
    setCountedReais("");
    setCloseNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal do Caixa */}
      <Card glow className="bg-gradient-to-r from-[#100b17] via-[#160d20] to-[#1f132b]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c22ef3] to-[#f33199] flex items-center justify-center text-white shadow-lg shadow-[#c22ef344]">
              <Wallet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Sessao de Caixa Diario</h2>
                <Badge variant={session.status === "OPEN" ? "success" : "neutral"} size="sm">
                  {session.status === "OPEN" ? "Caixa Aberto" : "Caixa Fechado"}
                </Badge>
              </div>
              <p className="text-xs text-[#baacc7] mt-1 font-mono">
                Abertura: {session.openedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSangriaModalOpen(true)}
            >
              <ArrowDownRight size={14} className="text-rose-400" />
              <span>Registrar Sangria</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSuprimentoModalOpen(true)}
            >
              <ArrowUpRight size={14} className="text-emerald-400" />
              <span>Adicionar Suprimento</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCloseModalOpen(true)}
            >
              <Lock size={14} />
              <span>Fechamento do Dia</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Cards de Balanco */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#100b17] border border-[#d798ff22] rounded-xl p-4">
          <div className="text-[11px] font-bold text-[#887591] uppercase tracking-wider">
            Fundo de Troco Inicial
          </div>
          <div className="text-lg font-black text-white font-mono mt-1">
            {formatBrl(session.openingBalanceInCents)}
          </div>
        </div>

        <div className="bg-[#100b17] border border-[#d798ff22] rounded-xl p-4">
          <div className="text-[11px] font-bold text-[#887591] uppercase tracking-wider">
            Entradas e Vendas
          </div>
          <div className="text-lg font-black text-emerald-400 font-mono mt-1">
            +{formatBrl(session.totalIncomeInCents)}
          </div>
        </div>

        <div className="bg-[#100b17] border border-[#d798ff22] rounded-xl p-4">
          <div className="text-[11px] font-bold text-[#887591] uppercase tracking-wider">
            Sangrias e Retiradas
          </div>
          <div className="text-lg font-black text-rose-400 font-mono mt-1">
            -{formatBrl(session.totalExpenseInCents)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#c22ef31a] to-[#f331991a] border border-[#c22ef355] rounded-xl p-4">
          <div className="text-[11px] font-bold text-[#de74f6] uppercase tracking-wider">
            Saldo Esperado em Caixa
          </div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {formatBrl(session.expectedBalanceInCents)}
          </div>
        </div>
      </div>

      {/* Modal Sangria */}
      <Modal
        isOpen={isSangriaModalOpen}
        onClose={() => setIsSangriaModalOpen(false)}
        title="Registrar Sangria de Caixa"
        description="Retirada de numerario para pagamento de despesas ou deposito."
      >
        <div className="space-y-4">
          <Input
            label="Valor da Retirada (R$)"
            type="number"
            min="1"
            step="0.50"
            value={amountReais}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmountReais(e.target.value)}
            placeholder="Ex: 150,00"
            required
          />
          <Input
            label="Motivo da Sangria"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
            placeholder="Ex: Pagamento de fornecedor de laminas descartaveis"
            required
          />
          <div className="pt-3 border-t border-[#d798ff22] flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsSangriaModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" size="md" onClick={handleExecuteSangria}>
              Confirmar Sangria
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Suprimento */}
      <Modal
        isOpen={isSuprimentoModalOpen}
        onClose={() => setIsSuprimentoModalOpen(false)}
        title="Registrar Suprimento de Caixa"
        description="Entrada avulsa de moedas ou notas para troco operacional."
      >
        <div className="space-y-4">
          <Input
            label="Valor do Suprimento (R$)"
            type="number"
            min="1"
            step="0.50"
            value={amountReais}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmountReais(e.target.value)}
            placeholder="Ex: 100,00"
            required
          />
          <Input
            label="Descricao / Origem"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
            placeholder="Ex: Reforco de troco em notas de 5 e 10 reais"
            required
          />
          <div className="pt-3 border-t border-[#d798ff22] flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsSuprimentoModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={handleExecuteSuprimento}>
              Confirmar Suprimento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Fechamento Cego */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Fechamento de Caixa com Conferencia"
        description="Insira a contagem fisica de dinheiro para apuracao automatica de sobras ou quebras."
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#160d20] border border-[#d798ff22] rounded-xl text-xs text-[#baacc7]">
            Saldo esperado registrado pelo sistema:{" "}
            <span className="font-bold text-white font-mono">
              {formatBrl(session.expectedBalanceInCents)}
            </span>
          </div>
          <Input
            label="Valor Fisico Contado em Caixa (R$)"
            type="number"
            min="0"
            step="0.10"
            value={countedReais}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountedReais(e.target.value)}
            placeholder="Ex: 850,00"
            required
          />
          <Input
            label="Observacoes do Fechamento"
            value={closeNotes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCloseNotes(e.target.value)}
            placeholder="Ex: Conferencia realizada sem diferencas pelo operador"
          />
          <div className="pt-3 border-t border-[#d798ff22] flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCloseModalOpen(false)}>
              Voltar
            </Button>
            <Button variant="primary" size="md" onClick={handleExecuteClose}>
              <CheckCircle2 size={16} />
              <span>Concluir Fechamento</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
