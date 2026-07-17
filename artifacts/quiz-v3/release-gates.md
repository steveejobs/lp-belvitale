# Gates de publicação do quiz Belvitale v3

## Concluído nesta rodada

- Implementação restrita a `/quiz` e `/quiz/resultado` e infraestrutura direta do quiz.
- Build local e remoto aprovados.
- Lint e TypeScript aprovados.
- Playwright: 64/64 testes globais aprovados.
- 4.096 combinações completas validadas.
- Todos os perfis, planos e caminhos adaptativos alcançáveis.
- Checkouts técnicos 30, 90 e 210 dias acessíveis e identificados.
- Acessibilidade Lighthouse 100; teclado, foco, 200% e reduced motion cobertos por teste.
- Preview Vercel publicado sem promoção para produção.

## Pendente antes de produção

- Canonical com o domínio real aprovado.
- Inclusão de `/quiz` no sitemap somente depois da aprovação global; `/quiz/resultado` deve permanecer fora e com `noindex`.
- Aprovação final de conteúdo e regulação.
- Políticas necessárias publicadas.
- Integração externa de analytics condicionada ao consentimento aplicável.
- Validação humana com cinco mulheres e aprovação de todos os critérios mínimos.
- Revisão comercial explícita antes de reproduzir “5 + 2 grátis”, embora a condição tenha sido encontrada no checkout de 210 dias na auditoria técnica.

**Decisão atual:** preview aprovado tecnicamente; produção bloqueada pelos gates acima.
