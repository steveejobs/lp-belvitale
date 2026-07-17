# Matriz de pontuação do quiz Belvitale v3

Pesos brutos por resposta. A normalização de 0 a 100 considera os mínimos e máximos possíveis no caminho efetivamente percorrido.

| Pergunta | Tipo | Formato | Resposta | startEase | recovery | simplicity | consistency | planning | replenishmentRelief | autonomy | commitmentComfort |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| first-move | comum | scenes | start-tiny-now | +2 | 0 | +2 | 0 | -2 | 0 | +1 | -2 |
| first-move | comum | scenes | choose-a-place | +1 | 0 | +1 | +2 | +1 | 0 | 0 | +1 |
| first-move | comum | scenes | understand-first | -1 | 0 | +1 | 0 | +1 | 0 | +2 | -1 |
| first-move | comum | scenes | prepare-the-way | -1 | 0 | 0 | +1 | +2 | +1 | 0 | +2 |
| planning-dose | comum | tactile | next-gesture | 0 | 0 | +2 | 0 | -2 | 0 | +1 | -2 |
| planning-dose | comum | tactile | few-days | 0 | 0 | +1 | +1 | +0.5 | 0 | +1 | -0.5 |
| planning-dose | comum | tactile | week-shaped | 0 | 0 | -1 | +1 | +2 | 0 | 0 | +1 |
| planning-dose | comum | tactile | future-decided | 0 | 0 | 0 | +1 | +2 | +2 | 0 | +2 |
| missed-day | comum | contrast | resume-usual | 0 | +2 | +1 | +2 | 0 | 0 | 0 | +1 |
| missed-day | comum | contrast | make-smaller | 0 | +2 | +2 | +1 | 0 | 0 | 0 | -1 |
| missed-day | comum | contrast | change-time | 0 | +1 | 0 | +1 | -1 | 0 | +2 | 0 |
| missed-day | comum | contrast | reshape-days | -1 | -0.5 | 0 | +1 | +2 | 0 | 0 | +1 |
| choice-lightness | comum | sentence | see-essential | 0 | 0 | +2 | 0 | -1 | 0 | +2 | -1 |
| choice-lightness | comum | sentence | picture-routine | 0 | 0 | +1 | +2 | +1 | 0 | +1 | 0 |
| choice-lightness | comum | sentence | information-at-hand | 0 | 0 | -1 | 0 | +2 | 0 | +2 | +1 |
| choice-lightness | comum | sentence | repeat-fewer-decisions | 0 | 0 | +1 | 0 | +1 | +2 | 0 | +2 |
| what-stays | comum | priority | small-commitment | +2 | 0 | +2 | 0 | -2 | -1 | 0 | -2 |
| what-stays | comum | priority | survives-change | 0 | +2 | 0 | +1 | 0 | 0 | +1 | +0.5 |
| what-stays | comum | priority | has-clear-place | +1 | 0 | 0 | +2 | +1 | 0 | 0 | +1 |
| what-stays | comum | priority | months-decided | 0 | 0 | 0 | +1 | +2 | +2 | 0 | +2 |
| adaptive-return | adaptativa | path | return-next-gesture | 0 | +2 | +1 | +1 | +1 | 0 | 0 | 0 |
| adaptive-return | adaptativa | path | return-other-time | 0 | +2 | 0 | +0.5 | -1 | 0 | +2 | 0 |
| adaptive-return | adaptativa | path | return-visible | +1 | +1 | +1 | +2 | 0 | 0 | 0 | 0 |
| adaptive-return | adaptativa | path | return-replan | -1 | +1 | 0 | 0 | +2 | 0 | 0 | +1 |
| adaptive-supply | adaptativa | path | supply-near-end | 0 | 0 | 0 | 0 | -1 | -2 | +2 | -2 |
| adaptive-supply | adaptativa | path | supply-next-buy | 0 | 0 | 0 | +1 | +1 | +0.5 | 0 | +0.5 |
| adaptive-supply | adaptativa | path | supply-anticipate | 0 | 0 | 0 | +1 | +2 | +2 | 0 | +1 |
| adaptive-supply | adaptativa | path | supply-concentrate | 0 | 0 | +1 | 0 | +2 | +2 | +1 | +2 |
| adaptive-simple | adaptativa | path | simple-one-line | +1 | 0 | +2 | 0 | -1 | 0 | +1 | 0 |
| adaptive-simple | adaptativa | path | simple-essential-free | 0 | 0 | +2 | 0 | -1 | 0 | +2 | -1 |
| adaptive-simple | adaptativa | path | simple-existing-habit | +1 | +1 | +1 | +2 | 0 | 0 | 0 | 0 |
| adaptive-simple | adaptativa | path | simple-next-visible | 0 | 0 | +0.5 | +1 | +2 | 0 | +1 | 0 |
| adaptive-real-life | adaptativa | path | real-before-perfect | +2 | +1 | +1 | 0 | -1 | 0 | 0 | 0 |
| adaptive-real-life | adaptativa | path | real-visible-place | +1 | 0 | +1 | +2 | +1 | 0 | 0 | 0 |
| adaptive-real-life | adaptativa | path | real-adapt | 0 | +2 | 0 | +1 | -1 | 0 | +2 | 0 |
| adaptive-real-life | adaptativa | path | real-decide-around | 0 | 0 | 0 | 0 | +2 | +1 | +1 | +1 |

Nenhuma resposta isolada escolhe um perfil ou uma duração. O perfil usa proximidade entre o vetor normalizado e os centros; a duração usa um cálculo independente de conveniência.
