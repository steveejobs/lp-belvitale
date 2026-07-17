# Eventos do quiz Belvitale v3

A camada central emite eventos locais `belvitale:quiz` e aceita adaptadores para o futuro ADM. Adaptadores externos só recebem eventos quando `window.__BELVITALE_ANALYTICS_CONSENT__ === true`.

| Evento | Momento |
| --- | --- |
| `quiz_view` | rota interativa carregada |
| `quiz_start` | CTA da abertura ou recuperação acionado |
| `quiz_question_view` | pergunta visível |
| `quiz_answer` | botão de resposta escolhido |
| `quiz_checkpoint_view` | microinsight derivado exibido |
| `quiz_back` | retorno de etapa |
| `quiz_abandon` | saída com jornada incompleta |
| `quiz_complete` | seis respostas válidas calculadas |
| `quiz_result_view` | resultado útil exibido |
| `quiz_recommendation_view` | opção sugerida entra na área visível |
| `quiz_all_options_view` | comparação das três opções entra na área visível |
| `quiz_checkout_click` | clique na recomendação ou em outra opção |
| `quiz_formula_click` | acesso à composição |
| `quiz_label_click` | acesso ao rótulo |
| `quiz_restart` | resultado descartado para recomeçar |

## Payload permitido

`quiz_version`, `experiment_variant`, `question_id`, `answer_id`, `step`, `result_profile`, `recommended_plan`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` e `utm_term`.

UTMs são limitadas a 100 caracteres, passam por allowlist de caracteres e são descartadas se parecerem e-mail ou telefone. Não há campos livres, nome, e-mail, telefone, idade, peso, medidas, fotografia, localização ou conteúdo de saúde.

## Métricas habilitadas

- Visualização, início, conclusão e abandono por pergunta.
- Tempo mediano usando os timestamps de ingestão do provedor futuro.
- Retorno após abandono usando a atribuição de sessão do provedor, sem criar identificador pessoal no quiz.
- Distribuição de perfis e opções sugeridas.
- Visualização e clique na recomendação, visualização das alternativas e clique no checkout.
- Funil principal `quiz_start → quiz_complete → quiz_recommendation_view → quiz_checkout_click`.
- Corte por origem, campanha, variante e versão do quiz.
