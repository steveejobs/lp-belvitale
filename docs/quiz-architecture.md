# Arquitetura do quiz de rotina

> Atualização de campanha — 14/07/2026: a experiência visual e as seis perguntas foram substituídas. O conceito corrente é **“Onde o seu cuidado encontra ritmo?”**; os perfis são **Começo sem peso**, **Ritmo que volta** e **Cuidado em curso**. Permanecem válidos os contratos de rota, scoring puro, storage sanitizado, privacidade, eventos sem respostas individuais e gates descritos abaixo.

Registrado em 14/07/2026. O quiz responde apenas qual formato de rotina é mais compatível com o momento informado. Não avalia corpo, saúde, necessidade, eficácia ou prazo de resultado.

## Publicação

- Status resolvido: `approved` somente quando `VITE_QUIZ_PUBLICATION_STATUS` contém exatamente `approved`; valores booleanos ou equivalentes permanecem bloqueados.
- Acesso interativo sem aprovação: somente desenvolvimento ou `VITE_INTERNAL_QUIZ=true`, sempre sem CTA público.
- Produção pública aprovada: exige também `VITE_CANONICAL_URL` válida no build.
- SEO bloqueado: `noindex, nofollow`, sem canonical definitivo, schema, sitemap ou links na homepage.
- SEO aprovado: `/quiz` com canonical, Open Graph e sitemap; `/quiz/resultado` com canonical para `/quiz` e `noindex, follow`.
- Ofertas: todos os mappings permanecem `pending`, sem `offerId`, preço, checkout ou recomendação de compra.

## Matriz auditável

Cada opção soma 2 pontos para exatamente um perfil e 0 para os demais. Não há IA ou variável comercial no cálculo.

| Pergunta | Opção A | Opção B | Opção C |
| --- | --- | --- | --- |
| `routine-approach` | Começo simples +2 | Constância gradual +2 | Continuidade consciente +2 |
| `trial-period` | Começo simples +2 | Constância gradual +2 | Continuidade consciente +2 |
| `consistency-barrier` | Começo simples +2 | Constância gradual +2 | Continuidade consciente +2 |
| `purchase-organization` | Começo simples +2 | Constância gradual +2 | Continuidade consciente +2 |
| `current-moment` | Começo simples +2 | Constância gradual +2 | Continuidade consciente +2 |
| `supplement-priority` | Começo simples +2 | Constância gradual +2 | Continuidade consciente +2 |

O maior total vence. Em empate, vence o perfil associado à resposta de `supplement-priority`, a sexta pergunta. Se a resposta final estiver ausente em uma chamada inválida da função pura, a ordem técnica de fallback é `simple-start`, `gradual-consistency`, `conscious-continuity`; a interface nunca calcula resultado incompleto.

## Estado local permitido

Chave preservada: `belvitale:quiz:v1`. Documento atual: versão `2`, com expiração de 30 dias a partir de `savedAt`.

- `answers`: somente pares de IDs de pergunta e opção válidos;
- `currentStep`: etapa numérica atual;
- `profile`: ID do perfil, somente após conclusão;
- `completedAt`: data ISO gerada localmente ao concluir.
- `version`: versão numérica do schema local;
- `savedAt`: data ISO técnica usada exclusivamente para expiração.

O parser descarta e remove estrutura inválida ou expirada. Documentos legados sem versão, ou com versão `1`, são validados e migrados com segurança para a versão atual. O storage nunca persiste texto livre, nome, e-mail, telefone, endereço, IP, dados médicos, cookies ou identificadores externos.

## Rotas e fallback

- `/quiz`: introdução e seis perguntas, uma por etapa.
- `/quiz/resultado`: resultado retomável após refresh quando houver estado completo válido.
- Entradas HTML próprias garantem fallback factual sem JavaScript e não modificam o fallback da homepage.
- A navegação entre quiz e resultado usa History API; respostas nunca entram na URL.

## Resultado da implementação

- As seis perguntas e 18 opções estão centralizadas em `src/data/quizQuestions.ts`.
- Os três perfis e suas três características estão centralizados em `src/data/quizProfiles.ts`.
- `calculateQuizProfile` é puro, determinístico, ignora entradas desconhecidas e usa a sexta resposta somente para desempate.
- O estado é sanitizado antes da leitura e regravado somente com os quatro grupos de dados permitidos.
- Refresh, retorno, alteração de resposta, reinício e resultado persistido funcionam sem servidor.
- O resultado oferece somente a composição e o reinício do quiz; os três mappings de oferta permanecem `pending` e sem `offerId`.
- O mesmo gate controla rota, CTA e sitemap. O build sem aprovação exibe estado indisponível; o build aprovado libera o quiz e mantém o resultado fora de indexação.
- Entradas multipágina preservam o fallback específico de `/quiz` e `/quiz/resultado` quando JavaScript está desabilitado.
- O acesso inválido a `/quiz/resultado` não cria perfil, limpa estado corrompido e oferece início do quiz.
- Eventos `quiz_view`, `quiz_start`, `quiz_step_complete`, `quiz_complete`, `quiz_restart` e `quiz_composition_click` são exclusivamente locais e nunca recebem IDs de respostas.
- Nenhuma imagem, biblioteca, schema, cookie, analytics ou dependência foi adicionada.
- Validação da fundação anterior: lint, typecheck, build e verificação de produção aprovados; suíte Playwright integral com 99 de 99 testes.

## Validação de publicação

- Revisão editorial registrada em `docs/quiz-content-review.md`: perguntas 2 e 4 pendentes de teste humano; pergunta 5 marcada como redundante; conteúdo preservado.
- Roteiro humano registrado em `docs/quiz-user-test-script.md`, sem coleta no site público.
- Builds bloqueado e aprovado passaram pelo mesmo verificador de segurança.
- Validação atual: lint e typecheck aprovados; build Vite com 57 módulos; Playwright integral com 105 de 105 testes aprovados em uma execução limpa de 11,9 min.
