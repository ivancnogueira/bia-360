"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { OrderDisplay } from "./OrdersBoard";
import { QrCode, CreditCard, Banknote, Smartphone, Check, Send } from "lucide-react";

export interface OrderCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDisplay | null;
  onConfirmPayment: (paymentData: {
    orderId: string;
    method: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";
    discountInCents: number;
    sendWhatsAppReceipt: boolean;
  }) => void;
}

export const OrderCheckoutModal: React.FC<OrderCheckoutModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<"PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH">("PIX");
  const [discountReais, setDiscountReais] = useState("0");
  const [sendReceipt, setSendReceipt] = useState(true);

  if (!order) return null;

  const discountInCents = Math.round((parseFloat(discountReais) || 0) * 100);
  const finalTotalInCents = Math.max(0, order.totalInCents - discountInCents);
  const finalTotalFormatted = `R$ ${(finalTotalInCents / 100).toFixed(2).replace(".", ",")}`;

  const handlePay = () => {
    onConfirmPayment({
      orderId: order.id,
      method,
      discountInCents,
      sendWhatsAppReceipt: sendReceipt,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fechar Comanda ${order.orderNumber}`}
      description={`Cliente: ${order.customerName} - Profissional: ${order.professionalName}`}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Lista de Itens */}
        <div className="rounded-xl bg-[#160d20] border border-[#d798ff22] p-4 space-y-2">
          <div className="text-xs font-bold text-[#baacc7] uppercase tracking-wider mb-2">
            Itens da Comanda
          </div>
          {order.items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between text-xs text-[#eee3f7]"
            >
              <span>
                {it.quantity}x {it.name}
              </span>
              <span className="font-mono text-white font-bold">{it.priceFormatted}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-[#d798ff15] flex items-center justify-between text-xs text-[#baacc7]">
            <span>Subtotal Bruto</span>
            <span className="font-mono">{order.totalFormatted}</span>
          </div>
        </div>

        {/* Metodos de Pagamento */}
        <div>
          <label className="block text-xs font-semibold text-[#eee3f7] mb-2">
            Forma de Pagamento
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setMethod("PIX")}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-bold ${
                method === "PIX"
                  ? "bg-[#c22ef322] border-[#c22ef3] text-white shadow-sm shadow-[#c22ef355]"
                  : "bg-[#160d20] border-[#d798ff22] text-[#baacc7] hover:text-white"
              }`}
            >
              <QrCode size={18} className="text-[#de74f6]" />
              <span>PIX Instantaneo</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("CREDIT_CARD")}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-bold ${
                method === "CREDIT_CARD"
                  ? "bg-[#c22ef322] border-[#c22ef3] text-white shadow-sm shadow-[#c22ef355]"
                  : "bg-[#160d20] border-[#d798ff22] text-[#baacc7] hover:text-white"
              }`}
            >
              <CreditCard size={18} className="text-[#de74f6]" />
              <span>Cartao de Credito</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("DEBIT_CARD")}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-bold ${
                method === "DEBIT_CARD"
                  ? "bg-[#c22ef322] border-[#c22ef3] text-white shadow-sm shadow-[#c22ef355]"
                  : "bg-[#160d20] border-[#d798ff22] text-[#baacc7] hover:text-white"
              }`}
            >
              <CreditCard size={18} className="text-[#de74f6]" />
              <span>Cartao de Debito</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("CASH")}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-bold ${
                method === "CASH"
                  ? "bg-[#c22ef322] border-[#c22ef3] text-white shadow-sm shadow-[#c22ef355]"
                  : "bg-[#160d20] border-[#d798ff22] text-[#baacc7] hover:text-white"
              }`}
            >
              <Banknote size={18} className="text-[#de74f6]" />
              <span>Dinheiro em Especie</span>
            </button>
          </div>
        </div>

        {/* Desconto Opcional */}
        <Input
          label="Desconto Concedido (R$)"
          type="number"
          min="0"
          step="0.50"
          value={discountReais}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscountReais(e.target.value)}
          placeholder="0,00"
        />

        {/* Checkbox Recibo WhatsApp */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#eee3f7] select-none">
          <input
            type="checkbox"
            checked={sendReceipt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSendReceipt(e.target.checked)}
            className="w-4 h-4 rounded border-[#d798ff44] bg-[#160d20] text-[#c22ef3] focus:ring-0"
          />
          <span className="flex items-center gap-1.5">
            <Send size={13} className="text-[#de74f6]" />
            Enviar comprovante e recibo digital via WhatsApp da BIA
          </span>
        </label>

        {/* Total a Cobrar */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#c22ef322] to-[#f3319922] border border-[#c22ef355] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#baacc7] uppercase tracking-wider font-semibold">
              Valor Final Liquido
            </div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {finalTotalFormatted}
            </div>
          </div>
          <Button variant="neon" size="lg" onClick={handlePay}>
            <Check size={18} />
            <span>Confirmar Recebimento</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
