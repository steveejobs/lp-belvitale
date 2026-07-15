# Mapa de assets da campanha Belvitale / CeluClin

Atualizado em 14/07/2026. Este mapa distingue uso na direção interna, publicação no build bloqueado e arquivos deliberadamente não usados. Nenhuma prova foi gerada ou retocada por IA nesta reconstrução.

## Regras de entrega

- `owner-authorized`: pode entrar no build atual no escopo declarado pelo proprietário.
- `approved-label`: pode entrar apenas na experiência de leitura do rótulo.
- `internal-review`: aparece somente em desenvolvimento ou com `VITE_INTERNAL_MEDIA=true`; o build normal remove fisicamente `product/`, `lifestyle/` e `brand/`.
- A flag de preview nunca altera o status factual de um asset.
- O rótulo plano não aparece no hero, fórmula, oferta, prova, rotina ou encerramento.

## Assets usados

| Derivado | Fonte preservada | Status | Função |
| --- | --- | --- | --- |
| `public/product/celuclin-front-02.webp` | `publicproductceluclin-front (2).png` | `internal-review` | protagonista do hero; composição de frascos nas ofertas internas; próximo passo visual do quiz |
| `public/product/celuclin-front-02-640.avif` | derivado responsivo de `celuclin-front-02.webp` | `internal-review` | fonte crítica do hero mobile, 640 px e 11.229 B; sem recorte ou retoque |
| `public/product/celuclin-front-02-640.webp` | derivado responsivo de `celuclin-front-02.webp` | `internal-review` | fallback WebP do hero mobile, 640 px e 16.220 B; sem recorte ou retoque |
| `public/product/celuclin-front-01.webp` | `publicproductceluclin-front (1).png` | `internal-review` | primeira cena aproximada da revelação de produto |
| `public/product/celuclin-angle.webp` | `publicproductceluclin-angle.webp.png` | `internal-review` | segunda cena e mudança real de ângulo do produto |
| `public/product/celuclin-hand.webp` | `publicproductceluclin-hand.webp.png` | `internal-review` | terceira cena do produto e sobreposição de proximidade na rotina |
| `public/product/celuclin-capsules.webp` | `publicproductcapsules.webp.png` | `internal-review` | imagem mineral da fórmula e arte do início do quiz |
| `public/lifestyle/freedom-01.webp` | `publiclifestylefreedom-01.webp.png` | `internal-review` | identificação emocional full bleed e fechamento da campanha |
| `public/lifestyle/routine-01.webp` | `publiclifestyleroutine-01.webp.png` | `internal-review` | cena lenta de água e integração com a rotina |
| `public/proof/cellulite/cellulite-01.webp` | `prova 5.png` | `owner-authorized` | capítulo Celulite, registro 1 de 4 |
| `public/proof/cellulite/cellulite-02.webp` | `prova 3.png` | `owner-authorized` | capítulo Celulite, registro 2 de 4 |
| `public/proof/cellulite/cellulite-03.webp` | `prova 1(1).png` | `owner-authorized` | capítulo Celulite, registro 3 de 4 |
| `public/proof/cellulite/cellulite-04.webp` | `prova 2.png` | `owner-authorized` | capítulo Celulite, registro 4 de 4 |
| `public/proof/laxity/laxity-01.webp` | `prova 1 flacidez.png` | `owner-authorized` | capítulo Flacidez, registro 1 de 2 |
| `public/proof/laxity/laxity-02.webp` | `prova 2 flacidez.png` | `owner-authorized` | capítulo Flacidez, registro 2 de 2 |
| `public/proof/localized-fat/localized-fat-01.webp` | `prova gordura localizada  (1).png` | `owner-authorized` | capítulo Gordura localizada, registro 1 de 3 |
| `public/proof/localized-fat/localized-fat-02.webp` | `prova gordura localizada  (2).png` | `owner-authorized` | capítulo Gordura localizada, registro 2 de 3 |
| `public/proof/localized-fat/localized-fat-03.webp` | `prova gordura localizada  (3).png` | `owner-authorized` | capítulo Gordura localizada, registro 3 de 3 |
| `public/label/celuclin-label-front.webp` | página 1 de `154x73 - Celuclin Rotulo.pdf` | `approved-label` | somente `#rotulo` e seu modal de ampliação |
| `public/label/celuclin-label-complete.pdf` | `154x73 - Celuclin Rotulo.pdf` | `approved-label` | download e leitura integral das duas páginas |

Todos os nove registros de prova usam `object-fit: contain`, dimensões reservadas e legendas sem “antes/depois”. O código não deduz qual lado veio primeiro.

## Assets não usados e motivo

| Asset | Status | Motivo |
| --- | --- | --- |
| `public/lifestyle/celuclin-hero.webp` | `internal-review` | repete o frasco em cenário decorativo, traz o mesmo texto divergente e não acrescenta uma função que as vistas frontal/ângulo já não cumpram |
| `public/brand/belvitale-monogram-dark.webp` | `brand-review` | autoria/direito não documentados; monograma não é necessário à navegação |
| `public/brand/belvitale-monogram-light.webp` | `brand-review` | mesma pendência; evitar duplicar marca como ornamento |
| `public/brand/belvitale-monogram-square.webp` | `brand-review` | mesma pendência; não há superfície que justifique o bloco quadrado |
| `public/brand/belvitale-wordmark-dark.webp` | `brand-review` | header usa wordmark tipográfico leve e acessível enquanto o arquivo não é aprovado |
| `public/brand/belvitale-wordmark-light.webp` | `brand-review` | mesma pendência; rodapé preserva texto real em vez de raster não confirmado |
| miniaturas dos kits na Yampi | bloqueado | 290 px, direitos/resolução não confirmados e nenhuma cópia local adequada; nunca são ampliadas |
| antigo `public/label/celuclin-label-front-hero.webp` | removido | derivado morto que usava a arte plana como substituto de frasco e violava o papel exclusivo do rótulo |

## Divergência que mantém o gate de produto

As imagens disponíveis de frasco exibem texto miúdo incompatível com o rótulo oficial — inclusive “CAM CAFEÍNA” e trechos sem coerência factual. Elas demonstram escala, luz e composição apenas no preview interno. O release normal mostra um gate visual honesto e não envia esses arquivos ao `dist`. A correção necessária é um packshot oficial em alta resolução com o rótulo correto; não é aceitável redesenhar ou “consertar” o frasco com IA.
