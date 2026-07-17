# Modelo de pontuação — Quiz CeluClin 6.0

## Sistemas independentes

### A. Perfil narrativo

Usa somente:

- viés de ação;
- necessidade de clareza;
- capacidade de retomada;
- preferência por estrutura;
- necessidade de prova.

As perguntas comerciais não participam do perfil. O vetor normalizado é comparado por distância aos centros dos quatro perfis:

- clear-first;
- return-ready;
- proof-led;
- continuity-minded.

Empates usam ordem determinística e nunca alteram preço.

### B. Preocupação visual

Valores:

- cellulite;
- firmness;
- contour;
- balanced.

Personaliza copy, categoria e ordem das nove provas. Não entra em perfil, duração, quantidade, preço ou eficácia.

### C. Recomendação comercial

Usa somente readiness e continuity.

Regras:

- 30 dias quando a pessoa declara que quer conhecer primeiro e não pede estoque longo, ou quando ainda compara e quer um passo inicial;
- 210 dias somente com preferência compatível por estoque prolongado/poucas reposições;
- 90 dias nos demais casos de continuidade moderada, menos reposições e intenção clara.

## Simulação

Relatório executável: artifacts/quiz-v6/validation.json.

| Resultado | Combinações | Distribuição |
| --- | ---: | ---: |
| 30 dias | 16.384 | 25,00% |
| 90 dias | 36.864 | 56,25% |
| 210 dias | 12.288 | 18,75% |

Foram simuladas 65.536 combinações válidas:

- 0 combinações inválidas;
- 0 mudanças de kit por resposta não comercial;
- 0 mudanças de kit por preocupação visual;
- todos os perfis cobertos;
- todos os kits cobertos;
- maior domínio de kit: 56,25%, abaixo do gate de 70%.

Distribuição de perfis:

| Perfil | Participação |
| --- | ---: |
| clear-first | 25,20% |
| return-ready | 37,79% |
| proof-led | 17,29% |
| continuity-minded | 19,73% |

## Casos de fronteira

A matriz completa de 4 × 4 entre prontidão e continuidade está em artifacts/quiz-v6/validation.md.

- Mudar apenas preocupação visual nunca altera oferta.
- Mudar apenas prova preferida nunca altera oferta.
- Uma mudança entre “conhecer primeiro” e “organizar alguns meses” pode alterar 30 → 90 dias porque é comercialmente relevante.
- Uma mudança para estoque longo não produz 210 dias sem uma declaração compatível de prontidão.
- A justificativa exibida usa exatamente os dois inputs comerciais armazenados.
