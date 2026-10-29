import { z } from "zod";
import { RoleType } from "@prisma/client";

export const CreateMemberSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  userId: z.string({ required_error: "ID do usuario e obrigatorio" }).min(1),
  unitId: z.string().optional(),
  role: z.nativeEnum(RoleType, {
    errorMap: () => ({ message: "Cargo/Papel invalido para membro" }),
  }),
  active: z.boolean().default(true),
});

export const UpdateMemberSchema = z.object({
  unitId: z.string().nullable().optional(),
  role: z.nativeEnum(RoleType).optional(),
  active: z.boolean().optional(),
});

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;

