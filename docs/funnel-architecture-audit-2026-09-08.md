# Auditoria anterior à revisão — 08/09/2026

Inspeção do código efetivamente importado, antes de qualquer alteração na aplicação. Worktree inicialmente limpo. As capturas fornecidas são do resultado do Quiz Normal.

## Divergência estrutural encontrada

O requisito descreve dois quizzes, dois testes e quatro experiências. Este checkout contém **dois quizzes, um teste implementado e três experiências efetivas**. Não há implementação de Mounjaro B nem hipótese registrada para esse teste. Não é correto apresentar uma comparação histórica Mounjaro A/B como se existisse. A confirmação sobre outra branch/rota foi solicitada durante a auditoria.

```text
MOUNJARO / pós-emagrecimento
├── A: controle único existente, sem identificador A
│   ├── entrada: /quiz-monj → quiz-monj-main.tsx → QuizMonjExperience
│   ├── abertura → nome opcional → 14 perguntas
│   ├── insights após perguntas 4, 9 e 14 → análise de 1,85 s
│   ├── resultado: /quiz-monj/resultado (mesma aplicação)
│   └── destino: /#composicao → homepage → checkout Yampi
└── B: ausente; ?ab=b não altera a experiência existente

NORMAL / celulite tradicional
├── A: /quiz?ab=a → QuizRoute → QuizExperience → QuizProvider
│   ├── CTA: Começar agora
│   ├── abertura → nome opcional → 12 perguntas
│   ├── insights após perguntas 3, 7 e 12 → análise de 1,1 s
│   ├── resultado: /quiz/resultado → ResultStage
│   └── comparação: OfferStage na mesma URL → checkout Yampi
└── B: /quiz?ab=b → mesma árvore
    └── única diferença: CTA Descobrir meu caminho
```

Os parâmetros `ab=a/b` são QA: não entram no painel local. Sem parâmetro, sorteio 50/50 e atribuição local persistente. Não existe seleção por comportamento. `questionSets.ts` contém candidatos editoriais antigos A/B/C, mas não são variantes servidas: o array importado é `content/questions.ts`.

## Entradas, compartilhamento e exclusividade

Vite gera HTML próprio para `/quiz`, `/quiz/resultado`, `/quiz/analytics`, `/quiz-monj` e `/quiz-monj/resultado`. Plugins de Vite resolvem essas entradas no desenvolvimento. `main.tsx` e `App.tsx` também possuem fallback para o Quiz Normal. Links da homepage (`SiteHeader`, `CampaignHero`, `ProductStory`, `QuizBridge`) apontam todos para `/quiz`; não há roteador psicológico automático nem link interno para Mounjaro. A origem dos anúncios não é configurada neste repositório.

Compartilhados: tokens `src/theme`, fontes Figtree/Fraunces, `quiz-base.css`, `quiz.css`, `quiz-refined.css`, `KineticText`, identidade, catálogo de produto e checkout. Mounjaro possui estado, header, perguntas, insights, cálculo e resultado próprios num componente e `quizMonjData.ts`; importa CSS comum mas não `quiz-premium-v2.css`. Normal possui provider/reducer, machine, perfis, recomendação, provas, oferta e analytics exclusivos em `src/features/quiz`.

Há código legado em `src/quiz`, `src/components/quiz` e `src/data/quizQuestions.ts`. Sua presença não significa que esteja renderizado nas entradas atuais. Não reestruturar esses arquivos como se fossem o funil ativo.

## Perguntas e diferenças

Normal, A = B (12 IDs e sequência): `perception`, `first-thought`, `situation-weight`, insight, `reaction`, `avoidance`, `deepest-impact`, `restart-trigger`, insight, `history`, `dropoff`, `decision-weight`, `future-scene`, `future-goal`, insight. Aborda situações sociais, reação, histórico, dinheiro e continuidade. Não pergunta grau de celulite, flacidez, idade nem região corporal. `getConcernFromQuizAnswers` ignora respostas e retorna `cellulite`: não há personalização física apesar dos tipos legados disponíveis.

Mounjaro (14): `treatment-stage`, `weight-change`, `loss-pace`, `first-change`, insight, `body-area`, `strength-change`, `resistance-training`, `protein-pattern`, `intake-barrier`, insight, `skin-history`, `weight-stability`, `recovery`, `professional-support`, `main-goal`, insight. Todas as respostas iniciais pressupõem uso de tirzepatida, excluindo indevidamente emagrecimento por outros meios. Nenhuma pergunta é literalmente compartilhada com Normal.

Normal A/B: headlines, imagens, linguagem, quantidade/ordem das perguntas, insights, ciência, prova social, resultado, mecanismo e oferta são idênticos. A imagem de entrada é `quiz-hero-confidence.jpg`; resultado usa `quiz-desire-01/02/03.webp`, relatos e registros de celulite, produto `celuclin-angle.webp`. Insights variam o relato escolhido e ecoam respostas, mas as conclusões são praticamente fixas.

Mounjaro: entrada `freedom-01-768.webp`, sem depoimentos nos insights, resultado educativo com quatro prioridades (`leanProtection`, `skinAdaptation`, `celluliteContrast`, `clinicalSupport`). `first-change` prioriza aparência e sinais de atenção sobrepõem a prioridade. As barras são escores heurísticos, não probabilidades médicas. `body-area` aparece nas observações mas não muda a headline. CTA de resultado é “Ver composição e avisos”.

Normal: quatro perfis de decisão (`clear-first`, `return-ready`, `proof-led`, `continuity-minded`), não diagnósticos de pele. A recomendação é **sempre 90 dias**, com motivos variáveis; 30 dias é alternativa manual. Não existe recomendação de duração clínica. 7 meses cadastrados mas não ofertados nessa comparação.

## Hipóteses reais

Normal `opening-cta-v1`: A testa convite direto à ação; B explicita benefício de descoberta. Hipótese inferida do único delta executável: “Um CTA de descoberta pode aumentar início qualificado e avanço ao checkout em relação ao convite direto”. Não há pesquisa registrada que prove essa hipótese. Atribuir diferenças a narrativa/ciência seria incorreto.

Mounjaro: não há hipótese A/B executável no baseline. Proposta limitada, pendente de confirmar ausência em outra branch: comparar o CTA atual com “Entender meu próximo cuidado”, mantendo perguntas, insights, imagens e resultado iguais entre A/B.

## Analytics, persistência e atribuição

Normal: `belvitale.quiz.v7` em localStorage contém UUID, nome opcional, respostas, stage, visited stages e expiração fixa de 24 h. `belvitale.quiz.experiment.opening-cta-v1` persiste a variante sem TTL. Forçado por query tem prioridade e não é persistido; remover a query ou clicar na marca pode trocar a variante. Indisponibilidade de storage pode provocar novos sorteios a cada render. Restart apaga query/UTM. Há sincronização de respostas entre abas e não há handler popstate coerente com stages.

Mounjaro: `belvitale.quiz-monj.v1` com nome, respostas, índice de etapa e savedAt; prazo renovado de 24 h. Sem UUID, A/B, events ou sincronização entre abas. Rota usa replaceState. CTA final sem query perde UTMs e origem.

Eventos Normal existentes: `quiz_opened`, `quiz_started`, `quiz_name_submitted/skipped`, `quiz_stage_viewed`, `quiz_answer_selected/changed`, `quiz_back_clicked`, `quiz_insight_viewed`, `quiz_completed`, `quiz_profile_revealed`, `quiz_offer_recommended/changed`, `quiz_checkout_clicked/returned`, `quiz_restarted`. Há nomes legados de provas, recompensas e timer no tipo, mas a jornada ativa não usa roleta/timer. Não renomear esses eventos.

`analytics.events.ts` acrescenta campanha, variante, classe de dispositivo e UTMs sanitizadas; adapter emite `belvitale:quiz-v7`. Callbacks externos dependem de consentimento explícito. Não foi encontrada instalação de adapter externo ou backend. A inspeção adicional do HTML (fora de src) encontrou **Meta Pixel 2186814428716995 em index.html**, com PageView e fallback noscript, preservados. Ele não está nas entradas HTML dedicadas dos quizzes nem recebe seus eventos. Não há ligação com o consentimento do adapter React. `experiment.store.ts` guarda até 5.000 observações no próprio navegador; `/quiz/analytics` é um painel local, não uma visão de tráfego agregado. Dados de demonstração são simulados.

Homepage: `home_view`, `hero_cta_click`, `product_view`, `quiz_cta_click`, `product_cta_click`, `proof_interaction`, `faq_open`, `checkout_start` via `belvitale:home`; comércio: `offer_view/select`, `checkout_click` via `belvitale:commerce`. Eventos não carregam origem de funil. `quiz_abandon`, `lead_created`, `purchase` ausentes. Nome local não é lead capturado. Não há compra confirmada ou webhook de pagamento neste checkout.

Checkout Normal passa UTMs permitidas, `campaignId`, `offerId`, `metadata[ab_experiment]`, `metadata[ab_variant]`, `metadata[ab_mode]`; não passa sessão/funil. Homepage passa apenas UTMs. Não há cookies próprios encontrados. Identificadores de anúncio não são preservados explicitamente. Query metadata na Yampi não prova persistência no pedido: requer validação com pedido de teste e webhook da conta.

## Diagnóstico visual e de confiança

- Mosaico: primeiro figure ocupa duas linhas mas o span interno guarda proporção quadrada e img tem altura automática; sobra um retângulo vazio no mobile.
- Produto: CSS limita a apresentação a 14 rem e coluna estreita; tamanho intrínseco declarado 640×853 diverge do asset 1122×1402. A fotografia já tem fundo e não deve receber sombra de recorte PNG.
- Header: wordmark editorial possui fundo opaco claro; combinado com header semitransparente, produz um retângulo perceptível. CSS Mounjaro ainda usa blur/backdrop. Remover essa dependência de composição.
- Corpo: fontes optional podem não carregar em rede lenta; fallback deve ser sans-serif explícito. Insights longos, repetição de respostas e ciência distante do CTA.
- Normal: “observação humana” descreve incorretamente uma regra automatizada; “falta de constância” é inferida para todas, inclusive frustradas com eficácia. Não afirmar que comprar mais cápsulas corrige isso.
- Fotos: cenas editoriais não são clientes ou evidência clínica. Imagens da embalagem têm lettering inconsistente; preservar rótulo documental como fonte de fórmula, não transcrever o mockup. Relatos existentes são fornecidos pela marca; não inventar falas nem atribuir uso de Mounjaro.
- Registros corporais não têm data, duração ou cronologia documentada: já existe aviso, que deve continuar visível.
- Situação sanitária permanece `pending`; revisão local não equivale a autorização de publicação. Não há ensaio clínico da fórmula final documentado.

## Públicos: hipóteses psicográficas para revisão, não pesquisa

| Dimensão | Pós-emagrecimento | Tradicional |
|---|---|---|
| Reconhecimento | Roupa larga, pele diferente, conquista ainda em adaptação | Short, foto, praia; incômodo recorrente sem impedir necessariamente a vida |
| Receio | Perder força, gastar com algo que promete resolver excesso de pele | Repetir gasto com creme/suplemento e ser culpada por falta de disciplina |
| Desejo | Preservar a conquista e escolher cuidados compatíveis | Escolher roupa e aparecer em fotos com menos preocupação |
| Confiança | Separar estética e sinais clínicos; reconhecer outros caminhos de perda | Fórmula legível, limites, preço e relatos contextualizados |
| Abandono | Vender cápsulas como tratamento de tirzepatida; pergunta sem opção verdadeira | Diagnóstico genérico; repetição emocional; promessa antes de evidência |
| Decisão UX | Resultado por prioridade e área; orientação seguida de composição | Insight condicionado à resposta; educação curta; produto e comparação claras |

Renda, região, filhos e escolaridade não determinam credulidade. O laboratório varia essas características, mas usa necessidades explicitamente declaradas para simular objeções. Não inferir insegurança de todas as mulheres nem criar vergonha para vender.

## Plano autorizado de revisão

Primeiro gerar painel reproduzível de 1.000 personas/2.000 exposições pareadas com baseline ausente identificado, scores heurísticos auditáveis e sem vencedor. Em seguida: reparar composição/header; fortalecer leitura e produto; diferenciar copy por respostas/público; explicar fórmula/limites com fontes; completar atribuição cliente e eventos preservando nomes; validar mobile e retorno; repetir o mesmo modelo. Mudanças compartilhadas constituem uma nova revisão de conteúdo e precisam ser segmentadas das observações históricas do teste.
