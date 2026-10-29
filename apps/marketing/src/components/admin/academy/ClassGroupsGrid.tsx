"use client";

import React from "react";
import { GraduationCap, Calendar, Users, AlertCircle, Plus, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface ClassGroupDisplay {
  id: string;
  code: string;
  courseName: string;
  instructorName: string;
  startDate: string;
  endDate: string;
  modality: string;
  priceFormatted: string;
  enrolledCount: number;
  maxCapacity: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "FULL";
}

export interface ClassGroupsGridProps {
  classes: ClassGroupDisplay[];
  onSelectClass: (classGroup: ClassGroupDisplay) => void;
  onNewClass: () => void;
}

export const ClassGroupsGrid: React.FC<ClassGroupsGridProps> = ({
  classes,
  onSelectClass,
  onNewClass,
}) => {
  return (
    <div className="space-y-6">
      {/* Topo com Botao de Nova Turma */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Turmas e Cursos Ativos</h2>
          <p className="text-xs text-[#baacc7]">
            Acompanhe a ocupacao de vagas em tempo real e o calendario letivo.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={onNewClass}>
          <Plus size={16} />
          <span>Cadastrar Nova Turma</span>
        </Button>
      </div>

      {/* Grid de Cards de Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const occupancyRate = Math.round((cls.enrolledCount / cls.maxCapacity) * 100);
          const isFull = cls.enrolledCount >= cls.maxCapacity || cls.status === "FULL";

          return (
            <Card
              key={cls.id}
              glow={isFull}
              className="cursor-pointer hover:border-[#c22ef3aa] transition-all flex flex-col justify-between"
              onClick={() => onSelectClass(cls)}
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-xs font-black text-[#de74f6] bg-[#c22ef31a] px-2.5 py-1 rounded-lg border border-[#c22ef333]">
                    {cls.code}
                  </span>
                  {isFull ? (
                    <Badge variant="danger" size="sm">
                      Turma Lotada
                    </Badge>
                  ) : cls.status === "IN_PROGRESS" ? (
                    <Badge variant="success" size="sm">
                      Em Andamento
                    </Badge>
                  ) : (
                    <Badge variant="purple" size="sm">
                      Matriculas Abertas
                    </Badge>
                  )}
                </div>

                {/* Nome do Curso e Instrutor */}
                <h3 className="text-base font-extrabold text-white leading-snug mb-1">
                  {cls.courseName}
                </h3>
                <div className="text-xs text-[#baacc7] flex items-center gap-1.5 mb-4">
                  <BookOpen size={13} className="text-[#c22ef3]" />
                  <span>Instrutor: {cls.instructorName}</span>
                </div>

                {/* Datas e Modalidade */}
                <div className="space-y-1.5 text-xs text-[#eee3f7] mb-4 bg-[#100b17] p-3 rounded-xl border border-[#d798ff15]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#baacc7]">
                      <Calendar size={13} />
                      Periodo
                    </span>
                    <span className="font-semibold text-white">
                      {cls.startDate} a {cls.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#baacc7]">Modalidade</span>
                    <span className="capitalize font-semibold text-[#de74f6]">
                      {cls.modality}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#baacc7]">Investimento</span>
                    <span className="font-bold text-white font-mono">
                      {cls.priceFormatted}
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de Progresso de Vagas */}
              <div className="pt-3 border-t border-[#d798ff22]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1 text-[#baacc7]">
                    <Users size={13} />
                    Ocupacao de Vagas
                  </span>
                  <span className="font-black text-white font-mono">
                    {cls.enrolledCount} de {cls.maxCapacity} ({occupancyRate}%)
                  </span>
                </div>

                {/* Trilho da Barra */}
                <div className="w-full h-2 bg-[#160d20] rounded-full overflow-hidden border border-[#d798ff22]">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isFull
                        ? "bg-gradient-to-r from-rose-500 to-red-600"
                        : occupancyRate >= 80
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-[#c22ef3] to-[#f33199]"
                    }`}
                    style={{ width: `${Math.min(100, occupancyRate)}%` }}
                  />
                </div>

                {isFull ? (
                  <div className="flex items-center gap-1 text-[11px] text-rose-300 mt-2 font-medium">
                    <AlertCircle size={12} />
                    <span>Limite de vagas atingido. Ativar fila de espera.</span>
                  </div>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

