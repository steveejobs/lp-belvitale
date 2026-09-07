# Auditoria comercial vigente

Validacao realizada em navegador limpo, sem compra, cadastro ou preenchimento de dados pessoais.

| Kit | URL informada | Destino validado | Estado |
| --- | --- | --- | --- |
| 1 mes | `https://belvitale.pay.yampi.com.br/r/PWJOI4I112` | token `PWJOI4I112`, produto de 1 pote | correto |
| 3 meses | `https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9` | token `1E8NNCGJW9`, produto de 3 potes | correto |
| 7 meses | `https://belvitale.pay.yampi.com.br/r/41CHX4MGPX` | token `41CHX4MGPX`, produto de 5 + 2 | correto |

## Permitido no preview

- nomes, quantidades, duracoes aproximadas e total de capsulas;
- CTAs em mesma aba;
- apenas `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` e `utm_term`;
- maior presenca visual para o kit de 3 meses, sem alegacao de popularidade;
- expressao `5 potes + 2 gratis`, confirmada pelo proprietario para a oferta atual.

## Reauditoria de 07/09/2026

- preços atuais visíveis: R$ 89,90, R$ 169,90 e R$ 597,00;
- os três carrinhos abriram preenchidos com produto e quantidade corretos;
- preço comparativo e parcelamento não apareceram;
- o kit de 210 dias ficou economicamente dominado pelo kit de 90 dias no custo por frasco e foi retirado da comparação pública.

## Ainda bloqueado

- preço comparativo, parcelas, juros, frete, prazo, estoque, economia, garantia e urgencia;
- republicacao das miniaturas de 290 px recuperadas da Yampi;
- publicacao comercial em producao enquanto dados institucionais, regulatorios e legais estiverem pendentes.

O estado detalhado dos checkouts tambem esta em `src/data/commercialPreview.ts` e `artifacts/final-v2/after/remote-audit.json`.
