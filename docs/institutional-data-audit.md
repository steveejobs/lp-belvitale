# Auditoria de dados institucionais

Auditoria registrada em 14/07/2026 antes da implementação. Dados fornecidos diretamente pelo usuário são tratados como confirmados para publicação no site, com o escopo indicado abaixo. A validação de formato não substitui consulta cadastral ou revisão jurídica.

## Dados da Belvitale

| Informação                | Valor auditado                                            | Status     | Fonte                                                                          | Pode publicar              |
| ------------------------- | --------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ | -------------------------- |
| Marca                     | Belvitale                                                 | confirmado | Fonte da verdade e instruções do usuário                                       | Sim, como marca            |
| Razão social              | Não informada                                             | pendente   | Ausente                                                                        | Não                        |
| Nome fantasia empresarial | Não informado                                             | pendente   | A marca Belvitale não será presumida como nome fantasia jurídico               | Não                        |
| CNPJ                      | 61.493.515/0001-65                                        | confirmado | Informado diretamente pelo usuário nesta rodada; dígitos verificadores válidos | Sim                        |
| E-mail                    | Não informado                                             | pendente   | Ausente                                                                        | Não                        |
| Telefone de atendimento   | (63) 99108-1785                                           | confirmado | Informado diretamente pelo usuário como SAC                                    | Sim, identificado como SAC |
| WhatsApp                  | Não confirmado                                            | pendente   | O número foi informado como SAC, não especificamente como WhatsApp             | Não                        |
| Endereço                  | Não informado                                             | pendente   | Ausente                                                                        | Não                        |
| Cidade                    | Não informada                                             | pendente   | Ausente                                                                        | Não                        |
| Estado                    | Não informado                                             | pendente   | Ausente                                                                        | Não                        |
| Fabricante                | Dados impressos no rótulo sem validação empresarial atual | bloqueado  | Rótulo; reutilização textual bloqueada pela fonte da verdade                   | Não                        |
| Responsável técnica       | Dados impressos no rótulo sem validação empresarial atual | bloqueado  | Rótulo; reutilização textual bloqueada pela fonte da verdade                   | Não                        |
| Domínio/canonical         | Não informado                                             | pendente   | Os endereços Yampi são checkouts, não o domínio institucional confirmado       | Não                        |
| Canal de atendimento      | SAC telefônico                                            | confirmado | Número fornecido diretamente pelo usuário                                      | Sim                        |
| Prazo de resposta         | Não informado                                             | pendente   | Ausente                                                                        | Não                        |

## Documentos legais

| Documento                      | Status  | Situação de publicação                                                                          |
| ------------------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| Política de Privacidade        | `draft` | Estrutura interna permitida; sem link público, sem indexação e sem texto jurídico até aprovação |
| Termos de Uso                  | `draft` | Estrutura interna permitida; sem link público, sem indexação e sem texto jurídico até aprovação |
| Política de Trocas e Reembolso | `draft` | Estrutura interna permitida; sem link público, sem indexação e sem texto jurídico até aprovação |

Somente o status `approved` autoriza indexação, presença em sitemap, link público e tratamento do conteúdo como política oficial.

## Auditoria dos checkouts fornecidos

Os três links foram abertos em navegador automatizado em 14/07/2026. A estrutura comercial observada coincide com a descrição fornecida pelo usuário:

| Referência   | Estrutura observada             | Imagem localizada             | Status nesta rodada                                             |
| ------------ | ------------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `PWJOI4I112` | CeluClin 1 Mês (1 pote)         | Miniatura PNG de 290 × 314 px | Kit confirmado; imagem preservada para revisão comercial futura |
| `1E8NNCGJW9` | CeluClin 3 Meses (3 potes)      | Miniatura PNG de 290 × 329 px | Kit confirmado; imagem preservada para revisão comercial futura |
| `41CHX4MGPX` | CeluClin 7 Meses (5 + 2 adicionais) | Miniatura PNG de 290 × 289 px | Kit confirmado; imagem preservada para revisão comercial futura |

- As URLs sem o sufixo de miniatura retornaram HTTP 404; a resolução original não está disponível publicamente pelo checkout.
- As miniaturas foram salvas em `galeria belvitale/checkout-assets/`, fora de `public/`, e não serão consumidas pela aplicação nesta rodada.
- Preços são dados voláteis e permanecem fora desta rodada, mesmo tendo sido visíveis durante a auditoria.
- O checkout exibe contador e depoimentos com alegações incompatíveis com os bloqueios editoriais do projeto. Nenhum desses textos, imagens de depoimento ou mecanismos de urgência será reutilizado.
- O checkout chama os dois potes adicionais de “grátis”. A condição promocional não foi formalmente aprovada e não será reutilizada na copy.

## Regra de renderização

- Somente fatos institucionais com status `confirmed` podem ser exibidos em produção.
- `pending` e `blocked` não geram placeholders, espaços vazios ou linguagem como “em breve”.
- Documentos legais em `draft` ou `blocked` não recebem link público nem indexação.
