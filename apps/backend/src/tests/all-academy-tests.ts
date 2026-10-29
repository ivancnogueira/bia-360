import { execSync } from "node:child_process";

const testFiles = [
  "src/tests/courses.test.ts",
  "src/tests/class-group-capacity.test.ts",
  "src/tests/enrollment-pipeline.test.ts",
  "src/tests/academic-certificate.test.ts",
];

console.log("Executando suite completa de testes da Escola Barone (Fase 03)...\n");

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

console.log("Todos os testes da Escola Barone (Fase 03) foram executados com sucesso total!");
