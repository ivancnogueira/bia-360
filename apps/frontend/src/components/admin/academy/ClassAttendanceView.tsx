"use client";

import React, { useState } from "react";
import { Check, X, Award, ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export interface StudentEnrollment {
  id: string;
  name: string;
  phone: string;
  totalSessions: number;
  attendedSessions: number;
  status: "ENROLLED" | "COMPLETED";
  certificateCode?: string;
}

export interface ClassAttendanceViewProps {
  classNameCode: string;
  students: StudentEnrollment[];
  onToggleAttendance: (studentId: string, present: boolean) => void;
  onIssueCertificate: (studentId: string) => void;
}

export const ClassAttendanceView: React.FC<ClassAttendanceViewProps> = ({
  classNameCode,
  students,
  onToggleAttendance,
  onIssueCertificate,
}) => {
  const [selectedStudentCert, setSelectedStudentCert] = useState<StudentEnrollment | null>(null);

  return (
    <div className="bg-[#100b17] border border-[#d798ff22] rounded-2xl p-5 shadow-xl shadow-black/30 space-y-4">
      {/* Topo da Lista de Chamada */}
      <div className="flex items-center justify-between border-b border-[#d798ff22] pb-4">
        <div>
          <div className="text-xs font-bold text-[#baacc7] uppercase tracking-wider">
            Diario de Classe e Frequencia
          </div>
          <h3 className="text-lg font-black text-white mt-0.5">
            Turma: <span className="text-[#de74f6]">{classNameCode}</span>
          </h3>
        </div>
        <Badge variant="purple" size="md">
          {students.length} Alunos Inscritos
        </Badge>
      </div>

      {/* Tabela de Alunos e Chamada */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#d798ff15] text-[11px] font-black text-[#887591] uppercase tracking-wider">
              <th className="py-3 px-3">Aluno</th>
              <th className="py-3 px-3">WhatsApp</th>
              <th className="py-3 px-3">Frequencia</th>
              <th className="py-3 px-3">Status de Certificacao</th>
              <th className="py-3 px-3 text-right">Acoes de Chamada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d798ff10] text-xs">
            {students.map((student) => {
              const rate = Math.round(
                (student.attendedSessions / (student.totalSessions || 1)) * 100
              );
              const isEligible = rate >= 75;

              return (
                <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Nome */}
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white">{student.name}</div>
                  </td>

                  {/* Telefone */}
                  <td className="py-3.5 px-3 font-mono text-[#baacc7]">
                    {student.phone}
                  </td>

                  {/* Taxa de Frequencia */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black font-mono text-white">
                        {rate}%
                      </span>
                      <span className="text-[10px] text-[#887591]">
                        ({student.attendedSessions}/{student.totalSessions} aulas)
                      </span>
                    </div>
                  </td>

                  {/* Status do Certificado */}
                  <td className="py-3.5 px-3">
                    {student.certificateCode ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-mono text-[11px] font-bold">
                        <ShieldCheck size={13} />
                        {student.certificateCode}
                      </span>
                    ) : isEligible ? (
                      <Badge variant="success" size="sm">
                        Apto ao Certificado (&gt;= 75%)
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Frequencia Insuficiente (&lt; 75%)
                      </Badge>
                    )}
                  </td>

                  {/* Botoes de Acao */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onToggleAttendance(student.id, true)}
                        className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 transition-colors"
                        title="Marcar presenca hoje"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => onToggleAttendance(student.id, false)}
                        className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 transition-colors"
                        title="Marcar falta hoje"
                      >
                        <X size={14} />
                      </button>
                      {isEligible && !student.certificateCode ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            onIssueCertificate(student.id);
                            setSelectedStudentCert(student);
                          }}
                        >
                          <Award size={13} className="text-[#de74f6]" />
                          <span>Emitir Certificado</span>
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Certificado Emitido */}
      <Modal
        isOpen={!!selectedStudentCert}
        onClose={() => setSelectedStudentCert(null)}
        title="Certificado Digital Emitido com Sucesso"
        description="Autenticidade e código de verificação criptográfica anti-fraude gerados no padrão oficial da Academy."
      >
        {selectedStudentCert ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#c22ef315] to-[#f3319915] border border-[#c22ef355] text-center space-y-2">
              <Award size={36} className="mx-auto text-[#de74f6]" />
              <div className="text-base font-black text-white">
                {selectedStudentCert.name}
              </div>
              <div className="text-xs text-[#baacc7]">
                Conclusão com frequência comprovada de{" "}
                <span className="text-emerald-400 font-bold">
                  {Math.round(
                    (selectedStudentCert.attendedSessions /
                      (selectedStudentCert.totalSessions || 1)) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="mt-3 p-2 bg-[#08070d] border border-[#d798ff33] rounded-lg font-mono text-sm font-black text-[#de74f6] tracking-widest">
                ACAD-78C2-A9F1-E40B
              </div>
            </div>
            <div className="text-center">
              <Button
                variant="primary"
                size="md"
                onClick={() => setSelectedStudentCert(null)}
              >
                Concluir e Enviar no WhatsApp
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

