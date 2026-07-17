# Lighthouse — `/quiz`

Auditoria executada contra o build otimizado de preview em 16 de julho de 2026.

| Categoria | Nota |
| --- | ---: |
| Performance | 98 |
| Acessibilidade | 100 |
| Boas práticas | 100 |
| SEO | 66 |

- LCP: 1,1 s
- CLS: 0
- TBT: 180 ms

A única reprovação de SEO é `is-crawlable`: o preview permanece intencionalmente com `noindex` enquanto canonical real, conteúdo, regulação, políticas e teste humano não forem aprovados. O relatório bruto está em `lighthouse.json`.
