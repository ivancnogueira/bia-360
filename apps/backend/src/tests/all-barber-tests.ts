import { execSync } from "node:child_process";

const testFiles = [
  "src/tests/services-professionals.test.ts",
  "src/tests/appointment-concurrency.test.ts",
  "src/tests/orders-cash-stock.test.ts",
  "src/tests/commission-engine.test.ts",
];

console.log("Executando suite completa de testes da Barbearia (Fase 02)...\n");

for (const file of testFiles) {
  try {
    console.log(`>>> Executando: ${file}`);
    execSync(`npx tsx ${file}`, { stdio: "inherit" });
    console.log("");
  } catch (error) {
    console.error(`Falha no arquivo de teste: ${file}`);
    process.exit(1);
  }
}

console.log("Todos os testes da Fase 02 foram executados com sucesso total!");

