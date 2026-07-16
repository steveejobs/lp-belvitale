# Matriz objetiva - Belvitale / CeluClin

Data: 16/07/2026  
Escopo: preview Vercel, sem alteracao de producao.  
Regra: pontos observaveis divididos por 10; sem arredondamento. A homologacao humana continua separada.

## Resumo

| Area | Antes | Pontos observaveis | Nota calculada | Status |
| --- | ---: | ---: | ---: | --- |
| Marketing e conversao | 53/100 | 96/100 | 9,6 | Pontuacao tecnica; teste humano de 80% pendente |
| UI/UX | 68/100 | 99/100 | 9,9 | Evidencias tecnicas e visuais completas |
| Desenvolvimento e performance | 60/100 | 98/100 | 9,8 | Preview remoto tem `noindex` obrigatorio; build local SEO 100 |
| Consumidora | Nao validada | Nao pontuada | Nao calculada | Nota de consumidora ainda nao validada |

Nao ha falha eliminatoria na implementacao ou no preview testado. A nota de Marketing nao deve ser tratada como homologacao de pesquisa ate a execucao do protocolo com participantes reais. O SEO remoto de preview mede 69 apenas porque a Vercel injeta `X-Robots-Tag: noindex`; Performance 95, Accessibility 100 e Best Practices 100 permanecem validos. O build equivalente local mede SEO 100.

## Marketing e conversao

| Criterio | Peso | Pontos obtidos | Evidencia | Problema | Correcao |
| --- | ---: | ---: | --- | --- | --- |
| Proposta entendida em ate 5 segundos | 15 | 13 | [Hero mobile](./after/screenshots/hero-390x844.png) | Teste humano de compreensao ainda pendente | Produto, categoria, uso e CTA reunidos na primeira dobra |
| Identificacao emocional especifica | 10 | 10 | [Reconhecimento](./after/screenshots/recognition-390.png) | Nenhum observado | Copy concreta sobre roupa, foto e escolha |
| Produto compreendido | 10 | 10 | [Produto](./after/screenshots/product-390.png) | Nenhum observado | Frasco real, 60 capsulas, 2 ao dia e 30 dias |
| Beneficio e posicionamento sem claims indevidos | 10 | 10 | `tests/e2e/institutional-legal.spec.ts` | Nenhum claim encontrado | Auditoria automatizada de copy e fatos centralizados |
| Resultados reais visiveis e confiaveis | 15 | 15 | [Celulite](./after/screenshots/results-cellulite-390.png), [flacidez](./after/screenshots/results-laxity-390.png), [gordura localizada](./after/screenshots/results-localized-fat-390.png) | Nenhum observado | Nove provas inteiras, sem filtro, com contexto autorizado |
| Oferta compreensivel | 15 | 13 | [Ofertas](./after/screenshots/offers-390.png) | Teste humano de diferenciacao ainda pendente | 30, 90 e 210 dias comparaveis, sem preco inventado |
| CTA principal evidente | 10 | 10 | [Hero mobile](./after/screenshots/hero-390x844.png) | Nenhum observado | CTA primario na primeira dobra e CTA fixo contextual |
| Reducao de risco e objecoes | 5 | 5 | [FAQ e pagina completa](./after/screenshots/home-390x844-full.png) | Nenhum observado | Rotulo, FAQ, disclaimer e uso apresentados antes do final |
| Continuidade narrativa ate a compra | 5 | 5 | [Jornada de 60 segundos](./after/videos/home-first-60-seconds.webm) | Nenhum observado | Ordem reconhecimento, produto, formula, rotina, prova e oferta |
| Checkout correto e UTMs preservadas | 5 | 5 | [Auditoria remota](./after/remote-audit.json), [gravacao](./after/videos/checkout-links.webm) | Nenhum carrinho vazio | Tres redirects e whitelist de cinco UTMs testados |

Total: **96/100 = 9,6**, sem arredondamento. Homologacao humana pendente.

## UI/UX

| Criterio | Peso | Pontos obtidos | Evidencia | Problema | Correcao |
| --- | ---: | ---: | --- | --- | --- |
| Hierarquia da primeira dobra | 15 | 15 | [Hero 390 x 844](./after/screenshots/hero-390x844.png) | Nenhum observado | Produto, headline e CTA em uma dobra |
| Produto como protagonista | 10 | 10 | [Hero](./after/screenshots/hero-390x844.png) | Nenhum observado | Packshot real domina a composicao |
| Identidade visual propria | 10 | 9 | [Antes](./before/home-390x844.png), [depois](./after/screenshots/home-390x844-full.png) | Ainda usa uma estrutura editorial conhecida | Paleta e ritmo extraidos do frasco e das provas reais |
| Mobile-first real | 15 | 15 | [390](./after/screenshots/home-390x844-full.png), [430](./after/screenshots/home-430x932-full.png) | Nenhum observado | Sete viewports cobertos pelo Playwright |
| Galerias faceis de observar | 15 | 15 | [Autoplay, swipe e pausa](./after/videos/galleries-autoplay-swipe-pause.webm) | Nenhum observado | Uma prova grande, setas, dots, swipe e altura estavel |
| Imagens sem cortes inadequados | 10 | 10 | [Provas](./after/screenshots/results-cellulite-390.png) | Nenhum observado | Metadados por asset e `contain` nas provas |
| Navegacao e CTAs claros | 10 | 10 | [Home completa](./after/screenshots/home-390x844-full.png) | Nenhum observado | Header, ancoras, CTA fixo e ofertas testados |
| Motion com funcao | 5 | 5 | [Home](./after/videos/home-first-60-seconds.webm) | Nenhum observado | Cinco familias e reduced motion sem perda de conteudo |
| Densidade e ritmo | 5 | 5 | [Desktop](./after/screenshots/home-1440x900-full.png) | Nenhum observado | Escala e espacamento reduzidos sem zoom global |
| Acessibilidade e ergonomia | 5 | 5 | 57 testes; Lighthouse A11y 100 | Nenhum observado | Alvos >=44 px, teclado, foco, Escape e 200% |

Total: **99/100 = 9,9**, sem arredondamento.

## Desenvolvimento e performance

| Criterio | Peso | Pontos obtidos | Evidencia | Problema | Correcao |
| --- | ---: | ---: | --- | --- | --- |
| Build, lint e typecheck | 10 | 10 | [Resumo de validacao](./after/validation-summary.json) | Nenhum | Todos os comandos aprovados |
| Console e network limpos | 10 | 10 | [Auditoria remota](./after/remote-audit.json) | Nenhum | Zero erro de console, pagina ou request funcional |
| Assets sem 404 | 10 | 10 | [Auditoria remota](./after/remote-audit.json) | Nenhum | 19 imagens renderizadas, zero quebrada |
| Checkouts e redirects corretos | 15 | 15 | [Auditoria remota](./after/remote-audit.json) | Nenhum | Tres produtos corretos, status 200, carrinhos preenchidos |
| Performance mobile | 15 | 15 | [Lighthouse remoto](./lighthouse-preview.json) | Nenhum | Performance 95; bundle inicial 8,88 kB gzip |
| CLS e estabilidade visual | 10 | 10 | [Lighthouse remoto](./lighthouse-preview.json) | Nenhum | CLS 0 e dimensoes reservadas |
| Imagens responsivas e lazy loading | 10 | 10 | Build e `srcset` no DOM | Nenhum | Hero responsivo; conteudo inferior lazy; tres provas no DOM |
| Acessibilidade tecnica | 10 | 10 | Lighthouse 100 e Playwright | Nenhum | Foco, teclado, reduced motion e zoom 200% |
| SEO, canonical e metadata | 5 | 3 | Lighthouse local SEO 100; remoto SEO 69 | Preview Vercel injeta `noindex` | Canonical, OG, robots e schema corretos; nao remover protecao do preview |
| Codigo sustentavel e dados centralizados | 5 | 5 | `src/data/`, `src/theme/`, componentes lazy | Nenhum | Ofertas, assets, fatos, eventos e motion centralizados |

Total: **98/100 = 9,8**, sem arredondamento. A exigencia literal de SEO remoto >=95 so pode ser homologada no dominio de producao ou em custom domain sem `noindex`; nenhuma dessas acoes foi executada nesta rodada de preview.

## Consumidora

**Nota de consumidora ainda nao validada.**

O pre-teste automatizado nao substitui cinco mulheres proximas do publico. Aplicar [o protocolo](./consumer-test-protocol.md) sem explicar a pagina antes e recalcular Marketing e Consumidora com as respostas reais.

## Falhas eliminatorias

Nenhuma encontrada: ha oferta e CTA; os tres carrinhos estao corretos; nao ha claim, preco inventado, asset quebrado, imagem de prova cortada, linguagem interna, overflow, erro de console ou autoplay em reduced motion.

## Antes e depois

| Evidencia | Antes | Depois |
| --- | --- | --- |
| Mobile | [390 x 844](./before/home-390x844.png) | [390 x 844](./after/screenshots/home-390x844-full.png) |
| Desktop | [1440 x 900](./before/home-1440x900.png) | [1440 x 900](./after/screenshots/home-1440x900-full.png) |
| Auditoria | [Baseline](./before/live-audit.json) | [Preview final](./after/remote-audit.json) |
| Lighthouse | [Baseline](./before/lighthouse.json) | [Preview final](./lighthouse-preview.json) |
