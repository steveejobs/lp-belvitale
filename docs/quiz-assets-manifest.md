# Manifesto de assets — Quiz CeluClin 7.0

Inspeção visual concluída em 17/07/2026. Os arquivos abaixo foram abertos pelo conteúdo, não classificados apenas pelo nome.

## Produto e marca

| Arquivo | Classe | Dimensão/uso | Status |
| --- | --- | --- | --- |
| /product/celuclin-front-01.webp | frasco frontal | reserva | aprovado |
| /product/celuclin-front-02.webp | frasco frontal alternativo | reserva | aprovado |
| /product/celuclin-angle.webp | frasco em ângulo | antecipação | aprovado |
| /product/celuclin-hand.webp | produto na mão | transição do resultado para a oferta | aprovado |
| /product/celuclin-capsules.webp | cápsulas | apoio editorial | aprovado, não preload |
| /offers/celuclin-one.webp | kit 1 frasco | oferta 30 dias | aprovado |
| /offers/celuclin-three.webp | kit 3 frascos | oferta 90 dias | aprovado |
| /offers/celuclin-seven.webp | kit 7 frascos | oferta 210 dias | aprovado |
| /brand/belvitale-wordmark-dark.webp | logo escuro | reserva | aprovado |
| /brand/belvitale-wordmark-light.webp | logo claro | reserva | aprovado |
| /brand/belvitale-monogram-light.webp | monograma | reserva | aprovado |
| /label/celuclin-label-front.webp | rótulo completo | fonte factual | aprovado |
| /label/celuclin-label-complete.pdf | rótulo em PDF | fonte factual | aprovado |

Nenhum frasco SVG, frasco desenhado em CSS ou mockup sintético é renderizado no quiz.

## Lifestyle

| Arquivo | Classe | Uso | Status |
| --- | --- | --- | --- |
| /lifestyle/celuclin-hero.webp | lifestyle com produto | reserva | aprovado |
| /lifestyle/freedom-01.webp | lifestyle | abertura sem antecipar a solução | aprovado |
| /lifestyle/routine-01.webp | rotina | segundo insight | aprovado |

## Prova visual

| Arquivo | Categoria | Dimensões | Exibição |
| --- | --- | ---: | --- |
| /proof/cellulite/cellulite-01.webp | celulite | 1254 × 1254 | contain, principal |
| /proof/cellulite/cellulite-02.webp | celulite | 1448 × 1086 | contain |
| /proof/cellulite/cellulite-03.webp | celulite | 1448 × 1086 | contain |
| /proof/cellulite/cellulite-04.webp | celulite | 1448 × 1086 | contain |
| /proof/laxity/laxity-01.webp | firmeza | 1254 × 1254 | contain, principal para firmeza |
| /proof/laxity/laxity-02.webp | firmeza | 1373 × 1145 | contain |
| /proof/localized-fat/localized-fat-01.webp | contorno | 1537 × 1023 | contain, principal para contorno |
| /proof/localized-fat/localized-fat-02.webp | contorno | 1448 × 1086 | contain |
| /proof/localized-fat/localized-fat-03.webp | contorno | 1448 × 1086 | contain |

Contrato visual:

- figura com proporção estável;
- width e height em 100%, object-fit contain;
- sem alteração de pele, cor, textura, iluminação ou enquadramento relevante;
- trilho horizontal com `scroll-snap` no mobile e grade de três registros no desktop;
- categoria e identificação do registro fora da imagem;
- resultado usa três registros autorizados de celulite, com carregamento tardio e aviso de variabilidade;
- nenhuma legenda atribui cronologia, causalidade, identidade ou duração.

## Duplicados e inadequados

- Derivações -640, -768, hero-mobile e AVIF são variantes responsivas, não novas fotografias.
- Miniaturas do checkout Yampi (70–650 px) foram auditadas, mas não usadas no quiz porque os packshots locais aprovados têm melhor resolução.
- Assets de screenshots, vídeos e auditorias em artifacts são evidência de QA, não mídia pública.
- Nenhuma imagem quebrada ou de outro produto foi encontrada no gate final.
