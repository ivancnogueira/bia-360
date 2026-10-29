"use client";

import React, { useState } from "react";
import {
  OrdersBoard,
  OrderDisplay,
} from "@/components/admin/pos/OrdersBoard";
import { OrderCheckoutModal } from "@/components/admin/pos/OrderCheckoutModal";

const initialOrders: OrderDisplay[] = [
  {
    id: "ord-1",
    orderNumber: "CMD-1042",
    customerName: "Lucas Mendes",
    customerPhone: "41988881111",
    professionalName: "Rodrigo Barone",
    status: "OPEN",
    openedAt: "10:15",
    items: [
      { id: "it-1", name: "Corte Degradê Navalhado", quantity: 1, priceFormatted: "R$ 65,00" },
    ],
    totalInCents: 6500,
    totalFormatted: "R$ 65,00",
  },
  {
    id: "ord-2",
    orderNumber: "CMD-1043",
    customerName: "Matheus Oliveira",
    customerPhone: "41988882222",
    professionalName: "Carlos Eduardo",
    status: "IN_SERVICE",
    openedAt: "09:40",
    items: [
      { id: "it-2", name: "Barba Terapia Completa", quantity: 1, priceFormatted: "R$ 45,00" },
      { id: "it-3", name: "Pomada Matte Barone", quantity: 1, priceFormatted: "R$ 55,00" },
    ],
    totalInCents: 10000,
    totalFormatted: "R$ 100,00",
  },
  {
    id: "ord-3",
    orderNumber: "CMD-1044",
    customerName: "Eduardo Camargo",
    customerPhone: "41988883333",
    professionalName: "Lucas Ferreira",
    status: "AWAITING_PAYMENT",
    openedAt: "09:15",
    items: [
      { id: "it-4", name: "Combo Cabelo e Barba", quantity: 1, priceFormatted: "R$ 95,00" },
      { id: "it-5", name: "Oleo Nutritivo para Barba", quantity: 1, priceFormatted: "R$ 40,00" },
    ],
    totalInCents: 13500,
    totalFormatted: "R$ 135,00",
  },
];

export default function ComandasPage() {
  const [orders, setOrders] = useState<OrderDisplay[]>(initialOrders);
  const [selectedOrderForCheckout, setSelectedOrderForCheckout] = useState<OrderDisplay | null>(null);

  const handleCheckout = (order: OrderDisplay) => {
    setSelectedOrderForCheckout(order);
  };

  const handleConfirmPayment = (paymentData: {
    orderId: string;
    method: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";
    discountInCents: number;
    sendWhatsAppReceipt: boolean;
  }) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === paymentData.orderId
          ? { ...ord, status: "PAID" }
          : ord
      )
    );
    alert(
      `Comanda quitada com sucesso via ${paymentData.method}! Recibo disparado pela BIA no WhatsApp.`
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Ponto de Venda e Comandas de Atendimento
        </h1>
        <p className="text-xs text-[#baacc7] mt-1">
          Acompanhe o consumo dos clientes nas cadeiras, insira produtos de revenda e faca o fechamento rapido no balcao.
        </p>
      </div>

      <OrdersBoard
        orders={orders}
        onOpenOrder={() => {
          const newOrder: OrderDisplay = {
            id: `ord-${Date.now()}`,
            orderNumber: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
            customerName: "Novo Cliente Avulso",
            customerPhone: "41999990000",
            professionalName: "Rodrigo Barone",
            status: "OPEN",
            openedAt: "10:30",
            items: [
              { id: `it-${Date.now()}`, name: "Corte Tradicional", quantity: 1, priceFormatted: "R$ 50,00" },
            ],
            totalInCents: 5000,
            totalFormatted: "R$ 50,00",
          };
          setOrders((prev) => [newOrder, ...prev]);
        }}
        onCheckout={handleCheckout}
        onViewOrder={(order: OrderDisplay) => {
          setSelectedOrderForCheckout(order);
        }}
      />

      <OrderCheckoutModal
        isOpen={!!selectedOrderForCheckout}
        onClose={() => setSelectedOrderForCheckout(null)}
        order={selectedOrderForCheckout}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}
