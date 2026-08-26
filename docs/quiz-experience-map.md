# Mapa de experiência — Quiz CeluClin 7.0

Atualizado em 26/08/2026 a partir de `QUIZ BELVITALE CELUCLIN.pdf`.

## Princípios

- O quiz funciona como uma conversa, não como um formulário que tenta diagnosticar a visitante.
- A abertura reduz esforço e apresenta a duração real: aproximadamente dois minutos e 12 perguntas.
- O nome é opcional, sanitizado e nunca é enviado cru para analytics.
- Os insights só aparecem depois que existe contexto suficiente; eles organizam respostas já fornecidas.
- A jornada não usa IA, promessa milagrosa, culpa, urgência fabricada ou recompensa comercial fictícia.
- A oferta surge como continuidade do resultado e mantém comparação transparente entre 30, 90 e 210 dias.
- A solução não é apresentada na abertura: a primeira imagem cria identificação humana; o produto só entra depois que o resultado foi construído.
- Prova social usa somente registros visuais autorizados, sem autoria, cronologia ou depoimento textual inventado.

## Jornada

| # | Etapa | Tipo | Função |
| ---: | --- | --- | --- |
| 1 | opening | abertura | reduzir resistência e convidar para a conversa |
| 2 | name | nome opcional | personalizar sem transformar em cadastro |
| 3–5 | perception / first-thought / situation-weight | identificação | reconhecer quando a insegurança aparece |
| 6 | insight-one | primeira leitura | organizar o padrão observado, sem diagnóstico |
| 7–10 | reaction / avoidance / deepest-impact / restart-trigger | rotina | mostrar como o incômodo interfere nas escolhas |
| 11 | insight-two | segunda leitura | reduzir culpa e deslocar o foco para a construção da rotina |
| 12–14 | history / dropoff / decision-weight | histórico | relembrar tentativas e fricções reais |
| 15–16 | future-scene / future-goal | futuro | ativar uma imagem emocional de mudança possível |
| 17 | insight-three | síntese | explicar que a dificuldade pode estar na forma de recomeçar |
| 18 | result | resultado | devolver exatamente o padrão construído e apresentar três registros visuais autorizados, fora do cálculo |
| 19 | offer | oferta | apresentar a sugestão de continuidade sem interromper a conversa |

## Decisão comercial

A consultoria não fornece perguntas suficientes para inferir estoque, preço ou eficácia. Por isso, a
sugestão editorial é sempre o plano de 90 dias: três frascos organizam uma continuidade moderada.
Os planos de 30 e 210 dias continuam visíveis para comparação, mas nenhuma preocupação estética
altera quantidade, duração ou preço.

## Performance e acessibilidade

- A primeira tela carrega uma única imagem lifestyle responsiva de 48 kB no viewport mais comum.
- Resultado e oferta são carregados com `lazy` chunks; os três registros do resultado usam carregamento tardio e não bloqueiam a abertura.
- Galeria independente, roda e recompensa foram removidas do caminho principal.
- Navegação usa apenas `transform` e `opacity`, com `prefers-reduced-motion` respeitado.
- Botões e links visíveis mantêm alvo mínimo de 44 px.
- O título de cada etapa recebe foco para orientar teclado e leitor de tela.
