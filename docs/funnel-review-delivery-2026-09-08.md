# Revisão Belvitale — decisões e limites

Revisão local `2026-09-review-1`. Não é publicação, comprovação clínica ou validação comercial. Leia junto da [auditoria anterior](./funnel-architecture-audit-2026-09-08.md) e do [registro de evidências](./funnel-evidence-register.md).

## Arquitetura entregue

```text
NORMAL — /quiz
├── A: Começar agora
└── B: Descobrir meu caminho
    12 perguntas → 3 insights → /quiz/resultado → comparação → Yampi
    Experimento preservado: opening-cta-v1

MOUNJARO / PÓS-EMAGRECIMENTO — /quiz-monj
├── A: Começar minha análise
└── B: Entender meu próximo cuidado
    14 perguntas → 3 insights → /quiz-monj/resultado → /#composicao → Yampi
    Experimento NOVO: monj-opening-cta-v1
```

Não existia Mounjaro B no código recebido. Isso foi documentado antes de alterar. O novo teste não é uma variante histórica recuperada: é uma hipótese restrita de CTA. A/B de cada público compartilha a mesma revisão de perguntas, narrativa, imagens e resultado; somente o convite inicial difere. Não se pode atribuir uma eventual diferença ao conjunto de mudanças visuais. Observações antigas do Normal permanecem armazenadas; o painel passa a ler uma chave da nova revisão.

Compartilhados: acabamento visual, fontes, educação sobre formulação (`ProductDecision`), atribuição técnica, resolver de sorteio e contrato de eventos. Exclusivos: entrada, perguntas, estado, cálculo, insights e narrativa do resultado de cada público. A homepage ganhou escolha explícita entre os públicos; não foi inteiramente redesenhada.

## A–E. Problema, mudança, motivo, público e princípio

| Problema anterior | Alteração | Público | Razão / princípio |
|---|---|---|---|
| Retângulo vazio abaixo da foto dominante | Duas imagens com proporções naturais e alinhamento inferior, sem span de duas linhas | Normal | Composição determinada pelo conteúdo da foto; eliminar área sem função |
| Frasco pequeno e proporções declaradas incorretas | Fotografia 4:5 dominante, variante WebP 768 px, largura útil no mobile | Ambos | Reconhecimento do produto e percepção concreta do que se compra |
| Bloco atrás da marca no scroll | Wordmark tipográfico sem bitmap opaco, header sólido, sem blur/pseudo-elementos; precedência CSS explícita | Ambos | Composição estável entre browser, scroll e build |
| Três insights com a mesma aparência e contadores | Contadores removidos; reconhecimento editorial, distinção visual e critérios de decisão; respostas em details | Normal | Ritmo e informação progressiva sem esconder navegação |
| Leituras semelhantes que presumiam disciplina ou constância | Copy condicionada a cena, histórico frustrado, incômodo baixo, orçamento e objetivo | Normal | Personalização rastreável, sem diagnóstico inventado nem culpabilização |
| Conteúdo pós-emagrecimento que só aceitava uso de tirzepatida | Opção de outra estratégia; narrativa da conquista e cuidado seguinte; formatos específicos dos insights | Mounjaro | A resposta deve poder ser verdadeira para o público anunciado |
| Região corporal citada sem destaque | Observação do resultado menciona a área relatada | Mounjaro | Continuidade entre resposta e interpretação; não inventa exame |
| Ciência distante da decisão e possível confusão entre ingrediente e produto | Formulação legível, rótulo completo, função nutricional da vitamina C e limite da evidência lado a lado | Ambos | Transparência, compreensão e expectativa realista |
| 90 dias apresentados como solução para abandonar cuidados | Quantidade, duração da embalagem, custo total e compromisso inicial | Normal | Autonomia; duração do frasco não é prazo clínico |
| Forçar query/remover query podia trocar variante | Locks independentes, fallback sem storage, query preservada, histórico de etapas | Ambos | Integridade experimental e continuidade da sessão |
| Origem desaparecia ao ir para a home | Contexto de funil, variante, sessão, revisão e UTMs nos links internos e checkout | Ambos | Diagnóstico do funil inteiro, dentro do alcance do frontend |
| Painel local podia sugerir vencedora com demonstração | Conclusão descritiva; aviso explícito de dados fictícios | Normal / operação | Não confundir cliques locais, simulação e compra real |

## F. Hipóteses para tráfego real

1. **Normal A/B atual:** convite de descoberta versus convite direto. Primária futura: compra aprovada por sessão atribuída; acompanhar início, conclusão, ida ao checkout e devoluções como diagnóstico/guardrails. Não declarar vencedor só por início.
2. **Mounjaro A/B novo:** mencionar o próximo cuidado no CTA aumenta início qualificado? Mesmo conteúdo entre A e B. Não comparar contra Normal.
3. **Próximo experimento, separado:** posição da explicação da fórmula em relação à prova visual. Pode aumentar confiança de céticas e aumentar fadiga de visitantes já decididas. Não acrescentar ao teste de CTA simultaneamente.
4. **Próximo experimento, separado:** acesso antecipado à comparação de preços no resultado. Avaliar se reduz abandono de sensíveis a preço sem prejudicar compreensão dos limites.

Planejar amostra, janela e regra de parada antes de rodar; instrumentar compras e estornos. Não há cálculo de tamanho amostral confiável sem baseline de conversão e efeito mínimo relevante. Esta revisão ampla não possui um controle simultâneo antigo: comparação temporal simples terá fatores de confusão.

## G. Dependências reais e atribuição

- `NORMAL_A`, `NORMAL_B`, `MOUNJARO_A`, `MOUNJARO_B` passam a identificar o frontend. Distribuição inicial 50/50 por funil, sem adaptação comportamental. Atribuição guardada por 24 h; escolha não forçada histórica continua reaproveitada. QA forçado não entra no painel de observações reais.
- URLs internas carregam `bv_funnel`, `bv_variant`, `bv_experiment`, `bv_mode`, `bv_session`, `bv_revision`, `bv_expires` e UTMs técnicas permitidas. Checkout acrescenta `metadata[bv_*]` e `metadata[experience_id]`, preservando campos anteriores. Nome e respostas clínicas não são enviados nesses links.
- Os links até a Yampi são verificáveis localmente. **Não existe prova de que a Yampi retenha esses metadados no pedido.** É necessário pedido de teste e webhook/integrador da conta. Não implementamos nem simulamos uma compra aprovada.
- Eventos existentes não foram renomeados. Acrescentados `result_view`, `sales_page_view`, sinal `quiz_abandon` e telemetria de Mounjaro. `quiz_abandon` em pagehide também acontece em refresh: é um sinal de saída, não abandono confirmado. Resolver retornos/timeout no coletor real.
- Log de diagnóstico por sessão é local e limitado; `/quiz/analytics` continua sendo do Normal neste navegador. Não é dashboard agregado dos dois públicos. Não há backend de leads ou `purchase` verificado.
- Meta Pixel existente da homepage foi preservado. Ligação entre consentimento, eventos dos quizzes, pixel e compra requer trabalho específico; não foi ativado um novo envio remoto de respostas.
- Normal continua personalizando **perfil de decisão**, não grau/localização de celulite: as perguntas existentes não coletam isso. A recomendação continua 90 dias com 30 dias selecionável. Alterar perguntas/scoring/oferta exige outro teste, não uma alegação de personalização inexistente.

## H. Imagens

- Saíram do mosaico `quiz-desire-01/02/03.webp`: modelos/lingerie e composição que deixava vazio. Entraram assets já existentes `lifestyle/freedom-01-768.webp` e `lifestyle/routine-01.webp`, com contexto cotidiano e cortes naturais. Continuam identificados como cenas ilustrativas, não clientes.
- Produto: mesma direção fotográfica já disponível, agora `celuclin-angle-768.webp` e dimensões corretas. Não foi fabricada nova embalagem. O lettering inconsistente do mockup é uma **pendência de marca**; precisa de foto real de alta resolução. Rótulo documental permanece acessível.
- Wordmark do header deixou de ser bitmap com fundo. Não altera o nome da marca.
- `conversa-07.webp`, que contém aviso de simulação, saiu das seleções de Insights. Os demais trechos usam material fornecido pela marca, com acesso à imagem completa e ressalva individual. Isso não equivale a autenticação independente dos depoimentos. Inventário integral da homepage precisa de validação documental da marca antes de ser tratado como evidência.
- Não criamos clientes, relatos pós-Mounjaro, médicos, antes/depois ou credenciais com IA.

## I. Copy radicalmente alterada

Insights Normal deixaram de concluir automaticamente que faltava disciplina/constância e de chamar uma regra de software de “observação humana”. Cada leitura agora explicita contexto e limites. A seção de desejo responde à cena futura escolhida. A transição do produto passou a “Agora, escolha o que cabe na sua rotina”, com CTA de comparação de opções e preços. Ofertas indicam compra de frascos.

No Mounjaro, a entrada acolhe outras estratégias de emagrecimento, reconhece a conquista e não culpa o medicamento. O resultado separa aparência, função e orientação profissional. Barras heurísticas aparecem como pontos, não percentuais de risco. O contexto do SURMOUNT-1 inclui placebo, tamanho da análise e distinção entre massa magra e músculo; não é evidência de CeluClin.

## Laboratório sintético

Painel persistido em `artifacts/funnel-review/personas.json`: 1.000 IDs únicos, 500 por público, cada ID em A e B. Antes e depois usam a mesma população e pesos. Quatro scorecards, 24 índices, fricção por pergunta e recortes por segmento estão nos JSONs; exposições individuais e screenshots são gerados localmente por `scripts/funnel-paired-lab.mjs`.

**Método e limite:** este é um modelo de regras com cenários de respostas, não 1.000 consumidoras pensando nem uma pesquisa estatística. Notas refletem pressupostos do modelo; seção herda índices da jornada e não é observação independente. Não simula ordem/carryover ou retenção real na página de vendas. Renda/escolaridade/região dão cobertura, não pesos de credulidade. Só há sinais comportamentais reais quando pessoas reais navegam.

Antes não existia Mounjaro B: as 500 exposições dessa condição são placeholders explicitamente excluídos da comparação, não um baseline inventado. Após implementação existem 2.000 exposições elegíveis. Não declarar superioridade causal com a diferença antes/depois.

O delta de CTA recebe peso apenas em curiosidade e vontade inicial. Empate nos demais índices é intencional: não inventamos impacto em compra para justificar B. Céticas e sensíveis a preço continuam prioritárias para validação real; efeitos demográficos não podem ser descobertos por pesos que não os modelam.

### Antes versus depois — índices heurísticos, 0 a 100

| Experiência | Clareza | Identificação | Confiança | Fadiga (menor é melhor) | Intenção modelada |
|---|---|---|---|---|---|
| Normal A | 64 → 77 | 61 → 70 | 29,2 → 62,2 | 32,2 → 25,2 | 29,4 → 47,6 |
| Normal B | 64 → 77 | 61 → 70 | 29,2 → 62,2 | 32,2 → 25,2 | 29,4 → 47,6 |
| Mounjaro A | 64 → 77 | 61,4 → 70 | 41,3 → 62,3 | 29,4 → 29,4 | 39,7 → 48,8 |
| Mounjaro B | sem baseline → 77 | sem baseline → 70 | sem baseline → 62,3 | sem baseline → 29,4 | sem baseline → 48,8 |

Não são percentuais nem ganhos de conversão. Os pesos premiam exposição da fórmula, distinção entre referência e eficácia, expectativa clara e produto maior. O resultado aponta esses elementos como hipóteses promissoras para validação, não demonstra que a cliente será convencida por eles. O modelo também não detectou o baixo contraste que apareceu numa captura intermediária: a inspeção visual foi indispensável e levou a uma correção separada.

Reprodução do estado atual: `node scripts/funnel-paired-lab.mjs after`. O baseline foi capturado antes das alterações e deve ser preservado; rodar `before` no código atual destruiria a referência histórica. JSONs de população, relatórios e snapshots textuais entram no versionamento; screenshots e exposições detalhadas permanecem nos artefatos locais.

## Uso crítico das skills

- **Seguido:** semântica HTML, foco visível, alvos de toque, reduced-motion, fontes e componentes existentes quando adequados.
- **Adaptado:** motion das seções mantém conteúdo quase todo visível e deslocamento mínimo; nada fica oculto aguardando scroll para ser lido. Prioridade para leitura e resposta em aparelhos modestos.
- **Rejeitado como receita:** grids fixos, trios repetidos e card obrigatório. Fotografia define proporção do mosaico; insights usam formato conforme o conteúdo. Sem nova biblioteca de animação ou ícones por decoração.
- **Preservado por decisão:** o A/B de CTA do Normal e a máquina de perguntas; criatividade visual não justifica trocar a variável experimental.
- **Voz da marca adaptada:** a referência `brand` ajudou a separar posicionamento, prova e contexto de cada público. Exemplos de promessa presentes na skill não foram copiados. Após a observação do proprietário, a composição passou a uma linguagem afirmativa sobre o que está documentado, sem uma conclusão genérica de ineficácia e sem acrescentar alegações clínicas ou prazos ainda não verificados.

## J. Riscos que permanecem

Ausência de estudo da fórmula final; pendência sanitária de publicação; falta de autenticação externa dos relatos; embalagem editorial não documental; compra sem confirmação integrada; personalidade física limitada do resultado Normal; preço mostrado tarde; comprimento total do resultado e possível fadiga das céticas; falta de medição real de LCP/CLS/retorno/compra em aparelhos e redes variados. Não há promessa de aumento de conversão. A qualidade editorial melhorou por razões auditáveis, mas desempenho comercial permanece uma hipótese.

## Verificação técnica

`npm run build` (preview): aprovado, incluindo TypeScript. `npm run lint`: aprovado após correção de interpolação numérica no OfferCard alterado paralelamente. `git diff --check`: aprovado. Não foi feito deploy nem liberado o gate de publicação.

Execução de regressão: 44 de 45 testes passaram. A falha era a expressão do teste de contadores encontrando a barra do CNPJ no rodapé; o teste foi limitado ao header/conteúdo do quiz. Os 24 testes novos dessa execução passaram, incluindo:

- quatro identidades, refresh, troca de query, marca e histórico do navegador;
- resultados Normal A/B e Mounjaro A/B em 375, 390, 430 e 1440 px, imagens carregadas, produto grande, ausência de overflow e header sem blur;
- sorteio 50/50, storage corrompido/indisponível e fallback;
- 14 perguntas Mounjaro → resultado → homepage → metadados no link de checkout.

Inspeção visual adicional encontrou baixo contraste nos novos Insights Mounjaro e monograma desproporcional no rodapé. Ambos corrigidos; também foi reforçada a regra reduced-motion para impedir que estilos antigos reativassem movimento. A execução complementar desses ajustes está sendo registrada separadamente. Capturas locais: `artifacts/funnel-review/validation` e `artifacts/funnel-review/after`.

O ambiente também recebe mudanças paralelas na homepage, preservadas. Este relatório não atribui a esta revisão todos os arquivos presentes no diff nem certifica a revisão completa desses arquivos. Não foram medidos LCP/CLS em rede móvel real; tamanho de bundle não substitui essa medição.

### Pendência de validação final

A execução complementar sofreu timeout no percurso Mounjaro enquanto aguardava estabilidade de clique. O mesmo percurso havia passado na execução de 44/45 testes. O diagnóstico do Windows registrou apenas 7.852 KB de memória física livre; o teste foi interrompido sem fechar aplicativos do usuário. Isso sugere forte interferência do ambiente, mas **não prova que todo timeout seja externo ao aplicativo**.

Os Insights Normal em 375 e 390 px passaram em execução complementar anterior. Falta concluir os seis casos de Insights nas três larguras após todos os ajustes e repetir o teste de progresso corrigido e o percurso Mounjaro. Não há aprovação visual final dos Insights Mounjaro após o reparo de contraste/rodapé. Rodar, com memória disponível:

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
$env:PREVIEW_PORT='4176'
npm run test:e2e -- tests/e2e/funnel-review.spec.ts tests/e2e/quiz.spec.ts --timeout=120000
```

O laboratório after foi concluído com os 1.000 perfis originais e 2.000 exposições. Suas capturas são anteriores ao último reparo de contraste/rodapé; scores são heurísticas textuais e não aprovam esse reparo. Recapturar com `node scripts/funnel-paired-lab.mjs after` após liberar recursos. Build final de preview e TypeScript passaram com os reparos presentes.
