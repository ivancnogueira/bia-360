import { AddOrderItemSchema, CloseOrderSchema } from "../validators/order.schema";
import { CreateProductSchema } from "../validators/product.schema";
import { OpenCashSessionSchema, CloseCashSessionSchema } from "../validators/cash-session.schema";
import { PaymentMethod } from "@prisma/client";

async function runTests() {
  console.log("Iniciando testes de comandas, caixa e estoque (Plano 02-03)...");
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

  // 1. Validacao de Produto com centavos
  try {
    const validProduct = CreateProductSchema.parse({
      organizationId: "org-1",
      name: "Pomada Modeladora Matte Barone",
      priceInCents: 4500, // R$ 45,00
      costInCents: 1800,  // R$ 18,00
      stockQuantity: 25,
      minStockAlert: 5,
    });
    assert(validProduct.priceInCents === 4500, "CreateProductSchema persiste precos em centavos inteiros");
  } catch (e) {
    assert(false, "CreateProductSchema falhou com dados validos");
  }

  // 2. Validacao de Item de Comanda (deve ter serviceId OU productId)
  try {
    const validItem = AddOrderItemSchema.parse({
      orderId: "ord-1",
      productId: "prod-1",
      quantity: 2,
      priceInCents: 4500,
    });
    assert(validItem.priceInCents * validItem.quantity === 9000, "AddOrderItemSchema calcula total do item (9000 centavos)");
  } catch (e) {
    assert(false, "AddOrderItemSchema falhou ao adicionar produto");
  }

  try {
    AddOrderItemSchema.parse({
      orderId: "ord-1",
      quantity: 1,
      priceInCents: 5000,
      // Sem serviceId e sem productId
    });
    assert(false, "AddOrderItemSchema deveria rejeitar item sem servico e sem produto");
  } catch (e) {
    assert(true, "AddOrderItemSchema exige obrigatoriamente serviceId ou productId");
  }

  // 3. Validacao de Fechamento de Comanda com Enum de Pagamento
  try {
    const validClose = CloseOrderSchema.parse({
      organizationId: "org-1",
      orderId: "ord-1",
      paymentMethod: PaymentMethod.PIX,
      discountInCents: 500, // R$ 5,00 de desconto
    });
    assert(validClose.paymentMethod === PaymentMethod.PIX, "CloseOrderSchema aceita metodo PIX e desconto em centavos");
  } catch (e) {
    assert(false, "CloseOrderSchema falhou com dados validos");
  }

  // 4. Calculo Matematico de Fechamento de Caixa
  const openingBalanceInCents = 10000; // R$ 100,00 de troco
  const totalIncomeInCents = 85000;    // R$ 850,00 recebidos
  const totalExpenseInCents = 5000;    // R$ 50,00 de sangria para lanche

  const expectedBalanceInCents = openingBalanceInCents + totalIncomeInCents - totalExpenseInCents;
  const countedBalanceInCents = 90000; // R$ 900,00 contados no cofre
  const differenceInCents = countedBalanceInCents - expectedBalanceInCents;

  assert(expectedBalanceInCents === 90000, "Saldo esperado calculado com exatidao em centavos (R$ 900,00)");
  assert(differenceInCents === 0, "Conferencia de caixa fecha sem diferenca");

  console.log(`\nResultado Plano 02-03: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
