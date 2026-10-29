"use client";

import React, { useState } from "react";
import {
  AgendaHeader,
} from "@/components/admin/agenda/AgendaHeader";
import {
  AgendaGrid,
  ProfessionalColumn,
  AppointmentSlot,
} from "@/components/admin/agenda/AgendaGrid";
import { AppointmentModal } from "@/components/admin/agenda/AppointmentModal";

const initialProfessionals: ProfessionalColumn[] = [
  { id: "prof-1", name: "Rodrigo Barone", role: "Master Barber e Educador" },
  { id: "prof-2", name: "Carlos Eduardo", role: "Especialista em Degradê" },
  { id: "prof-3", name: "Lucas Ferreira", role: "Barba e Visagismo" },
];

const initialAppointments: AppointmentSlot[] = [
  {
    id: "app-1",
    professionalId: "prof-1",
    customerName: "Guilherme Santos",
    serviceName: "Combo Cabelo e Barba Premium",
    startTime: "09:00",
    endTime: "09:50",
    priceFormatted: "R$ 95,00",
    status: "CONFIRMED",
  },
  {
    id: "app-2",
    professionalId: "prof-2",
    customerName: "Thiago Moreira",
    serviceName: "Corte Degradê na Tesoura",
    startTime: "09:30",
    endTime: "10:15",
    priceFormatted: "R$ 60,00",
    status: "IN_PROGRESS",
  },
  {
    id: "app-3",
    professionalId: "prof-3",
    customerName: "Felipe Antunes",
    serviceName: "Barba Terapia com Toalha",
    startTime: "10:00",
    endTime: "10:35",
    priceFormatted: "R$ 45,00",
    status: "HOLD",
    holdExpiresInSeconds: 480,
  },
  {
    id: "app-4",
    professionalId: "prof-1",
    customerName: "Marcos Vinicius",
    serviceName: "Corte Degradê e Barboterapia",
    startTime: "11:00",
    endTime: "11:50",
    priceFormatted: "R$ 95,00",
    status: "SCHEDULED",
  },
];

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<AppointmentSlot[]>(initialAppointments);
  const [viewMode, setViewMode] = useState<"professionals" | "week">("professionals");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ professionalId: string; time: string } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentSlot | null>(null);

  const handleSelectSlot = (professionalId: string, time: string) => {
    setSelectedSlot({ professionalId, time });
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleSelectAppointment = (appointment: AppointmentSlot) => {
    setSelectedAppointment(appointment);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = (data: {
    customerName: string;
    customerPhone: string;
    professionalId: string;
    serviceName: string;
    startTime: string;
  }) => {
    const newApp: AppointmentSlot = {
      id: `app-${Date.now()}`,
      professionalId: data.professionalId,
      customerName: data.customerName,
      serviceName: data.serviceName,
      startTime: data.startTime,
      endTime: "10:30",
      priceFormatted: "R$ 60,00",
      status: "SCHEDULED",
    };
    setAppointments((prev) => [...prev, newApp]);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabecalho da Pagina */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Agenda Inteligente Multi-Profissional
        </h1>
        <p className="text-xs text-[#baacc7] mt-1">
          Visualizacao de slots, controle de reservas temporarias de 10 minutos da BIA e encaixes de balcao.
        </p>
      </div>

      {/* Controles e Filtros */}
      <AgendaHeader
        currentDateFormatted="Quinta-feira, 29 de Outubro de 2026"
        onPrevDay={() => {}}
        onNextDay={() => {}}
        onToday={() => {}}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewAppointment={() => {
          setSelectedSlot({ professionalId: "prof-1", time: "09:00" });
          setSelectedAppointment(null);
          setIsModalOpen(true);
        }}
      />

      {/* Grade de Horarios */}
      <AgendaGrid
        professionals={initialProfessionals}
        appointments={appointments}
        timeSlots={timeSlots}
        onSelectSlot={handleSelectSlot}
        onSelectAppointment={handleSelectAppointment}
      />

      {/* Modal de Agendamento */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedSlot={selectedSlot}
        selectedAppointment={selectedAppointment}
        professionals={initialProfessionals}
        onSave={handleSaveAppointment}
        onCancelAppointment={handleCancelAppointment}
        onConvertToOrder={() => {
          alert("Agendamento convertido em comanda aberta com sucesso.");
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

