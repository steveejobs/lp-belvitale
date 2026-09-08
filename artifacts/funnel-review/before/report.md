# Laboratório pareado — before

Simulação heurística, não pesquisa. 1.000 personas únicas × duas condições = 2.000 exposições modeladas. Modelo e pesos fixos em scripts/funnel-paired-lab.mjs. Nenhuma taxa de compra ou vencedor é estimado. Mounjaro B inexistente no baseline é um placeholder não comparável.

| Experiência | Existe | Clareza | Identificação | Confiança | Fadiga ↓ | Intenção heurística |
|---|---|---|---|---|---|---|
| MOUNJARO_A | true | 64 | 61.4 | 41.3 | 29.4 | 39.7 |
| MOUNJARO_B | false | 64 | 61.4 | 41.3 | 29.4 | 39.7 |
| NORMAL_A | true | 64 | 61 | 29.2 | 32.2 | 29.4 |
| NORMAL_B | true | 64 | 61 | 29.2 | 32.2 | 29.4 |

Os scores refletem pesos declarados, não validam esses pesos. As 24 dimensões, segmentos, perguntas, objeções e deltas estão no JSON. Diferenças de CTA só recebem peso no início: não presumimos impacto causal em compra. Mesma população: 9bb716ac13e67a8a4df82ace9f9c7d4e4cc6a182108f86179a217fbdb24f7be9.
