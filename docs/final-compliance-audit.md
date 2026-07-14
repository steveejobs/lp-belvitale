# Auditoria final de conformidade — Belvitale / CeluClin

Data da auditoria: 14/07/2026  
Escopo: auditoria integral, somente leitura, do código, conteúdo renderizado, build existente, rotas, documentação e evidências visuais. Nenhum arquivo de aplicação, conteúdo, configuração, asset ou build foi alterado nesta rodada. Este relatório é o único arquivo criado.

## Resumo executivo

O projeto tem uma base institucional tecnicamente organizada e usa gates corretos para fórmula divergente, provas visuais, documentos legais e ofertas comerciais. A homepage renderizada é clara ao identificar o CeluClin como suplemento alimentar, não contém claims terapêuticos proibidos e não expõe provas ou ofertas incompletas em produção.

O build auditado, entretanto, **não deve ser publicado como está**. O maior problema objetivo é a publicação do quiz com canonical, Open Graph e sitemap apontando para `https://example.test`. Também não há gate sanitário global, o quiz ainda tem perguntas marcadas como redundante ou pendentes de teste humano, e os documentos legais, dados empresariais completos, política de reembolso, imagens comerciais e direitos de uso continuam bloqueados.

Resultado ponderado dos requisitos avaliáveis: **64%**. Foram excluídos do denominador os itens classificados como `bloqueado por dado externo` e `não aplicável`; `conforme` vale 1, `parcialmente conforme` vale 0,5 e `não conforme` vale 0. Há **11 bloqueios externos** registrados na matriz.

## Fontes e limitações

### Fontes disponíveis e consultadas

- `docs/source-of-truth.md`
- `docs/formula-audit.md`
- `docs/institutional-data-audit.md`
- `docs/commercial-offer-audit.md`
- `docs/quiz-content-review.md`
- `docs/requirements-ledger.md`
- Código em `src/`, `index.html`, `vite.config.ts` e configuração do projeto
- Build existente em `dist/`, gerado em 14/07/2026 às 16:24:12
- 32 screenshots em `artifacts/screenshots/` e 9 gravações em `artifacts/recordings/`
- Conteúdo renderizado e DOM das rotas em preview local do `dist`

### Fontes solicitadas, mas ausentes

Não foram encontrados no workspace nem no diretório pai:

- `Markdown.md colado`
- `style lp mobile.txt`
- `quizz e funil.txt`

Logo, qualquer comparação exclusiva com esses três documentos está classificada como `bloqueado por dado externo`. Não foi inferido o conteúdo ausente.

### Método independente

- O build não foi regenerado porque `vite build` alteraria `dist/`, contrariando o escopo somente leitura. Foi auditado o build já existente.
- Testes existentes não foram aceitos como prova automática.
- Foram inspecionados código e documentação linha a linha, arquivos do `dist`, DOM computado, metas, links, recursos carregados, console, dimensões de alvos e overflow.
- As rotas foram abertas diretamente, inclusive após refresh: `/`, `/quiz/`, `/quiz/resultado/`, `/politica-de-privacidade`, `/termos-de-uso` e `/trocas-e-reembolso`.
- Foram abertas evidências visuais mobile e desktop de hero, introdução, fórmula, rotina, rótulo, FAQ, marca, rodapé, CTA do quiz e telas do quiz. As capturas comerciais são fixtures de desenvolvimento e não foram tratadas como conteúdo publicado.
- Lighthouse 13.4.0 foi executado em perfil mobile contra o build local. O launcher retornou `EPERM` apenas ao tentar excluir sua pasta temporária depois de gravar o relatório; os relatórios JSON foram lidos com sucesso.
- Critérios de Core Web Vitals: LCP até 2,5 s, INP até 200 ms e CLS até 0,1, conforme [web.dev](https://web.dev/articles/vitals).
- Para touch targets foi usada a caixa computada em CSS pixels. WCAG 2.2 AA requer 24 × 24 CSS px ou uma das exceções documentadas pelo [W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html); 44 × 44 px foi tratado apenas como alvo móvel aprimorado, não como requisito AA absoluto.

## Matriz de conformidade

| ID | Requisito | Fonte | Implementado | Publicado | Evidência | Divergência | Ação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HOM-01 | Ordem relativa das seções publicadas | Arquitetura aprovada; `requirements-ledger` | **conforme** — hero, confiança, introdução, fórmula, rotina, rótulo, CTA do quiz, FAQ e marca estão na ordem definida | Sim | `src/App.tsx:37-51`; DOM computado de `/` | Nenhuma inversão entre as seções efetivamente publicadas | Preservar a ordem |
| HOM-02 | Ordem completa da homepage, incluindo camada comercial, galeria e CTA final | Solicitação da auditoria; arquitetura preliminar | **parcialmente conforme** — os slots existem, mas comercial e galeria são condicionais; CTA final comercial/institucional não existe | Parcial | `src/App.tsx:43-47`; `commercialPublicationReady`; `import.meta.env.DEV` | A página pública não contém kits, prova visual nem CTA final | Inserir somente após aprovação de dados, direitos e política; definir CTA final seguro |
| CNT-01 | Identificação emocional relacionada à experiência com celulite | Solicitação da auditoria; fonte externa ausente | **não conforme** — a copy fala de autocuidado, mas não reconhece explicitamente a experiência emocional ligada à celulite | Não | Hero e introdução renderizados; `InstitutionalHero.tsx`; `CeluClinIntro.tsx` | O visitante não encontra identificação específica com o problema que motivou o produto | Criar copy editorial aprovada, sem vergonha corporal nem promessa |
| CNT-02 | Educação factual sobre celulite | Solicitação da auditoria; fonte externa ausente | **não conforme** — não há seção educativa sobre o tema | Não | Busca no DOM e em `src/`; screenshots institucionais | O produto é contextualizado apenas como rotina de autocuidado | Produzir conteúdo educacional com revisão regulatória e fontes aprovadas |
| HERO-01 | Identificação do produto e categoria em menos de cinco segundos | `source-of-truth`; requisitos do hero | **conforme** — CeluClin é chamado de suplemento alimentar e a proposta é clara | Sim | `InstitutionalHero`; screenshot `390x844-institutional-hero.png`; DOM | Nenhuma | Preservar a copy factual |
| HERO-02 | Posicionamento comercial do hero | Requisitos institucionais e comerciais | **parcialmente conforme** — há CTA de conhecimento, mas não há conexão comercial publicada nem produto visual oficial | Parcial | Hero renderizado; CTA `#celuclin`; comercial bloqueado | O hero vende confiança, mas ainda não encaminha a uma oferta aprovada | Manter o hero institucional; integrar comercialmente apenas depois dos gates |
| HERO-03 | Imagem oficial do produto em alta resolução e com direito de uso | `assets-manifest`; `commercial-offer-audit` | **bloqueado por dado externo** — fallback abstrato funciona e não simula embalagem | Não | Hero sem `img` de produto; oferta com asset pendente | Packshot oficial e direito de uso não confirmados | Fornecer arquivo oficial em alta e autorização documental |
| FOR-01 | Ingredientes confirmados e quantidades | `formula-audit`; `productFacts` | **conforme** — 7 linhas confirmadas são publicadas: fibras de maçã e aveia, quercetina, vitamina C, zinco, chlorella e spirulina | Sim | `src/data/productFacts.ts:59-116`; DOM de `#composicao` | Nenhuma dessas sete linhas diverge | Preservar centralização tipada |
| FOR-02 | Nomenclatura da cúrcuma | `source-of-truth:18`; `formula-audit:24,38` | **bloqueado por dado externo** — código marca `conflicting` e exclui da produção | Não | `src/data/productFacts.ts:95-102`; nota de validação na fórmula | A fonte textual diz “extrato de cúrcuma”; o rótulo diz “Extrato de Rizoma de Cúrcuma (Curcumina)” | Obter validação documental; depois alinhar fonte da verdade e código |
| FOR-03 | Fórmula integral, valores diários e excipientes | `formula-audit` | **parcialmente conforme** — publicação parcial é sinalizada; não há linhas vazias nem inferências | Parcial | `getFormulaPublicationState`; seção renderizada | Fórmula completa, VDs e excipientes não estão republicados | Confirmar documentação legível antes de ampliar a lista |
| SAFE-01 | Advertências confirmadas e identificação como não medicamento | `source-of-truth`; `formula-audit` | **conforme** — maiores de 19 anos, não medicamento, gestantes, lactantes e crianças aparecem conforme auditoria | Sim | `src/data/productFacts.ts:119-150`; rotina renderizada | Nenhuma advertência específica foi inventada | Preservar; revisar quando houver versão final do rótulo |
| SAFE-02 | Informação “não contém glúten/lactose” | `source-of-truth`; rótulo; FAQ | **conforme** para essas duas declarações específicas | Sim | `src/data/faqFacts.ts:107-112`; FAQ renderizado | Não equivale a uma auditoria completa de alergênicos | Manter a redação limitada ao que o rótulo informa |
| SAFE-03 | Alergênicos completos | `source-of-truth:31`; `institutional-data-audit` | **bloqueado por dado externo** — não são publicados | Não | Ausência no DOM; status documental pendente | Atualidade e completude dos alergênicos não foram validadas | Obter especificação oficial e revisão do rótulo |
| SAFE-04 | Conservação/armazenamento | `formula-audit`; `faqFacts` | **bloqueado por dado externo** — pergunta existe como bloqueada e não chega ao FAQ público | Não | `src/data/faqFacts.ts:121-124`; DOM sem a pergunta | Informação não confirmada para republicação textual | Confirmar fonte oficial legível |
| INST-01 | Identificação institucional mínima | `institutional-data-audit` | **conforme** — CNPJ e SAC são tipados e exibidos; SAC não é presumido como WhatsApp | Sim | `src/data/institutionalFacts.ts:25-44`; rodapé | Razão social e endereço continuam ausentes | Preservar a distinção entre telefone e WhatsApp |
| INST-02 | Fabricante, distribuidor, endereço e responsável técnica | `source-of-truth:31-32`; `institutional-data-audit` | **bloqueado por dado externo** — valores não aparecem | Não | `institutionalFacts`: address pendente, manufacturer e responsibleProfessional bloqueados | Identificação jurídica e cadeia de fabricação incompletas | Validar documentos empresariais e sanitários atuais |
| COM-01 | Arquitetura tipada de kits e gate de publicação | `commercial-offer-audit`; requisitos comerciais | **conforme** — 3 URLs estão centralizadas; preço, imagem, direitos, checkout e política entram no gate | Não, corretamente | `src/data/commercialOffers.ts:228-280`; `src/App.tsx:43-45` | Nenhuma oferta incompleta aparece no DOM de produção | Preservar o gate |
| COM-02 | Kits publicáveis, comparação e CTAs para compra | `commercial-offer-audit:56` | **bloqueado por dado externo** — 0 de 3 ofertas publicáveis | Não | DOM com 0 links Yampi, 0 preços e 0 cards; auditoria comercial | Preços, parcelas, imagens em alta, direitos, política e identificação jurídica pendentes | Aprovar cada dependência antes de mudar status |
| COM-03 | Processo de compra e CTA final | Solicitação da auditoria; arquitetura inicial | **não conforme** no conteúdo público — há infraestrutura de CTA dentro da seção bloqueada, mas não há orientação final ou saída comercial publicada | Não | DOM de `/`; `CommercialSection.tsx`; rodapé | Jornada pública termina em FAQ/marca, sem processo de compra ou CTA final | Definir fluxo somente após ofertas e legais aprovados |
| SOC-01 | Depoimentos reais autorizados | Requisitos; rascunhos não aprovados | **bloqueado por dado externo** — nenhum depoimento foi publicado | Não | DOM e `dist` sem depoimentos | Origem, aprovação e autorização das clientes não existem no projeto | Coletar texto final, identificação escolhida e consentimento |
| SOC-02 | Provas visuais reais com contexto e autorização | `assets-manifest`; `proofGallery` | **bloqueado por dado externo** — todos os 10 itens estão `pending` e a galeria é DEV-only | Não, corretamente | `src/data/proofGallery.ts`; ausência de `dist/proof` | Não há comprovação de origem, vínculo, contexto ou consentimento | Manter bloqueado até validação individual |
| LEG-01 | Estrutura e gate das páginas legais | `institutional-data-audit`; requisitos legais | **conforme** — 3 rotas existem, ficam `noindex, nofollow` e não são vinculadas como políticas oficiais | Bloqueado, corretamente | `src/data/legalDocuments.ts:18-57`; DOM das 3 rotas | As rotas respondem 200 com “Página não publicada”, o que é aceitável como bloqueio técnico, mas não substitui políticas | Manter fora do sitemap e do rodapé público |
| LEG-02 | Conteúdo jurídico aprovado | `institutional-data-audit`; `legalDocuments` | **bloqueado por dado externo** — privacidade, termos e trocas/reembolso estão `draft` | Não | `src/data/legalDocuments.ts:18-45` | Não há política oficial aplicável à venda | Submeter textos reais à revisão jurídica e alterar status somente depois |
| REG-01 | Status sanitário como gate global | `source-of-truth:34`; solicitação da auditoria | **não conforme** — status é pendente e não existe dependência global impedindo publicação da homepage/quiz | Homepage e quiz, sim | Busca em `src/` encontra gates comercial, prova, legal e quiz, mas nenhum gate sanitário | O site institucional e o quiz podem ser publicados sem uma decisão explícita sobre o status sanitário | Criar fato tipado e gate de release central; definir quais superfícies ele bloqueia |
| QUIZ-01 | Publicação controlada do quiz | `quiz-content-review`; requisitos do quiz | **parcialmente conforme** — código exige string `approved`, mas o build atual está aprovado com canonical de fixture | Sim no build atual | `quizPublicationConfig.ts:6-12`; `/quiz/`; `dist/quiz/index.html` | O gate funciona, porém o artefato aprovado não tem domínio real e conteúdo ainda aguarda teste humano | Bloquear release até domínio e revisão humana; buildar com env de produção real |
| QUIZ-02 | Redundância e risco de indução nas perguntas | `quiz-content-review:7-18` | **parcialmente conforme** — revisão existe, sem alteração automática | Sim | Q2 e Q4 “pendente de teste humano”; Q5 “redundante” | O resultado pode ser previsível e a Q4 pode parecer preparação comercial | Executar o roteiro humano antes da aprovação editorial final |
| QUIZ-03 | Resultado neutro, privacidade e ausência de oferta | Requisitos do quiz | **conforme** — sem diagnóstico, dados pessoais, preço, checkout ou recomendação de kit | Sim | DOM `/quiz/` e `/quiz/resultado/`; storage e eventos locais | Nenhuma | Preservar separação da arquitetura comercial |
| A11Y-01 | Touch targets medidos em pixels | Requisitos de acessibilidade; WCAG 2.2 | **parcialmente conforme** — CTAs principais passam 44 px; 11 de 28 alvos visíveis têm uma dimensão abaixo de 44 px e 10 têm altura abaixo de 24 px | Sim | Medição em 390 × 844: hero CTAs 154,7 × 48 e 129,7 × 48; links institucionais 18 px de altura; links do rodapé 21 px; SAC 19 px; wordmark do header 80,6 × 21,6 | Não foi demonstrada formalmente a exceção de espaçamento para cada alvo menor que 24 px | Aumentar área clicável via padding/min-block-size sem aumentar visualmente o texto |
| UX-01 | Zona do polegar e CTA mobile na primeira dobra | Requisitos mobile | **conforme** — CTA principal está visível e em região inferior alcançável | Sim | 390 × 844: centro do CTA em y=617,4 px; viewport 844 px; sem overflow (scrollWidth=clientWidth=390) | “Zona do polegar” é heurística, não critério normativo | Preservar posição; validar em dispositivo físico |
| PERF-01 | LCP mobile | Core Web Vitals; requisito de performance | **conforme em laboratório local** — 1,7–1,8 s no Lighthouse e 1,412 s na instrumentação do navegador | Sim | Lighthouse mobile; `PerformanceObserver` local | Não há dado de campo no percentil 75 | Medir CrUX/RUM após publicação |
| PERF-02 | INP mobile | Core Web Vitals | **parcialmente conforme** — Lighthouse não fornece INP de laboratório; interação sintética observada em 208 ms e TBT variou de 460 a 1.010 ms | Indeterminado em campo | Event Timing local; Lighthouse | 208 ms fica ligeiramente acima do alvo de 200 ms, mas não é INP de campo; não há amostra real | Repetir em aparelho intermediário e instrumentar RUM consentido futuramente |
| PERF-03 | CLS mobile | Core Web Vitals | **conforme em laboratório local** — CLS 0 em ambas as execuções Lighthouse e na instrumentação | Sim | Lighthouse e `PerformanceObserver` | Não há dado de campo | Manter dimensões reservadas e monitorar após CDN |
| PERF-04 | Desempenho global e carregamento de recursos | Requisitos de performance | **parcialmente conforme** — Lighthouse completo marcou 77; execução perf-only marcou 88; imagem do rótulo abaixo da dobra é carregada como eager | Sim | LCP 1,8 s, TBT 1.010 ms no relatório conservador; `celuclin-label-front.webp` 187.194 bytes | Variabilidade de main thread; recurso abaixo da dobra antecipa transferência | Investigar TBT e mudar rótulo para lazy sem prejudicar sua animação |
| BUILD-01 | Conteúdo presente no HTML de `dist` | Solicitação da auditoria; fallback sem JS | **parcialmente conforme** — `dist/index.html` contém conteúdo institucional extenso em `noscript`, mas a árvore interativa principal depende do bundle | Parcial | `dist/index.html` 20.024 bytes; conteúdo noscript; root React vazio antes do JS | Metadados e conteúdo interativo não são integralmente estáticos/SSR | Avaliar prerender da homepage e garantir paridade do fallback |
| BUILD-02 | Integridade do build existente | Requisitos de build | **parcialmente conforme** — arquivos são coerentes, sem 404/console no preview, mas o build não foi reproduzido nesta auditoria somente leitura | Sim, com bloqueios | JS 247.135 B; CSS 46.987 B; rotas e label presentes | Canonical de fixture torna o artefato inadequado para release | Rebuild limpo só depois de corrigir env e gates |
| ROUTE-01 | Rotas públicas e refresh direto | Requisitos de rotas | **conforme tecnicamente** — `/`, `/quiz/` e `/quiz/resultado/` respondem 200 e sem erros de console | Sim | Inspeção independente no preview | Resultado inválido é tratado corretamente; rota continua `noindex` | Preservar fallback de resultado inválido |
| ROUTE-02 | Rotas legais bloqueadas | Requisitos legais | **parcialmente conforme** — respondem 200 e mostram indisponibilidade, com noindex/nofollow | Bloqueado | Inspeção das 3 rotas | Não são 404/410; crawlers podem acessá-las, embora não devam indexá-las | Decidir entre manter shell 200 bloqueado ou retirar da publicação até aprovação |
| SEO-01 | Canonical e Open Graph | Requisitos SEO; `institutional-data-audit:21` | **não conforme** no build atual | Sim, incorretamente | Homepage computa `https://example.test/`; quiz e resultado têm canonical/OG `https://example.test/quiz` | Domínio institucional está pendente, mas fixture foi compilada no artefato | Impedir build aprovado com host reservado e configurar domínio real |
| SEO-02 | Robots por rota | Requisitos SEO | **parcialmente conforme** — quiz está `index, follow`, resultado `noindex, follow`, legais `noindex, nofollow`; homepage não declara robots | Sim | DOM e HTML do `dist` | Sem domínio real e aprovação humana, o quiz não deveria estar indexável neste artefato | Voltar quiz a bloqueado até gates finais; adicionar política de robots consistente |
| SEO-03 | Sitemap | Requisitos SEO | **não conforme** — contém apenas `/quiz` em `example.test` e omite a homepage | Sim, incorretamente | `dist/sitemap.xml` | Host inválido e cobertura incompleta | Gerar sitemap a partir do canonical real e incluir somente rotas aprovadas, começando pela home |
| ATTR-01 | UTMs e governança de atribuição | Solicitação da auditoria; `quizz e funil.txt` ausente; requisito comercial proibia parâmetros desconhecidos | **bloqueado por dado externo** — não existem UTMs no código ou nos links e não há especificação disponível para validá-las | Não | Busca em `src/` e `dist`; URLs Yampi literais | Não é possível distinguir ausência intencional de requisito não implementado sem o documento de funil | Fornecer convenção de UTMs aprovada; não adicionar parâmetros por inferência |
| ATTR-02 | Eventos comerciais | Requisitos comerciais | **conforme como preparação** — `offer_view`, `offer_select` e `checkout_click` são locais, desacoplados e sem terceiros | Não enviados externamente | `src/commerce/commerceEvents.ts`; `CommercialSection.tsx` | Eventos só existirão quando a seção estiver publicável | Integrar analytics apenas após consentimento e política aprovados |
| CLAIM-01 | Claims proibidos | `source-of-truth:55-69`; requisitos de todas as rodadas | **conforme** — não foram encontrados claims positivos proibidos no DOM ou build | Sim, copy segura | Varredura de fonte, DOM e `dist`; ocorrências de “resultado garantido” são negações explícitas (“Sem…”), não promessas | Não há educação sobre celulite, mas isso não autoriza preencher com mecanismos ou claims | Manter revisão lexical e contextual no CI |
| ASSET-01 | Provas bloqueadas fora do build | `assets-manifest`; requisitos de galeria | **conforme** — não existem diretórios/arquivos de proof no `dist` | Não | Inventário integral de `dist`; DOM com 0 imagens de prova | Nenhuma | Preservar exclusão de produção |
| ASSET-02 | Imagens comerciais pequenas/bloqueadas fora do build | `commercial-offer-audit`; requisitos comerciais | **conforme** — nenhuma miniatura de 290 px, packshot pendente ou kit simulado entrou no build | Não | `dist` contém apenas WebP/PDF do rótulo; DOM com 0 imagens de produto | Hero permanece sem packshot | Adicionar somente mídia oficial em alta e com direitos confirmados |
| DOC-01 | Coerência do `requirements-ledger` com publicação real | `requirements-ledger` | **parcialmente conforme** — “Concluído” descreve implementação/gate, mas pode ser lido como aprovação/publicação | Parcial | Ledger marca SEO, evidências, qualidade e publicação controlada como concluídos | O build atual tem canonical de fixture e dados externos continuam pendentes | Separar colunas “implementado”, “validado” e “aprovado para produção” |
| DOC-02 | Coerência entre fonte da verdade e auditoria de fórmula | `source-of-truth:18`; `formula-audit:24,38` | **não conforme** na documentação, embora o código escolha o caminho seguro | Parcial | Cúrcuma aparece como fato confirmado na fonte da verdade e como divergente na auditoria | Duas fontes normativas se contradizem | Rebaixar a linha na fonte da verdade para divergente até validação |
| DOC-03 | Comparação com `Markdown.md colado`, `style lp mobile.txt` e `quizz e funil.txt` | Solicitação da auditoria | **bloqueado por dado externo** | Não aplicável | Arquivos ausentes no workspace e no diretório pai | Auditoria de fidelidade visual/funil não pode ser encerrada | Anexar os três arquivos e repetir apenas a comparação afetada |

## Percentual por categoria

Método: `conforme = 100%`, `parcialmente conforme = 50%`, `não conforme = 0%`; bloqueios externos e itens não aplicáveis ficam fora do denominador, mas são mostrados separadamente.

| Categoria | Pontuação | Bloqueados externos | Leitura |
| --- | ---: | ---: | --- |
| Arquitetura, conteúdo, hero, fórmula e claims | 61% | 2 | Base segura, porém sem educação/identificação sobre celulite e sem produto oficial |
| Segurança do produto e dados institucionais | 75% | 3 | O publicado é factual; faltam dados essenciais externos e gate sanitário |
| Comercial, legal e prova social | 67% | 4 | Gates bons, mas a jornada pública e os documentos finais não existem |
| Quiz | 67% | 0 | Arquitetura segura; revisão humana e build de produção ainda não fechados |
| UX, acessibilidade e performance | 75% | 0 | Visual estável; alvos pequenos e responsividade de main thread pedem correção |
| Build, rotas, SEO, atribuição e assets | 60% | 1 | Assets bloqueados estão corretos; canonical e sitemap impedem release |
| Coerência documental | 25% | 1 | Há conflito de fórmula e o ledger mistura implementação com aprovação |
| **Total avaliável** | **64%** | **11** | **Não publicável no estado atual do `dist`** |

## Dez maiores divergências

1. **Canonical e sitemap de fixture:** o `dist` aponta para `https://example.test`, inclusive com o quiz indexável.
2. **Ausência de gate sanitário global:** o status sanitário está pendente, mas não participa da decisão de release da homepage ou do quiz.
3. **Documentos legais não aprovados:** privacidade, termos e trocas/reembolso permanecem `draft`.
4. **0 de 3 ofertas publicáveis:** faltam preços, parcelamento, imagens oficiais em alta, direitos, política aplicável e identificação jurídica suficiente.
5. **Dados empresariais incompletos:** razão social, endereço, fabricante, distribuidor e responsável técnica não estão confirmados.
6. **Quiz publicado antes do encerramento editorial:** Q2 e Q4 aguardam teste humano; Q5 está marcada como redundante.
7. **Ausência de identificação e educação sobre celulite:** a homepage é segura, mas não cobre essa camada de conteúdo solicitada na auditoria.
8. **Touch targets pequenos:** 10 alvos visíveis medem menos de 24 px de altura; as exceções WCAG não foram demonstradas individualmente.
9. **Conflito documental da cúrcuma:** `source-of-truth` trata a linha como confirmada, enquanto `formula-audit` a bloqueia por nomenclatura divergente.
10. **Rastreabilidade incompleta:** não há UTMs ou especificação de atribuição disponível, e os três arquivos externos solicitados para comparação estão ausentes.

## Bloqueadores de produção

### Bloqueadores do build inteiro

- Remover qualquer `example.test` de canonical, Open Graph e sitemap e configurar o domínio institucional real.
- Definir formalmente o status sanitário e incorporar a decisão a um gate de release global.
- Resolver se o quiz pode ser publicado antes do teste humano; no estado atual, recomenda-se voltar o gate para bloqueado.
- Regerar e reauditar o build em ambiente de produção real, porque o artefato atual foi compilado com fixture de publicação.

### Bloqueadores para ativar venda

- Aprovar política de trocas e reembolso, termos e privacidade.
- Confirmar razão social, endereço e identificação jurídica aplicável.
- Confirmar preço total, parcelamento, juros e conteúdo exato de cada kit.
- Fornecer imagens oficiais em alta resolução e comprovar direito de uso.
- Definir processo de compra, CTA final e eventual convenção de UTMs sem mascarar os links Yampi.

### Bloqueadores para prova social

- Confirmar origem, contexto, ausência de manipulação enganosa e consentimento de cada imagem.
- Obter aprovação e autorização individual dos depoimentos finais.

## Correções em ordem de impacto

1. **P0 — Release/SEO:** impedir pipeline aprovado com domínio reservado; exigir canonical real e gerar sitemap incluindo a homepage.
2. **P0 — Governança sanitária:** criar status sanitário tipado e gate de release, com regra explícita para homepage, quiz e comercial.
3. **P0 — Quiz:** executar teste humano; decidir Q2, Q4 e Q5; manter bloqueado até decisão e domínio real.
4. **P0 — Jurídico/comercial:** aprovar políticas e identificação jurídica antes de publicar qualquer kit ou checkout.
5. **P1 — Documentação:** reconciliar cúrcuma e separar “implementado” de “aprovado/publicado” no ledger.
6. **P1 — Acessibilidade:** elevar áreas clicáveis menores, priorizando header, links institucionais, rodapé e SAC.
7. **P1 — Conteúdo:** criar camada editorial factual sobre celulite e identificação emocional, sem mecanismos ou promessas.
8. **P1 — Performance:** reduzir TBT, revisar o bundle e carregar o rótulo abaixo da dobra de forma lazy.
9. **P2 — Comercial:** completar ofertas, assets, direitos, comparação e CTA final; então ativar o gate existente.
10. **P2 — Medição:** definir UTMs e analytics somente após política/consentimento; coletar Core Web Vitals de campo depois da publicação.

## Arquivos que precisariam ser alterados em rodada futura

Nenhum deles foi alterado nesta auditoria.

| Objetivo | Arquivos prováveis |
| --- | --- |
| Gate sanitário global | `src/data/productFacts.ts` ou novo `src/data/regulatoryFacts.ts`, `src/App.tsx`, verificador de produção e documentação |
| Canonical, robots e sitemap | `src/config/site.ts`, `src/components/SeoMetadata.tsx`, `src/components/QuizRoute.tsx`, `vite.config.ts`, configuração `.env` do deploy |
| Revisão/publicação do quiz | `src/data/quizPublicationConfig.ts`, configuração de deploy; perguntas somente após decisão humana em `src/data/quizQuestions.ts` |
| Educação e identificação emocional | `src/components/InstitutionalHero.tsx`, `src/components/CeluClinIntro.tsx` ou novo componente editorial; estilos locais |
| Touch targets | Folhas CSS dos componentes institucionais, header e rodapé |
| Fórmula e documentação | `docs/source-of-truth.md`, `docs/formula-audit.md`, `src/data/productFacts.ts` somente após confirmação |
| Dados institucionais | `src/data/institutionalFacts.ts`, `docs/institutional-data-audit.md`, rodapé/seção institucional |
| Políticas legais | `src/data/legalDocuments.ts` e conteúdo jurídico aprovado |
| Ofertas e CTA final | `src/data/commercialOffers.ts`, `src/components/CommercialSection.tsx`, `src/App.tsx`, assets oficiais |
| UTMs/eventos | camada central de links/eventos comerciais e documentação de atribuição; nunca URLs dispersas no JSX |
| Performance do rótulo/bundle | `src/components/LabelTransparency.tsx`, CSS associado e estratégia de divisão/carregamento no Vite |
| Estado real do projeto | `docs/requirements-ledger.md`, `docs/change-impact.md` e auditorias afetadas |

## Evidência técnica consolidada

### DOM e rotas

- `/`: HTTP 200, um H1, sem erro de console, sem overflow em 390 px, sem Yampi, preço, prova ou produto bloqueado.
- Ordem computada: `#inicio`, trust bar, `#celuclin`, `#composicao`, `#rotina`, `#rotulo`, CTA do quiz, `#faq`, `#belvitale`.
- `/quiz/`: HTTP 200, `index, follow`, canonical `https://example.test/quiz`, sem checkout e sem preço.
- `/quiz/resultado/` sem estado: HTTP 200, mensagem de resultado indisponível, `noindex, follow`, canonical para `/quiz`.
- As três rotas legais: HTTP 200, “Página não publicada”, `noindex, nofollow`, sem links no rodapé público.

### Build

- `dist/assets/main-Sv2EaufD.js`: 247.135 bytes.
- `dist/assets/main-CGmiAchk.css`: 46.987 bytes.
- `dist/index.html`: 20.024 bytes.
- `dist/label/celuclin-label-front.webp`: 187.194 bytes.
- `dist/label/celuclin-label-complete.pdf`: 846.156 bytes.
- Não existem assets de provas, lifestyle, produto ou kits no build.
- `dist/sitemap.xml` contém somente `https://example.test/quiz`.

### Lighthouse mobile

| Execução | Performance | FCP | LCP | TBT | CLS | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Completa | 77 | 1,4 s | 1,8 s | 1.010 ms | 0 | 100 | 100 | 92 |
| Performance-only | 88 | 1,5 s | 1,7 s | 460 ms | 0 | — | — | — |

O erro final `EPERM` ocorreu na limpeza da pasta temporária do Chrome Launcher depois da geração do JSON. Por isso os scores são válidos, mas a execução teve saída de processo 1. A variação de TBT justifica usar o resultado conservador e repetir o teste no pipeline de release.

## Conclusão

A implementação é disciplinada em não inventar fatos e bloquear conteúdo comercial/probatório incompleto. Ainda assim, o artefato atual mistura um bom site institucional com uma configuração de publicação de teste. A correção de maior impacto não é visual: é impedir que `example.test`, um quiz editorialmente pendente e um status sanitário indefinido atravessem o gate de release. Depois disso, jurídico, dados empresariais, ofertas e mídia oficial determinam quando a camada comercial poderá ser ativada.
