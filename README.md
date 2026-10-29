# BIA Platform

Página de vendas BIA 360 para barbearias, escolas e operações híbridas.

## Organização

- `apps/marketing`: Next.js, página pública componentizada.
- `apps/web`: reservado para o futuro frontend do app.
- `apps/api`: reservado para o futuro backend e integrações.
- Pacotes compartilhados serão extraídos quando houver consumo real por mais de um app.

Domínios previstos: domínio principal para marketing, `app` para frontend, `api` para backend. Não há migração do sistema atual nesta etapa.

## Uso

`npm install`, `npm run dev` e `npm run build` na raiz.

Para publicar em subpasta, definir `NEXT_PUBLIC_BASE_PATH` durante o build. A pasta exportada é `apps/marketing/out`.

O arquivo `apps/marketing/src/app/page.tsx` monta a hero e as seções de funcionamento, recursos, público, planos, evolução, dúvidas e chamada final. Cada dobra tem seu próprio componente. O avatar, o logo e as âncoras existentes são preservados. A gestão pelo WhatsApp recebe destaque na hero; os recursos incluem a visão completa do produto e indicam que algumas funcionalidades estão em desenvolvimento.

Os estilos comuns ficam em `globals.css`, os da hero em `hero-copy.css`, os do header em `navigation.css` e os das demais dobras em `sales.css`. A altura do header é compartilhada pela variável `--header-height`. No celular, a hero reserva uma linha para o texto e usa o espaço restante para o avatar e o exemplo de conversa.

Na seção Como funciona, a prévia de conversa reutiliza a moldura e o fundo de `bia-360/.navichats/public/preview-templates`, copiados para `apps/marketing/public/preview-templates`. A conversa exibida é ilustrativa, com dados fictícios.

Os preços exibidos são propostas de lançamento sujeitas a confirmação. Os três checkouts ainda não foram informados: `checkoutLinks`, em `apps/marketing/src/data/product.ts`, mantém `null` para cada plano e os botões aparecem desativados. Para habilitá-los, substituir cada `null` pela URL de checkout correspondente. O WhatsApp informado para suporte fica apenas no rodapé, configurado no mesmo arquivo.

O menu responsivo fecha ao selecionar uma âncora, pressionar Escape, clicar ou mover o foco para fora do header e retornar à largura desktop. Escape devolve o foco ao botão de abertura.

## Publicação da prévia

No PowerShell, executar na raiz:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/bia-360/vendas'
npm.cmd run build
```

Conferir a exportação em `apps/marketing/out` e copiar seu conteúdo somente para `dist/vendas` no checkout `../apresentacao-bia-bsv-2026`. Fazer commit e push em `main` desse repositório publica a prévia pelo workflow do GitHub Pages. O código-fonte permanece neste diretório; não editar o sistema original em `Barone Academy/bia-360`.
