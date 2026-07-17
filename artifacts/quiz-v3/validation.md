# Validação do quiz Belvitale v3

Gerado em 2026-07-17T00:10:01.752Z.

## Cobertura

- Combinações completas: **4096**
- Caminhos inválidos: **0**
- Maior participação de um perfil: **38.48%**
- Mínimo de perfis possíveis por resposta isolada: **3**
- Mínimo de kits possíveis por resposta isolada: **2**

## Perfis

| Perfil | Combinações | Participação |
| --- | ---: | ---: |
| everything-at-hand | 711 | 17.36% |
| fits-now | 986 | 24.07% |
| marked-place | 1576 | 38.48% |
| return-counts | 823 | 20.09% |

## Recomendações

| Duração | Combinações | Participação |
| --- | ---: | ---: |
| 210-days | 651 | 15.89% |
| 30-days | 755 | 18.43% |
| 90-days | 2690 | 65.67% |

## Caminhos adaptativos

- `adaptive-return`: esclarece recovery.
- `adaptive-supply`: esclarece planning, replenishmentRelief, commitmentComfort.
- `adaptive-simple`: esclarece simplicity.
- `adaptive-real-life`: esclarece startEase, consistency, autonomy.

| Ramo | Combinações | Participação |
| --- | ---: | ---: |
| adaptive-real-life | 448 | 10.94% |
| adaptive-return | 1216 | 29.69% |
| adaptive-simple | 448 | 10.94% |
| adaptive-supply | 1984 | 48.44% |

## Método

Cada resposta altera pelo menos duas das oito dimensões. As dimensões são normalizadas de 0 a 100 a partir dos mínimos e máximos possíveis no caminho efetivamente percorrido. O perfil usa distância euclidiana ponderada aos quatro centros, com Manhattan ponderada e maior diferença como critérios matemáticos secundários. A confiança usa a separação entre as duas menores distâncias e nunca é exibida como porcentagem.

A recomendação de duração é calculada separadamente a partir de compromisso inicial, constância, planejamento, desejo de reduzir reposições e conveniência. Nenhuma resposta isolada determina perfil ou duração.
