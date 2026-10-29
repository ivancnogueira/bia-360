"use client";

import React from "react";
import { Plus, User, Clock, CheckCircle2, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export interface OrderItemDisplay {
  id: string;
  name: string;
  quantity: number;
  priceFormatted: string;
}

export interface OrderDisplay {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  professionalName: string;
  status: "OPEN" | "IN_SERVICE" | "AWAITING_PAYMENT" | "PAID";
  openedAt: string;
  items: OrderItemDisplay[];
  totalInCents: number;
  totalFormatted: string;
}

export interface OrdersBoardProps {
  orders: OrderDisplay[];
  onOpenOrder: () => void;
  onCheckout: (order: OrderDisplay) => void;
  onViewOrder: (order: OrderDisplay) => void;
}

export const OrdersBoard: React.FC<OrdersBoardProps> = ({
  orders,
  onOpenOrder,
  onCheckout,
  onViewOrder,
}) => {
  const columns: {
    title: string;
    status: OrderDisplay["status"];
    badgeVariant: "purple" | "warning" | "info" | "success";
  }[] = [
    { title: "Abertas / Recepcao", status: "OPEN", badgeVariant: "purple" },
    { title: "Em Atendimento", status: "IN_SERVICE", badgeVariant: "warning" },
    { title: "Aguardando Pagamento", status: "AWAITING_PAYMENT", badgeVariant: "info" },
  ];

  return (
    <div className="space-y-6">
      {/* Barra Superior de Acao */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            {orders.filter((o) => o.status !== "PAID").length} Comandas Ativas
          </Badge>
        </div>
        <Button variant="primary" size="md" onClick={onOpenOrder}>
          <Plus size={16} />
          <span>Abrir Nova Comanda</span>
        </Button>
      </div>

      {/* Grade de Colunas Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className="bg-[#100b17] border border-[#d798ff22] rounded-2xl p-4 flex flex-col h-[700px] shadow-xl shadow-black/20"
            >
              {/* Topo da Coluna */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#d798ff22]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    {col.title}
                  </span>
                  <Badge variant={col.badgeVariant} size="sm">
                    {colOrders.length}
                  </Badge>
                </div>
              </div>

              {/* Lista de Cards da Coluna */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl bg-gradient-to-br from-[#160d20] to-[#1f132b] border border-[#d798ff33] hover:border-[#c22ef3aa] transition-all shadow-md group cursor-pointer"
                    onClick={() => onViewOrder(order)}
                  >
                    {/* Numero e Horario */}
                    <div className="flex items-center justify-between text-[11px] text-[#baacc7] mb-2 font-mono">
                      <span>{order.orderNumber}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {order.openedAt}
                      </span>
                    </div>

                    {/* Cliente e Barbeiro */}
                    <div className="mb-3">
                      <div className="text-sm font-black text-white group-hover:text-[#de74f6] transition-colors">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-[#baacc7] mt-0.5 flex items-center gap-1">
                        <User size={12} className="text-[#c22ef3]" />
                        <span>Profissional: {order.professionalName}</span>
                      </div>
                    </div>

                    {/* Resumo de Itens */}
                    <div className="space-y-1 mb-3 pt-2 border-t border-[#d798ff15]">
                      {order.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between text-xs text-[#eee3f7]"
                        >
                          <span className="truncate max-w-[150px]">
                            {it.quantity}x {it.name}
                          </span>
                          <span className="font-mono text-[#baacc7]">
                            {it.priceFormatted}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total e Acao */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#d798ff22]">
                      <div>
                        <div className="text-[10px] text-[#887591] uppercase tracking-wider font-bold">
                          Subtotal
                        </div>
                        <div className="text-sm font-black text-[#de74f6] font-mono">
                          {order.totalFormatted}
                        </div>
                      </div>

                      {order.status === "AWAITING_PAYMENT" ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            onCheckout(order);
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Receber</span>
                        </Button>
                      ) : (
                        <div className="p-1 rounded-lg text-[#baacc7] group-hover:text-white transition-colors">
                          <ChevronRight size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {colOrders.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-[#d798ff15] rounded-xl text-xs text-[#887591]">
                    Nenhuma comanda neste estagio
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
