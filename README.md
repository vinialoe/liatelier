# Site do Liatelier

Website de [liatelier.com.br](https://liatelier.com.br) — Astro 7, 100% estático, hospedado no Netlify.

Este repositório contém **só o site**. A base de conhecimento do projeto (fontes, dados, marca, conselho) vive fora dele, na pasta-mãe do projeto, e não é publicada.

## Rodar localmente

Requer Node 22.12 ou superior.

```bash
npm ci
npm run dev       # http://localhost:4321, recarrega ao salvar
npm run build     # gera dist/
npm run preview   # serve o dist/ gerado
```

## Publicar

Todo `git push` na branch `main` dispara build e deploy no Netlify (configuração em `netlify.toml`). Não se arrasta mais pasta `dist` no painel.

```bash
git add -A
git commit -m "descreva a mudança"
git push
```

Para conferir antes de publicar: abra um Pull Request — o Netlify gera uma URL de prévia para ele.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Textos (bio, aulas, projetos, contatos, navegação) | `src/data/site.json` |
| Peças do portfólio (ordem, vitrines, alt) | `src/data/pecas.json` |
| Imagens-mestre (peças, retrato, logo) | `src/assets/` — origem de cada uma em `src/assets/origens.json` |
| Cores, fontes, raios | `src/styles/tokens.css` (derivado de `brand/brand-tokens.json` do projeto) |
| Páginas | `src/pages/` |
| Cabeçalho, rodapé, foto, logo | `src/components/` |
| Deploy, cache e headers | `netlify.toml` |

Conteúdo nunca fica escrito dentro de página ou componente: entra pelos JSON de `src/data/`.

## Imagens

Nunca use `<img>` apontando para uma master. Use os componentes:

- `Foto.astro` — gera WebP (e JPEG de reserva) em 360/480/560/720/1024 px e o navegador baixa só o tamanho do slot. A prop `sizes` informa a largura CSS do slot em cada breakpoint.
- `Logo.astro` — logo na altura exata de uso, em 1x a 3x.

O redimensionamento passa por `src/servico-imagens.mjs` (sharp + nitidez). As masters têm 1024 px: slots maiores que isso em telas de alta densidade (o destaque do mosaico, o lightbox) são ampliados pelo navegador. Só masters maiores resolvem — ver "Pendências".

Imagens em `public/` são servidas como estão, sem otimização. Lá ficam só favicon, barrados SVG e o logo usado em Open Graph.

## Tarefas comuns

**Adicionar uma peça**

1. Coloque a master aprovada em `Otimizadas/` (no projeto) e registre-a em `data/entities/artworks.yaml`.
2. Acrescente a entrada em `src/data/pecas.json` (`id`, `ordem`, `foto`, `alt`, `legenda`).
3. Rode `npm run sync:assets` — copia a master para `src/assets/pecas/` sem recompressão e atualiza `origens.json`.
4. `npm run build` para conferir, depois commit e push.

Se a master não seguir o padrão `Otimizadas/N/foto_peca_referencia_N_M_liatelier.png`, copie-a à mão para `src/assets/pecas/<id>.jpg` ou acrescente o caso em `scripts/sync-assets.mjs`.

**Trocar uma imagem** — substitua a master no projeto e rode `npm run sync:assets`.

**Mudar a vitrine da home ou o mosaico do portfólio** — campos `home` (1–6) e `mosaico` (1–6) em `pecas.json`.

**Atualizar um texto** — edite `src/data/site.json`. O texto precisa estar aprovado na base do projeto antes (CLAUDE.md §3.5).

**Retirar uma peça do ar** — remova a entrada de `pecas.json` (a master pode ficar em `src/assets/`; o que não é referenciado não vai para as páginas).

## Verificações antes de publicar mudanças de layout

- `npm run build` sem erros (o schema de `src/content.config.ts` valida `pecas.json`).
- Conferir em largura de celular (390 px): nada pode gerar rolagem lateral.
- Acessibilidade: axe-core nas 6 páginas, 0 violações (estado em 2026-10-01).

## Pendências conhecidas

- **Masters de 1024 px.** Para nitidez total do destaque do mosaico e do lightbox em telas de alta densidade, as peças do mosaico precisariam de masters de ~2048 px.
- **Domínio canônico.** `astro.config.mjs` declara `https://liatelier.com.br`. Se o domínio primário no Netlify for `www.liatelier.com.br`, troque o campo `site` para ele.
