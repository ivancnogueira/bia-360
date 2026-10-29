import { z } from "zod";

export const BaseClassGroupSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  unitId: z.string({ required_error: "ID da unidade e obrigatorio" }).min(1),
  courseId: z.string({ required_error: "ID do curso e obrigatorio" }).min(1),
  code: z
    .string({ required_error: "Codigo identificador da turma e obrigatorio" })
    .trim()
    .min(3, "Codigo deve conter no minimo 3 caracteres")
    .max(40),
  startDate: z.coerce.date({ required_error: "Data de inicio e obrigatoria" }),
  endDate: z.coerce.date({ required_error: "Data de conclusao e obrigatoria" }),
  maxCapacity: z
    .number({ required_error: "Capacidade maxima de alunos e obrigatoria" })
    .int("Capacidade deve ser um numero inteiro")
    .min(1, "Capacidade minima de 1 aluno")
    .max(100, "Capacidade maxima de 100 alunos"),
  active: z.boolean().default(true),
});

export const CreateClassGroupSchema = BaseClassGroupSchema.refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "A data de conclusao deve ser posterior ou igual a data de inicio",
    path: ["endDate"],
  }
);

export const UpdateClassGroupSchema = BaseClassGroupSchema.omit({
  organizationId: true,
  courseId: true,
}).partial();

export type CreateClassGroupInput = z.infer<typeof CreateClassGroupSchema>;
export type UpdateClassGroupInput = z.infer<typeof UpdateClassGroupSchema>;
