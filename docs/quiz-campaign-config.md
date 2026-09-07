# Campanha e preços — Quiz CeluClin 7.0

## Estado da campanha

Fonte unica: `src/features/quiz/campaign/campaign.config.ts`.

| Campo | Valor auditado |
| --- | --- |
| campaignId | celuclin-quiz-v7-checkout-snapshot |
| versao | 2026-07-17.1 |
| status | draft |
| snapshot dos checkouts | 07/09/2026 16:48:49 UTC |
| cupom validado | nao |
| parcelamento validado | nao apareceu no estado inicial |

A campanha permanece em rascunho. A interface mostra apenas os precos que estavam presentes nos tres checkouts oficiais no momento da auditoria. Como nenhum codigo de cupom e nenhum prazo promocional foram aprovados, `rewards` permanece vazio e a interface nao cria desconto adicional, cupom ou cronometro.

## Ofertas auditadas

| Oferta | Quantidade | Dias aproximados | Preco atual | Custo por frasco | Checkout oficial | Publicação no quiz |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| 30 dias | 1 | 30 | R$ 89,90 | R$ 89,90 | PWJOI4I112 | ativa |
| 90 dias | 3 | 90 | R$ 169,90 | R$ 56,63 | 1E8NNCGJW9 | ativa |
| 210 dias | 7 | 210 | R$ 597,00 | R$ 85,29 | 41CHX4MGPX | suspensa por incoerência de valor |

Os calculos ficam em `pricing/pricing.calculate.ts`, usam centavos inteiros e sao testados fora da camada visual. URLs ficam em `checkout/checkout.urls.ts`. Preços comparativos e percentuais de economia não são publicados porque não apareceram na reauditoria.

## Recompensa ativa nesta versão

Não existe recompensa visível nesta versão. A consultoria pede uma transição direta entre resultado e oferta; remover o reveal reduz atrito e evita custo de interface sem benefício comercial validado.

O motor comercial independente ja esta preparado para uma campanha futura e persiste:

- rewardId;
- campaignId;
- couponCode;
- issuedAt;
- expiresAt;
- sessionId;
- eligibleOfferIds;
- promotionVersion.

A emissao e deterministica e ocorre uma unica vez por sessao. A animacao apenas representa o resultado previamente emitido. Nao ha `Math.random()` na decisao comercial.

## Condicoes para ativar cupom e cronometro

Antes de mudar o status da campanha para active:

1. aprovar juridica e comercialmente o beneficio;
2. validar o codigo em cada checkout elegivel;
3. definir inicio e termino absolutos no servidor;
4. confirmar preco final e arredondamento;
5. executar novamente as jornadas, a auditoria dos checkouts e o timer entre abas;
6. publicar somente depois do gate de preview.

Sem essas condicoes, o reward engine retorna `null` e o CTA de cupom nao e montado.
