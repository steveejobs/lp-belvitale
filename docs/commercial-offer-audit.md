# Auditoria das ofertas comerciais

Auditoria registrada em 14/07/2026 antes da implementação. Os três links foram validados sem executar compra, preencher dados pessoais ou promover preços observados automaticamente. Conteúdo promocional do checkout não é tratado como copy aprovada.

## Matriz comercial

| Dado | Kit 1 | Kit 3 | Kit 7 | Status | Fonte | Pode publicar |
| --- | --- | --- | --- | --- | --- | --- |
| Nome editorial | 1 mês | 3 meses | 7 meses | confirmado | Instrução do usuário e identificação do checkout | Sim, apenas quando a seção estiver liberada integralmente |
| Quantidade principal de potes | 1 pote | 3 potes | 5 potes | confirmado | Instrução do usuário e identificação do checkout | Sim, apenas quando a seção estiver liberada integralmente |
| Potes adicionais | Não se aplica | Não se aplica | 2 adicionais | confirmado | Instrução do usuário e identificação do checkout | Sim; não chamar de “grátis” sem aprovação formal |
| Total de potes | 1 | 3 | 7 | confirmado | Cálculo a partir da estrutura confirmada | Sim, apenas quando a seção estiver liberada integralmente |
| Duração indicada | 1 mês | 3 meses | 7 meses | confirmado | Instrução do usuário e identificação do checkout | Sim como duração aproximada calculada |
| Duração calculada | 30 dias | 90 dias | 210 dias | confirmado | 30 dias por frasco auditado × total de potes | Sim como cálculo, sem promessa de resultado |
| Cápsulas totais | 60 | 180 | 420 | confirmado | 60 cápsulas por frasco × total de potes | Sim |
| Preço à vista | Não confirmado | Não confirmado | Não confirmado | pendente | Ausência de confirmação humana; valores visíveis no checkout não foram promovidos | Não |
| Preço parcelado | Não confirmado | Não confirmado | Não confirmado | pendente | Ausente de fonte humana aprovada | Não |
| Número de parcelas | Não confirmado | Não confirmado | Não confirmado | pendente | Ausente de fonte humana aprovada | Não |
| Juros | Não confirmado | Não confirmado | Não confirmado | pendente | Ausente de fonte humana aprovada | Não |
| Preço por pote | Indisponível | Indisponível | Indisponível | bloqueado | Depende de preço confirmado | Não |
| Economia | Indisponível | Indisponível | Indisponível | bloqueado | Depende de preço de referência válido e aprovado | Não |
| Frete | Não confirmado | Não confirmado | Não confirmado | pendente | Fora da documentação aprovada | Não |
| Prazo de entrega | Não confirmado | Não confirmado | Não confirmado | pendente | Fora da documentação aprovada | Não |
| Garantia | Não confirmada | Não confirmada | Não confirmada | pendente | Fora da documentação aprovada | Não |
| Política de troca e reembolso | Documento em `draft` | Documento em `draft` | Documento em `draft` | bloqueado | `src/data/legalDocuments.ts` e auditoria institucional | Não |
| URL candidata | `https://belvitale.pay.yampi.com.br/r/PWJOI4I112` | `https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9` | `https://belvitale.pay.yampi.com.br/r/41CHX4MGPX` | confirmado | Informada pelo usuário e validada tecnicamente | Sim, sem alteração ou parâmetros adicionais |
| Imagem disponível | PNG 290 × 314 px | PNG 290 × 329 px | PNG 290 × 289 px | bloqueado | Miniaturas públicas recuperadas da Yampi | Não; resolução insuficiente |
| Imagem oficial em alta resolução | Ausente | Ausente | Ausente | pendente | Não exposta pelo checkout | Não |
| Direito de uso da imagem | Não confirmado | Não confirmado | Não confirmado | pendente | Documentação de direitos ausente | Não |
| Identificação jurídica suficiente | Incompleta | Incompleta | Incompleta | pendente | CNPJ e SAC confirmados; razão social, endereço e política aplicável pendentes | Não |
| Publicação da oferta | Bloqueada | Bloqueada | Bloqueada | bloqueado | Requisitos essenciais incompletos | Não |

## Validação técnica dos links

| Kit | Resposta inicial | Redirecionamento HTTP observado | Resultado HTTP com redirects | Destino no navegador | Domínio final |
| --- | --- | --- | --- | --- | --- |
| 1 mês | `302 Found` | Mesmo domínio, rota `/cart/items`, preservando a referência `PWJOI4I112` | `200`, três redirects, rota `/cart` | `/checkout?skipToCheckout=1&tokenReference=PWJOI4I112` | `belvitale.pay.yampi.com.br` |
| 3 meses | `302 Found` | Mesmo domínio, rota `/cart/items`, preservando a referência `1E8NNCGJW9` | `200`, três redirects, rota `/cart` | `/checkout?skipToCheckout=1&tokenReference=1E8NNCGJW9` | `belvitale.pay.yampi.com.br` |
| 7 meses | `302 Found` | Mesmo domínio, rota `/cart/items`, preservando a referência `41CHX4MGPX` | `200`, três redirects, rota `/cart` | `/checkout?skipToCheckout=1&tokenReference=41CHX4MGPX` | `belvitale.pay.yampi.com.br` |

- O navegador identificou, respectivamente, “CeluClin 1 Mês (1 pote)”, “CeluClin 3 Meses (3 potes)” e uma opção de 7 meses com cinco potes mais dois.
- O checkout usa a palavra “grátis” na terceira opção. Essa condição promocional permanece bloqueada até confirmação formal e não será usada na copy da seção.
- Não foram adicionados parâmetros aos links candidatos.
- Nenhuma compra, cadastro, cupom ou etapa de pagamento foi executada.
- Nenhum preço observado automaticamente foi transcrito para este documento ou para o código.

## Decisão de publicação

`commercialPublicationReady` deve permanecer `false`. Os três kits têm estrutura e URL confirmadas, mas preço, parcelamento, imagem oficial em alta resolução, direitos, política de troca/reembolso e identificação jurídica suficiente continuam pendentes ou bloqueados.

As miniaturas existentes podem aparecer somente em auditoria interna como arquivos preservados. A interface de desenvolvimento usará composição abstrata, sem ampliar, reconstruir ou simular o produto.

## Resultado da implementação

- `commercialPublicationReady`: `false`.
- Ofertas publicáveis: 0 de 3.
- Ofertas bloqueadas: 3 de 3.
- O preview do build confirmou ausência de seção comercial, preços, CTAs, imagens Yampi e erros no console.
- O estado de desenvolvimento não cria links de checkout enquanto bloqueado.
- Uma fixture fictícia, injetada apenas por testes e pelo script de captura, valida o layout pronto sem entrar no código de produção.
- As funções de preço por pote, total parcelado e economia retornam `null` para dados ausentes, inválidos ou monetariamente inexatos.
- Os eventos `offer_view`, `offer_select` e `checkout_click` permanecem locais, sem rede, cookies, persistência ou dados pessoais.
- Os três links mantêm exatamente as URLs fornecidas e abrem na mesma aba quando a oferta estiver integralmente liberada.
