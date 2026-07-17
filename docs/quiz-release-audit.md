# Auditoria de release — Quiz CeluClin 6.0

## Preview

- quiz: http://127.0.0.1:4173/quiz
- resultado persistido: http://127.0.0.1:4173/quiz/resultado
- preview remoto Vercel: https://lp-belvitale-3dc3plj06-bandeirargabriel-6963s-projects.vercel.app
- inspect Vercel: https://vercel.com/bandeirargabriel-6963s-projects/lp-belvitale/4vvL3yjdnTngSGT4wvQ6YSEu8cg1
- producao: nao alterada e nao publicada

O preview local e servido a partir do build otimizado de preview. O deploy remoto foi criado com `target preview`, sem `--prod`; o acesso publico do projeto retorna a tela de Login da Vercel por protecao do workspace. Os artefatos visuais ficam em `artifacts/quiz-v6`.

## Gates executados

| Gate | Resultado |
| --- | --- |
| TypeScript | passou |
| ESLint | passou |
| build Vite | passou |
| suite E2E completa | 64/64 passaram |
| testes focados do quiz | 20/20 passaram |
| simulacao de combinacoes | 65.536/65.536 validas |
| jornadas manuais instrumentadas | 20/20 sem falha |
| recaptura final pos-build | passou |
| viewports auditados | 7 |
| estados visuais auditados | 52 |
| screenshots | 61 |
| videos | 6 |
| overflow | 0 |
| controles abaixo de 44 px | 0 |
| imagens quebradas | 0 |
| falhas de `object-fit: contain` na prova | 0 |
| frascos SVG no quiz | 0 |
| erros de console | 0 |
| page errors | 0 |
| request failures | 0 |

## Lighthouse do build final

| Perfil | Performance | Accessibility | Best Practices | SEO | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mobile, mediana de 3 rodadas | 95 | 100 | 100 | 100 | 0 |
| Desktop | 99 | 100 | 100 | 100 | 0 |

As tres rodadas mobile registraram Performance 95, 99 e 94. Os JSONs brutos estao em `artifacts/quiz-v6/lighthouse-mobile-final-run1.json`, `run2.json` e `run3.json`. O launcher do Lighthouse no Windows retornou `EPERM` somente ao remover sua pasta temporaria depois de gravar cada relatorio; os JSONs foram lidos e validados normalmente.

Viewports: 360x800, 375x812, 390x844, 412x915, 430x932, 1366x768 e 1440x900.

## Checkouts

| Duracao | HTTP | Produto/quantidade | Carrinho | Preco atual | Status do CTA |
| --- | ---: | --- | --- | ---: | --- |
| 30 dias | 200 | CeluClin 1 mes, 1 pote | preenchido | R$ 89,90 | ativo |
| 90 dias | 200 | CeluClin 3 meses, 3 potes | preenchido | R$ 169,90 | ativo |
| 210 dias | 200 | CeluClin 7 meses, 5+2 potes | preenchido | R$ 597,00 | ativo |

Foram verificados redirects, titulo, quantidade, referencias de preco, preco atual, imagem inicial, Open Graph, JSON-LD, CDN, cupom e URL final em contextos limpos. Nenhuma compra foi realizada. Os packshots do quiz sao os arquivos locais aprovados, em WebP, e nao as miniaturas ampliadas do checkout.

## Tracking tipado

Catalogo implementado:

- abertura, inicio, nome informado ou omitido;
- visualizacao de etapa, selecao e alteracao de resposta, voltar;
- insights, prova, conclusao, perfil e recomendacao;
- tease, desbloqueio e reveal da recompensa;
- roleta apenas quando houver multiplos beneficios reais;
- cupom, timer, marcos de cinco e um minuto e expiracao;
- troca de oferta, checkout, retorno e reinicio.

Eventos de montagem usam chaves de deduplicacao por sessao e etapa. O payload nao possui campo de nome; envia somente `nameProvided`. UTM aceita apenas identificadores tecnicos sanitizados e os adapters externos so recebem eventos apos consentimento explicito.

## Evidencias

- `artifacts/quiz-v6/visual-audit.json`: medidas e falhas por viewport;
- `artifacts/quiz-v6/validation.json`: distribuicao, fronteiras e exemplos;
- `artifacts/quiz-v6/screenshots`: cada etapa, perfis, kits e viewports;
- `artifacts/quiz-v6/videos`: mobile, desktop, motion, resultado, recompensa e checkout;
- `artifacts/quiz-v6/timer-recording-status.json`: gate do cronometro;
- `artifacts/quiz-v4/checkout-audit.json`: resposta detalhada dos tres checkouts.

## Limitacoes que bloqueiam campanha promocional

- nao existe cupom aprovado e validado nos checkouts;
- nao existe prazo promocional aprovado nem relogio de servidor;
- parcelamento nao apareceu no estado inicial dos checkouts;
- por consequencia, nao ha gravacao de cronometro ou cupom ativo nesta entrega.

Essas ausencias nao quebram o funil padrao: a recomendacao, os tres precos auditados e os checkouts continuam disponiveis. Elas impedem deliberadamente a exibicao de urgencia ou beneficio comercial nao comprovado.

## Recaptura final

Executado `npm run capture:quiz` depois do ultimo `npm run build`. O timeout de `openState` foi ampliado de 15 para 30 segundos, e a preparacao de storage passou a usar um documento estatico do mesmo origin antes de abrir cada estado do quiz, evitando regravacao por uma instancia React anterior.

Resultado final em `artifacts/quiz-v6/visual-audit.json`, capturado em `2026-07-17T17:55:23.711Z`: 61 screenshots, seis videos, 20/20 jornadas sem falha, 52 estados visuais, 7 viewports, zero overflow, zero controles abaixo de 44 px, zero imagens quebradas, zero falhas de `object-fit: contain` na prova, zero frascos SVG, zero erros de console, zero page errors e zero request failures.

## Gates antes de producao

1. validar campanha promocional real, caso exista;
2. repetir a auditoria dos checkouts no momento da publicacao;
3. executar Lighthouse no host final;
4. revisar consentimento e destino de analytics;
5. comparar o deploy de preview com o build aprovado;
6. obter autorizacao explicita para publicar em producao.
