# Laboratório pareado — after

Simulação heurística, não pesquisa. 1.000 personas únicas × duas condições = 2.000 exposições modeladas. Modelo e pesos fixos em scripts/funnel-paired-lab.mjs. Nenhuma taxa de compra ou vencedor é estimado. Mounjaro B inexistente no baseline é um placeholder não comparável.

| Experiência | Existe | Clareza | Identificação | Confiança | Fadiga ↓ | Intenção heurística |
|---|---|---|---|---|---|---|
| MOUNJARO_A | true | 77 | 70 | 62.3 | 29.4 | 48.8 |
| MOUNJARO_B | true | 77 | 70 | 62.3 | 29.4 | 48.8 |
| NORMAL_A | true | 77 | 70 | 62.2 | 25.2 | 47.6 |
| NORMAL_B | true | 77 | 70 | 62.2 | 25.2 | 47.6 |

Os scores refletem pesos declarados, não validam esses pesos. As 24 dimensões, segmentos, perguntas, objeções e deltas estão no JSON. Diferenças de CTA só recebem peso no início: não presumimos impacto causal em compra. Mesma população: 9bb716ac13e67a8a4df82ace9f9c7d4e4cc6a182108f86179a217fbdb24f7be9.
