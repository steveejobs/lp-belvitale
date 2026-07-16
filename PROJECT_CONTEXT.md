# Contexto do projeto Belvitale / CeluClin

Este arquivo e a primeira leitura obrigatoria para qualquer contexto futuro. Ele registra o estado corrente da homepage, as decisoes que nao devem regredir e os comandos de validacao.

## Objetivo atual

A rota `/` e uma campanha editorial de beleza, limpa e comercialmente clara. A identidade usa branco quente, preto ameixa, pink da tampa e magenta do rotulo. O produto deve permanecer dominante, sem aparencia de clinica, template de suplemento ou wellness bege.

O projeto e mobile-first, mas deve funcionar com a mesma hierarquia em desktop. Nao usar `zoom`, `scale` global, blobs, glow, bounce, fade-up universal ou texto interno de validacao na interface.

## Estado de publicacao

- Trabalhar sempre em preview. Nao fazer deploy direto em producao.
- A secao de kits e os CTAs Yampi aparecem em desenvolvimento porque os tres checkouts foram auditados em navegador limpo.
- O gate comercial de producao continua fechado por dependencias institucionais, regulatorias, precos e direitos das miniaturas oficiais.
- Nao remover nem contornar `commercialPublicationGate`, `commercialPreviewReady` ou os gates regulatorios.
- Nao inventar preco, desconto, parcela, frete, urgencia, estoque ou garantia.
- O proprietario confirmou nesta rodada o destaque `Mais vendido` somente para o kit de 3 meses.

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
| Hero | `/product/celuclin-front-02.webp` |
| Apresentacao do produto | `/product/celuclin-angle.webp` e `/product/celuclin-front-01.webp` |
| Liberdade de escolha | `/lifestyle/freedom-01.webp` |
| Formula | `/product/celuclin-capsules.webp` |
| Resultados | nove imagens em `/proof/`, separadas por categoria |
| Rotulo | `/label/celuclin-label-front.webp`, somente em `#rotulo` |
| Rotina | `/lifestyle/routine-01.webp` e `/product/celuclin-hand.webp` |
| Kits | composicoes locais em `/offers/`, feitas com o packshot real |
| Fechamento | `/lifestyle/celuclin-hero.webp` |

Nao usar a arte plana do rotulo como produto, fundo, textura, formula ou kit. As miniaturas recuperadas da Yampi nao ficam no projeto: somente seus metadados de auditoria permanecem em `artifacts/checkout-audit.json`.

## Arquitetura

- `src/components/`: secoes da homepage e rotas ativas.
- `src/components/ui/`: primitivas reutilizaveis de interface e motion.
- `src/components/commercial/`: componentes da area de kits.
- `src/data/`: fatos, manifests, checkouts e apresentacao tipada.
- `src/theme/`: tokens e coreografias compartilhadas; novas cores e duracoes entram aqui.
- `src/home.css`: composicao especifica da homepage.
- `tools/`: utilitarios locais em Python; nunca modificar originais sem destino explicito.
- `docs/requirements-ledger.md`: contratos atuais da pagina.
- `docs/quiz-context.md`: estado e pendencias do quiz para a proxima fase.

## Regras de UX

- Body mobile com no minimo 16 px e alvos de toque com no minimo 44 x 44 px.
- Imagens de produto usam proporcao real; provas usam `contain` e nao recebem filtros.
- Galerias de prova carregam somente anterior, atual e proxima; autoplay pausa fora da viewport, no hover, no foco, durante gesto e com aba oculta.
- `prefers-reduced-motion` remove autoplay e transicoes sem esconder conteudo.
- Numeracao decorativa nao deve voltar a imagens, galerias ou cards de kits.
- Entradas e saidas usam `Reveal`; mouse movement deve ser leve e funcional.

## Comandos obrigatorios

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:e2e
npm run test:production
```

Para otimizar novas imagens, consultar `tools/README.md`. Depois de qualquer mudanca visual, validar pelo menos 390 x 844 e 1440 x 900, console, rede, overflow, teclado, swipe e reduced motion.

## Ultima validacao

Rodada concluida em 15/07/2026:

- lint, typecheck e build aprovados;
- 57 testes Playwright aprovados;
- gate de producao aprovado com comercio, canonical e quiz ainda bloqueados;
- Lighthouse: performance 90, acessibilidade 100, boas praticas 100 e SEO 58;
- FCP 1,7 s, LCP 3,1 s, CLS 0 e TBT 160 ms;
- relatorio em `artifacts/lighthouse-home-refinement.json`;
- capturas finais em `artifacts/screenshots/390x844-home-full.png` e `artifacts/screenshots/1440x900-home-full.png`;
- gravacoes em `artifacts/videos/refinement/`.

## Politica de limpeza

- Nao recriar `/__concept/*`, `GalleryAtlas` ou manifests paralelos de assets.
- Nao versionar `dist/`, `.tmp/`, `test-results/`, logs ou capturas intermediarias.
- Preservar os testes ativos: eles protegem comportamento real e ocupam pouco espaco.
- Manter somente evidencias finais explicitamente liberadas no `.gitignore`.
