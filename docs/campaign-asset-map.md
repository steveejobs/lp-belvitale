# Mapa de assets da campanha Belvitale / CeluClin

Atualizado em 15/07/2026. Este mapa distingue o uso autorizado na homepage, o rótulo informativo, as provas autorizadas e os arquivos comerciais bloqueados. Nenhuma prova foi gerada ou retocada por IA nesta reconstrução.

## Regras de entrega

- `owner-authorized`: pode entrar no build atual no escopo declarado pelo proprietário.
- `approved-label`: pode entrar apenas na experiência de leitura do rótulo.
- Produto, cápsulas, lifestyle e logos fornecidos foram liberados pelo proprietário para uso visual na homepage em 15/07/2026.
- A flag de preview nunca altera o status factual de um asset.
- O rótulo plano não aparece no hero, fórmula, oferta, prova, rotina ou encerramento.

## Assets usados

| Derivado | Fonte preservada | Status | Função |
| --- | --- | --- | --- |
| `public/product/celuclin-front-02.webp` | `publicproductceluclin-front (2).png` | `owner-authorized` | protagonista do hero e primeira cena integral da galeria de produto |
| `public/product/celuclin-front-02-640.avif` | derivado responsivo de `celuclin-front-02.webp` | `owner-authorized` | fonte crítica do hero mobile, 640 px e 11.229 B; sem retoque |
| `public/product/celuclin-front-02-640.webp` | derivado responsivo de `celuclin-front-02.webp` | `owner-authorized` | fallback WebP do hero mobile, 640 px e 16.220 B |
| `public/product/celuclin-front-01.webp` | `publicproductceluclin-front (1).png` | `owner-authorized` | close do frasco na segunda cena da galeria |
| `public/product/celuclin-angle.webp` | `publicproductceluclin-angle.webp.png` | `owner-authorized` | vista em ângulo da galeria de produto |
| `public/product/celuclin-hand.webp` | `publicproductceluclin-hand.webp.png` | `owner-authorized` | escala real na galeria e composição da rotina |
| `public/product/celuclin-capsules.webp` | `publicproductcapsules.webp.png` | `owner-authorized` | galeria de produto e mídia da composição |
| `public/lifestyle/celuclin-hero.webp` | `publiclifestylehero.webp.png` | `owner-authorized` | última cena da galeria de produto |
| `public/lifestyle/freedom-01.webp` | `publiclifestylefreedom-01.webp.png` | `owner-authorized` | composição de liberdade e fechamento da campanha |
| `public/lifestyle/routine-01.webp` | `publiclifestyleroutine-01.webp.png` | `owner-authorized` | cena de água e integração com a rotina |
| `public/brand/belvitale-wordmark-dark.webp` | `belvitale sem fundo preto.png` | `owner-authorized` | wordmark oficial no header |
| `public/brand/belvitale-wordmark-light.webp` | `belvitale sem fundo branco.png` | `owner-authorized` | wordmark oficial no rodapé |
| `public/brand/belvitale-monogram-light.webp` | `logo sem fundo branca.png` | `owner-authorized` | assinatura discreta na cena escura do rótulo |
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
| `public/brand/belvitale-monogram-dark.webp` | `owner-authorized` | disponível, mas não acrescenta função ao wordmark escuro do header |
| `public/brand/belvitale-monogram-square.webp` | `owner-authorized` | disponível, mas o bloco quadrado não se encaixa nas superfícies atuais |
| miniaturas dos kits na Yampi | bloqueado | 290 px, direitos/resolução não confirmados e nenhuma cópia local adequada; nunca são ampliadas |
| antigo `public/label/celuclin-label-front-hero.webp` | removido | derivado morto que usava a arte plana como substituto de frasco e violava o papel exclusivo do rótulo |

## Limite factual do packshot

As imagens de frasco estão autorizadas como mídia visual da homepage, mas seu texto miúdo não é fonte para composição, advertências ou modo de uso. A interface consulta os dados tipados confirmados e apresenta a arte plana aprovada somente em `#rotulo`; nenhum packshot foi redesenhado ou “corrigido” por IA.
