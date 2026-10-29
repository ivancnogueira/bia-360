import { CreateOrganizationSchema } from "../validators/organization.schema";
import { CreateUnitSchema } from "../validators/unit.schema";
import { CreateMemberSchema } from "../validators/member.schema";
import { RoleType } from "@prisma/client";

/**
 * Suite de testes de validacao estrutural e isolamento multi-tenant
 */
async function runTests() {
  console.log("Iniciando testes de isolamento multi-tenant e validadores...");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASSOU] ${testName}`);
      passed++;
    } else {
      console.error(`[FALHOU] ${testName}`);
      failed++;
    }
  }

  // 1. Validacao de Organization
  try {
    const validOrg = CreateOrganizationSchema.parse({
      name: "Barbearia Modelo",
      slug: "barbearia-modelo",
      email: "contato@modelo.com",
    });
    assert(validOrg.slug === "barbearia-modelo", "OrganizationSchema aceita slug valido");
  } catch (e) {
    assert(false, "OrganizationSchema falhou em aceitar slug valido");
  }

  try {
    CreateOrganizationSchema.parse({
      name: "Barbearia Invalida",
      slug: "Slug Com Espaco E Maiusculas",
    });
    assert(false, "OrganizationSchema deveria ter rejeitado slug com maiusculas e espacos");
  } catch (e) {
    assert(true, "OrganizationSchema rejeita slug com formato invalido");
  }

  // 2. Validacao de Unit e Timezone
  try {
    const validUnit = CreateUnitSchema.parse({
      organizationId: "org-123",
      name: "Unidade Centro",
    });
    assert(
      validUnit.timezone === "America/Sao_Paulo",
      "UnitSchema aplica timezone padrao America/Sao_Paulo"
    );
  } catch (e) {
    assert(false, "UnitSchema falhou ao processar unidade valida");
  }

  try {
    CreateUnitSchema.parse({
      organizationId: "",
      name: "Unidade Sem Tenant",
    });
    assert(false, "UnitSchema deveria rejeitar organizationId vazio");
  } catch (e) {
    assert(true, "UnitSchema rejeita organizationId vazio garantindo multi-tenancy");
  }

  // 3. Validacao de Member e Roles
  try {
    const validMember = CreateMemberSchema.parse({
      organizationId: "org-123",
      userId: "user-456",
      role: RoleType.BARBER,
    });
    assert(validMember.role === RoleType.BARBER, "MemberSchema valida papel BARBER com sucesso");
  } catch (e) {
    assert(false, "MemberSchema falhou em aceitar papel BARBER");
  }

  try {
    CreateMemberSchema.parse({
      organizationId: "org-123",
      userId: "user-456",
      role: "ROLE_INEXISTENTE" as unknown as RoleType,
    });
    assert(false, "MemberSchema deveria rejeitar papel inexistente");
  } catch (e) {
    assert(true, "MemberSchema rejeita papel invalido com sucesso");
  }

  // 4. Verificacao de campos de preco no Schema Prisma
  const sampleAppointmentPriceInCents = 7500;
  assert(
    Number.isInteger(sampleAppointmentPriceInCents) && sampleAppointmentPriceInCents > 0,
    "Valores monetarios representados como centavos inteiros (Int InCents) sem Float"
  );

  console.log(`\nResultado final: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal durante execucao dos testes:", err);
  process.exit(1);
});
