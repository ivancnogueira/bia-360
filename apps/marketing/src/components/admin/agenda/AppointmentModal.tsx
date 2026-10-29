"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Receipt, Trash2 } from "lucide-react";
import { ProfessionalColumn, AppointmentSlot } from "./AgendaGrid";

export interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: { professionalId: string; time: string } | null;
  selectedAppointment: AppointmentSlot | null;
  professionals: ProfessionalColumn[];
  onSave: (data: {
    customerName: string;
    customerPhone: string;
    professionalId: string;
    serviceName: string;
    startTime: string;
  }) => void;
  onConvertToOrder?: (appointmentId: string) => void;
  onCancelAppointment?: (appointmentId: string) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedSlot,
  selectedAppointment,
  professionals,
  onSave,
  onConvertToOrder,
  onCancelAppointment,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [serviceName, setServiceName] = useState("Corte Degradê na Tesoura e Máquina");
  const [startTime, setStartTime] = useState("09:00");

  useEffect(() => {
    if (selectedAppointment) {
      setCustomerName(selectedAppointment.customerName);
      setCustomerPhone("41 98888-7777");
      setProfessionalId(selectedAppointment.professionalId);
      setServiceName(selectedAppointment.serviceName);
      setStartTime(selectedAppointment.startTime);
    } else if (selectedSlot) {
      setCustomerName("");
      setCustomerPhone("");
      setProfessionalId(selectedSlot.professionalId);
      setStartTime(selectedSlot.time);
      setServiceName("Corte Degradê na Tesoura e Máquina");
    }
  }, [selectedSlot, selectedAppointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !professionalId) return;

    onSave({
      customerName,
      customerPhone,
      professionalId,
      serviceName,
      startTime,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedAppointment ? "Detalhes do Agendamento" : "Novo Agendamento"}
      description="Preencha os dados do cliente e servico para bloqueio do horario."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome Completo do Cliente"
          placeholder="Ex: Carlos Eduardo Silveira"
          value={customerName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
          required
        />

        <Input
          label="Telefone WhatsApp"
          placeholder="Ex: (41) 98888-7777"
          value={customerPhone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Barbeiro Responsavel"
            value={professionalId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProfessionalId(e.target.value)}
            required
          >
            <option value="">Selecione o profissional</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#100b17]">
                {p.name}
              </option>
            ))}
          </Select>

          <Input
            label="Horario de Inicio"
            type="text"
            value={startTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
            required
          />
        </div>

        <Select
          label="Servico a Realizar"
          value={serviceName}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setServiceName(e.target.value)}
          required
        >
          <option value="Corte Degradê na Tesoura e Máquina" className="bg-[#100b17]">
            Corte Degrade na Tesoura e Maquina (R$ 60,00)
          </option>
          <option value="Barba Terapia Completa com Toalha Quente" className="bg-[#100b17]">
            Barba Terapia com Toalha Quente (R$ 45,00)
          </option>
          <option value="Combo Cabelo e Barba Premium" className="bg-[#100b17]">
            Combo Cabelo e Barba Premium (R$ 95,00)
          </option>
          <option value="Camuflagem de Fios Brancos" className="bg-[#100b17]">
            Camuflagem de Fios Brancos (R$ 55,00)
          </option>
        </Select>

        <div className="pt-4 border-t border-[#d798ff22] flex items-center justify-between">
          {selectedAppointment ? (
            <div className="flex items-center gap-2">
              {onConvertToOrder ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onConvertToOrder(selectedAppointment.id)}
                >
                  <Receipt size={14} />
                  <span>Abrir Comanda</span>
                </Button>
              ) : null}
              {onCancelAppointment ? (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => onCancelAppointment(selectedAppointment.id)}
                >
                  <Trash2 size={14} />
                  <span>Cancelar</span>
                </Button>
              ) : null}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Voltar
            </Button>
            <Button type="submit" variant="primary" size="md">
              <CheckCircle2 size={15} />
              <span>{selectedAppointment ? "Salvar Alteracoes" : "Confirmar Horario"}</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
