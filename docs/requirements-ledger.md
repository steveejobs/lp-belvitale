# Requisitos atuais

Atualizado em 15/07/2026. Este documento registra somente contratos vigentes. O historico de rodadas foi removido porque descrevia componentes e estados que nao existem mais.

| ID | Contrato | Estado | Evidencia |
| --- | --- | --- | --- |
| RQ-001 | Hero mobile-first com produto dominante, dois CTAs e fatos 60/2/30 | aprovado | Playwright + capturas finais |
| RQ-002 | Cada asset editorial possui funcao unica na homepage | aprovado | `src/data/assetManifest.ts` + teste de unicidade |
| RQ-003 | Imagens sem numeracao decorativa e sem crop incorreto | aprovado | Playwright nos sete viewports |
| RQ-004 | Resultados separados em celulite, flacidez e gordura localizada | aprovado | dados tipados + galeria |
| RQ-005 | Galeria carrega somente anterior, atual e proxima | aprovado | Playwright |
| RQ-006 | Autoplay pausa fora da viewport, no hover, foco, gesto e aba oculta | aprovado | Playwright |
| RQ-007 | `prefers-reduced-motion` remove autoplay e motion sem ocultar conteudo | aprovado | Playwright + Lighthouse |
| RQ-008 | Rotulo aparece somente em `#rotulo`, com modal e PDF | aprovado | DOM + Playwright |
| RQ-009 | Kits de 1, 3 e 7 meses usam composicoes do packshot real | aprovado no preview | capturas + auditoria comercial |
| RQ-010 | Kit de 3 meses recebe o unico destaque `Mais vendido` autorizado | aprovado | DOM + instrucao do proprietario |
| RQ-011 | Checkouts exatos, mesma aba e somente UTMs permitidas | aprovado no preview | Playwright + navegador limpo |
| RQ-012 | Precos, parcelas, frete, urgencia, estoque e garantia nao sao inventados | aprovado | testes de copy e gate comercial |
| RQ-013 | Tema e motion centralizados em `src/theme/` | aprovado | arquitetura atual |
| RQ-014 | Body mobile >=16 px, alvos >=44 px e nenhum overflow | aprovado | Playwright nos sete viewports |
| RQ-015 | Checkout, canonical e quiz publico permanecem bloqueados em producao | bloqueado corretamente | `npm run test:production` |
| RQ-016 | Preview antes de qualquer deploy | vigente | processo do projeto |

## Validacao corrente

- lint, typecheck e build aprovados;
- 57 testes Playwright aprovados;
- Lighthouse 90/100/100, CLS 0 e TBT 160 ms;
- gate de producao aprovado;
- preview local: `http://127.0.0.1:5173/`.
