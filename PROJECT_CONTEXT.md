# Contexto do projeto Belvitale / CeluClin

Este arquivo e a primeira leitura obrigatoria para qualquer contexto futuro. Ele registra o estado corrente da homepage, as decisoes que nao devem regredir e os comandos de validacao.

## Objetivo atual

A rota `/` e uma campanha editorial de beleza, limpa e comercialmente clara. A identidade usa branco quente, preto ameixa, pink da tampa e magenta do rotulo. O produto deve permanecer dominante, sem aparencia de clinica, template de suplemento ou wellness bege.

O projeto e mobile-first, mas deve funcionar com a mesma hierarquia em desktop. Nao usar `zoom`, `scale` global, blobs, glow, bounce, fade-up universal ou texto interno de validacao na interface.

## Estado de publicacao

- Trabalhar sempre em preview. Nao fazer deploy direto em producao.
- Preview visual validado em 16/07/2026: `lp-belvitale-dlsx5nojt-bandeirargabriel-6963s-projects.vercel.app` (protegido; usar o share link da entrega enquanto valido).
- A secao de kits e os CTAs Yampi aparecem em desenvolvimento porque os tres checkouts foram auditados em navegador limpo.
- `npm run build` gera o preview comercial com os kits; `npm run build:production` aplica os gates finais e oculta o comercio ainda nao liberado.
- O gate comercial de producao continua fechado por dependencias institucionais, regulatorias, precos e direitos das miniaturas oficiais.
- Nao remover nem contornar `commercialPublicationGate`, `commercialPreviewReady` ou os gates regulatorios.
- Nao inventar preco, desconto, parcela, frete, urgencia, estoque ou garantia.
- O kit de 3 meses recebe maior presenca visual, mas nenhum selo de popularidade e publicado sem evidencia comercial verificavel.

## Checkouts confirmados

| Kit | URL exata | Estado no preview |
| --- | --- | --- |
| 1 mes | `https://belvitale.pay.yampi.com.br/r/PWJOI4I112` | carrinho correto |
| 3 meses | `https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9` | carrinho correto |
| 7 meses | `https://belvitale.pay.yampi.com.br/r/41CHX4MGPX` | carrinho correto |

Os links abrem na mesma aba e preservam apenas `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` e `utm_term`.

## Mapa editorial dos assets

Cada asset principal tem uma funcao propria. Nao repetir imagens para preencher espaco.

| Area | Asset |
| --- | --- |
| Hero | `/lifestyle/confidence-hero.webp` e derivada responsiva `/lifestyle/confidence-hero-640.webp` |
| Apresentacao do produto | `/product/celuclin-angle.webp` e `/product/celuclin-front-01.webp` |
| Liberdade de escolha | `/lifestyle/freedom-01.webp` |
| Formula | `/product/celuclin-capsules.webp` |
| Resultados | nove imagens em `/proof/`, separadas por categoria |
| Rotulo | `/label/celuclin-label-front.webp`, somente em `#rotulo` |
| Rotina | `/lifestyle/routine-01.webp` e `/product/celuclin-hand.webp` |
| Kits | novas composicoes ilustrativas de 1, 3 e 7 frascos em `/offers/`, identificadas como ilustrativas |
| Fechamento | `/lifestyle/celuclin-hero.webp` |

Nao usar a arte plana do rotulo como produto, fundo, textura, formula ou kit. As miniaturas recuperadas da Yampi nao ficam no projeto: somente seus metadados de auditoria permanecem em `src/data/commercialPreview.ts` e `artifacts/final-v2/after/remote-audit.json`.

## Arquitetura

- `src/components/`: secoes da homepage e rotas ativas.
- `src/components/ui/`: primitivas reutilizaveis de interface e motion.
- `src/components/commercial/`: componentes da area de kits.
- `src/data/`: fatos, manifests, checkouts e apresentacao tipada.
- `src/theme/`: tema unificado em três camadas (`primitives.css` → `semantic.css` → `components.css`) e coreografias compartilhadas em `motion.css`; novas cores, medidas e durações entram somente aqui.
- `src/home.css`: composicao especifica da homepage.
- `tools/`: utilitarios locais em Python; nunca modificar originais sem destino explicito.
- `PROJECT_CONTEXT.md`: contrato de continuidade, arquitetura e comandos.
- `artifacts/final-v2/scorecard.md`: matriz objetiva e evidencias da rodada aprovada.
- `scripts/capture-final-evidence.mjs`: capturas, videos e auditoria do preview remoto; recebe `PREVIEW_URL` por variavel de ambiente.
- React e React DOM sao resolvidos por `preact/compat` no Vite para reduzir o runtime sem mudar as APIs do projeto.

## Regras de UX

- Body mobile com no minimo 16 px e alvos de toque com no minimo 44 x 44 px.
- Imagens de produto usam proporcao real; provas usam `contain` e nao recebem filtros.
- Galerias de prova carregam somente anterior, atual e proxima; autoplay pausa fora da viewport, no hover, no foco, durante gesto e com aba oculta.
- `prefers-reduced-motion` remove autoplay e transicoes sem esconder conteudo.
- Numeracao decorativa nao deve voltar a imagens, galerias ou cards de kits.
- Entradas e saidas usam familias curtas de motion; mouse movement deve ser leve e funcional.

## Comandos obrigatorios

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:e2e
npm run test:production
```

O comando `test:production` refaz o build em modo de producao antes de validar os gates. Para revisar a entrega visual e os checkouts, usar o build padrao de preview.

Para otimizar novas imagens, consultar `tools/README.md`. Depois de qualquer mudanca visual, validar pelo menos 390 x 844 e 1440 x 900, console, rede, overflow, teclado, swipe e reduced motion.

## Ultima validacao

Rodada concluida em 16/07/2026:

- lint, typecheck, build de preview e gate de producao aprovados;
- 57/57 testes Playwright aprovados, incluindo os sete viewports exigidos;
- preview remoto: zero erro de console, pagina, request funcional, overflow ou imagem quebrada;
- tres checkouts Yampi: status 200, produto correto e carrinho preenchido;
- Lighthouse local: Performance 97, Accessibility 100, Best Practices 100 e SEO 100;
- Lighthouse remoto: Performance 95, Accessibility 100, Best Practices 100, LCP 2,1 s, TBT 210 ms e CLS 0;
- SEO remoto 69 somente pelo `X-Robots-Tag: noindex` automatico da Vercel em previews; nao remover essa protecao;
- JavaScript inicial: 8,88 kB gzip; secoes pesadas continuam separadas;
- matriz e comparacao antes/depois em `artifacts/final-v2/scorecard.md`;
- evidencias finais em `artifacts/final-v2/after/`;
- nota de Consumidora continua nao validada ate o teste com cinco participantes reais.

## Politica de limpeza

- Nao recriar `/__concept/*`, `GalleryAtlas` ou manifests paralelos de assets.
- Nao versionar `dist/`, `.tmp/`, `test-results/`, logs ou capturas intermediarias.
- Preservar os testes ativos: eles protegem comportamento real e ocupam pouco espaco.
- Manter somente evidencias finais explicitamente liberadas no `.gitignore`.
- Limpeza de 16/07/2026 removeu capturas antigas de `artifacts/screenshots`, `artifacts/videos`, auditorias duplicadas da raiz de `artifacts`, rodadas intermediarias em `artifacts/final-v2/round-*`, logs locais, `dist/`, `.tmp/` e `test-results/`.
