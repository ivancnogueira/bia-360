# Apresentação BIA e Barone

Apresentação HTML para negociação do lançamento do SaaS beta em 3 de novembro de 2026, durante o BSV. Os Barone são os fundadores do negócio. Clientes embaixadores recebem uma condição comercial de lançamento e ajudam na evolução, sem participação societária.

## Abrir e apresentar

Abra `dist/index.html` no navegador. Para a experiência completa, sirva a pasta `dist` por HTTP. A prévia desta sessão usa http://127.0.0.1:8773/ enquanto o servidor local estiver ativo.

A página tem modo Apresentar, navegação por seções, exemplos de conversa, alternância entre preços beta e regulares, simulação das duas propostas e opção de impressão em PDF. No modo Apresentar, use as setas para avançar e voltar ou os controles na parte inferior. Escape encerra o modo. As animações respeitam a preferência de movimento reduzido do dispositivo.

Todas as imagens, fontes e ícones são locais. A apresentação não depende de biblioteca externa, banco, login ou instalação. Os exemplos de conversa são ilustrações da experiência proposta, não uma aplicação conectada ao WhatsApp.

## GitHub Pages

Repositório: [ivancnogueira/bia-360](https://github.com/ivancnogueira/bia-360), branch `main`.

1. O repositório mantém a pasta `dist`, a pasta `.github` e `vercel.json` na raiz.
2. Use a branch `main`. Para outra branch, ajuste `.github/workflows/pages.yml`.
3. Em Settings, Pages, escolha GitHub Actions como origem.
4. O workflow publica somente a pasta `dist`. Um push na branch configurada ou uma execução manual inicia a publicação.
5. Depois da primeira publicação, configure o domínio em Settings, Pages, Custom domain. Use os registros DNS informados pelo GitHub. O pacote não contém domínio inventado ou CNAME provisório.

Os caminhos relativos também funcionam em um endereço de projeto como `usuario.github.io/repositorio/`. A documentação oficial orienta a configuração do workflow e as permissões de publicação: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Vercel

1. Importe o repositório ou envie o pacote para um projeto Vercel.
2. Use esta pasta como Root Directory. Framework Preset: Other. Não há instalação ou build.
3. `vercel.json` já indica `dist` como Output Directory e desativa a etapa de build.
4. Depois da publicação, adicione o domínio em Project Settings, Domains e siga os registros DNS apresentados.

Referências: [Configuração do projeto](https://vercel.com/docs/project-configuration) e [Configuração de build](https://vercel.com/docs/builds/configure-a-build). O domínio personalizado deve ser configurado no provedor escolhido.

## O que publicar

O pacote ZIP de deploy inclui `dist`, `.github/workflows/pages.yml`, `vercel.json`, `.gitignore` e este README. Os documentos de negociação em `apoio` e os originais das imagens em `assets` ficam fora do pacote público. As imagens usadas na página estão dentro de `dist/assets`.

O conteúdo da página inclui valores de negociação. A configuração `noindex` reduz a indexação, mas não cria senha ou controle de acesso. Escolha o público do endereço antes de compartilhar.

## Conteúdo e condições

- Preços propostos de lançamento: Barbearia R$199, Escola R$299 e Híbrido R$449 por mês, por 12 meses desde a ativação.
- Referências propostas para novas adesões posteriores: R$299, R$399 e R$599.
- Público previsto informado pelo usuário: 2.000 alunos. Calculadora livre, com cenários de 1%, 5%, 10% e 25% e quantidades manuais sem limite vinculado ao evento. Conversão é hipótese, não previsão. Ativações continuam condicionadas à capacidade e aos lotes combinados.
- Implantação assistida opcional: R$790, com escopo limitado.
- Parceria A: sem setup, 40% no lançamento, pró-labore de R$1.500 mensais garantido e 15% de recorrência posterior.
- Parceria B: setup de R$7.000, 10% no lançamento, o mesmo pró-labore mensal e recorrência.
- Percentuais de lançamento e recorrência não se acumulam sobre a mesma cobrança, segundo a regra proposta.
- O enquadramento em SCP precisa de advogado e contador. A apresentação explica a ressalva e a alternativa comercial. Os documentos de apoio não são um contrato final para assinatura.

Preços, franquias e limites são hipóteses para aprovação. Para editar, altere `dist/index.html`, os preços de alternância em `dist/app.js` e os preços de simulação em `dist/model.js`, mantendo os valores consistentes.

## Calculadora e distinção do investimento

O exemplo inicial usa 5% de conversão dos 2.000 participantes, resultando em 100 assinaturas: 40 de Barbearia, 40 de Escola e 20 de Híbrido. Receita ilustrativa da primeira mensalidade: R$28.900.

Na proposta A, a participação de lançamento é R$11.560. Na B, setup mais participação somam R$9.890. A diferença de R$1.670 favorece o caixa dos Barone nesse cenário. A apresentação também mostra quando a B custa mais, sem ocultar essa condição.

Com ticket médio de R$289 e participação de 10%, cerca de 27 assinaturas compensam os R$7.000 de setup, antes de pró-labore e demais custos. Isso equivale a 1,35% de 2.000 participantes. Cerca de 33 assinaturas atingem o equilíbrio do primeiro mês considerando setup e pró-labore, com outros custos informados como zero. O pró-labore é despesa mensal garantida, não aporte a devolver ou recuperar.

O controle de conversão vai até 100% do público informado. Os campos de quantidade são livres e também admitem cenários acima desse público, com aviso. Público e custos adicionais são editáveis. Vendas, ativação e recebimento não são a mesma etapa, e os resultados não constituem previsão de conversão ou lucro.

O quadro de escopo separa funções incluídas no MVP de 3/11 dos recursos do roadmap pós-lançamento. Os planos incluem a primeira versão, sem tratar as evoluções como já entregues.

## Créditos

As duas imagens são ilustrativas e foram geradas com o recurso integrado de imagem. Os prompts completos estão em `assets/imagens-geradas.json`, preservados como apoio fora do deploy. Não representam pessoas dos Barone ou um evento real.

Ícones: Lucide, licença ISC em `dist/assets/LUCIDE-LICENSE.txt`. Fonte: Manrope, licença OFL em `dist/assets/MANROPE-LICENSE.txt`. O wordmark usado é uma proposta visual, sujeita à aprovação da marca.

## Verificação desta entrega

Arquivos e referências locais, sintaxe JavaScript, cálculos da simulação, isolamento do pacote público e ausência de emdash/emojis foram verificados. A conferência visual e os testes de interação no navegador permanecem pendentes.
