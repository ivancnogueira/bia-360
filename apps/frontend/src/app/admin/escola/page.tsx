"use client";

import React, { useState } from "react";
import {
  ClassGroupsGrid,
  ClassGroupDisplay,
} from "@/components/admin/academy/ClassGroupsGrid";
import {
  ClassAttendanceView,
  StudentEnrollment,
} from "@/components/admin/academy/ClassAttendanceView";
import {
  LeadPipelineKanban,
  AcademyLead,
} from "@/components/admin/academy/LeadPipelineKanban";

const initialClasses: ClassGroupDisplay[] = [
  {
    id: "cls-1",
    code: "BARBER-PRO-2026-T1",
    courseName: "Formacao Profissional de Barbeiro Master",
    instructorName: "Rodrigo Barone",
    startDate: "03/11/2026",
    endDate: "18/12/2026",
    modality: "presencial",
    priceFormatted: "R$ 2.490,00",
    enrolledCount: 10,
    maxCapacity: 12,
    status: "SCHEDULED",
  },
  {
    id: "cls-2",
    code: "FADE-EXPERT-2026",
    courseName: "Imersao Degradê e Fade de Alta Precisao",
    instructorName: "Carlos Eduardo",
    startDate: "10/11/2026",
    endDate: "12/11/2026",
    modality: "presencial",
    priceFormatted: "R$ 890,00",
    enrolledCount: 8,
    maxCapacity: 8,
    status: "FULL",
  },
  {
    id: "cls-3",
    code: "VISAGISMO-ONLINE",
    courseName: "Visagismo e Consultoria de Barba Moderna",
    instructorName: "Lucas Ferreira",
    startDate: "15/11/2026",
    endDate: "30/11/2026",
    modality: "online",
    priceFormatted: "R$ 490,00",
    enrolledCount: 14,
    maxCapacity: 25,
    status: "SCHEDULED",
  },
];

const initialStudents: StudentEnrollment[] = [
  {
    id: "std-1",
    name: "Leonardo Ramos da Costa",
    phone: "554199991234",
    totalSessions: 12,
    attendedSessions: 11,
    status: "ENROLLED",
  },
  {
    id: "std-2",
    name: "Gabriel Medeiros",
    phone: "554199992345",
    totalSessions: 12,
    attendedSessions: 10,
    status: "ENROLLED",
  },
  {
    id: "std-3",
    name: "Vinicius Albuquerque",
    phone: "554199993456",
    totalSessions: 12,
    attendedSessions: 7, // 58% - frequencia insuficiente
    status: "ENROLLED",
  },
];

const initialLeads: AcademyLead[] = [
  {
    id: "lead-1",
    name: "Rafael Martins",
    phone: "5541988880001",
    courseInterest: "Formacao Profissional de Barbeiro Master",
    stage: "NEW",
    capturedAt: "Hoje as 09:12",
  },
  {
    id: "lead-2",
    name: "Daniel Fontana",
    phone: "5541988880002",
    courseInterest: "Imersao Degradê e Fade",
    stage: "CONTACTED",
    capturedAt: "Ontem as 16:40",
  },
  {
    id: "lead-3",
    name: "Bruno Peixoto",
    phone: "5541988880003",
    courseInterest: "Formacao Profissional de Barbeiro Master",
    stage: "PRE_ENROLLED",
    capturedAt: "28/10 as 11:20",
  },
];

export default function EscolaPage() {
  const [classes, setClasses] = useState<ClassGroupDisplay[]>(initialClasses);
  const [selectedClass, setSelectedClass] = useState<ClassGroupDisplay>(initialClasses[0]);
  const [students, setStudents] = useState<StudentEnrollment[]>(initialStudents);
  const [leads, setLeads] = useState<AcademyLead[]>(initialLeads);
  const [activeTab, setActiveTab] = useState<"turmas" | "funil">("turmas");

  const handleToggleAttendance = (studentId: string, present: boolean) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              attendedSessions: present
                ? Math.min(s.totalSessions, s.attendedSessions + 1)
                : Math.max(0, s.attendedSessions - 1),
            }
          : s
      )
    );
  };

  const handleIssueCertificate = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              certificateCode: "ACAD-78C2-A9F1-E40B",
              status: "COMPLETED",
            }
          : s
      )
    );
  };

  const handleAdvanceStage = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        if (l.stage === "NEW") return { ...l, stage: "CONTACTED" };
        if (l.stage === "CONTACTED") return { ...l, stage: "VISIT_SCHEDULED" };
        if (l.stage === "VISIT_SCHEDULED") return { ...l, stage: "PRE_ENROLLED" };
        return l;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabecalho da Pagina com Alternador de Abas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Academy: Gestão Acadêmica e Cursos
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Administração de turmas com trava de capacidade, diário de presença, certificados criptografados e funil comercial.
          </p>
        </div>

        <div className="flex items-center bg-[#100b17] border border-[#d798ff22] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("turmas")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "turmas"
                ? "bg-gradient-to-r from-[#c22ef3] to-[#f33199] text-white shadow-md shadow-[#c22ef344]"
                : "text-[#baacc7] hover:text-white"
            }`}
          >
            Turmas e Chamada
          </button>
          <button
            onClick={() => setActiveTab("funil")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "funil"
                ? "bg-gradient-to-r from-[#c22ef3] to-[#f33199] text-white shadow-md shadow-[#c22ef344]"
                : "text-[#baacc7] hover:text-white"
            }`}
          >
            Funil Comercial de Alunos
          </button>
        </div>
      </div>

      {activeTab === "turmas" ? (
        <div className="space-y-8">
          <ClassGroupsGrid
            classes={classes}
            onSelectClass={(cls: ClassGroupDisplay) => setSelectedClass(cls)}
            onNewClass={() => {
              alert("Abertura de formulario para criacao de nova turma academica.");
            }}
          />

          <ClassAttendanceView
            classNameCode={selectedClass.code}
            students={students}
            onToggleAttendance={handleToggleAttendance}
            onIssueCertificate={handleIssueCertificate}
          />
        </div>
      ) : (
        <LeadPipelineKanban leads={leads} onAdvanceStage={handleAdvanceStage} />
      )}
    </div>
  );
}
