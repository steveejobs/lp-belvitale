# Tema unificado Belvitale

Esta pasta é a única fonte de verdade para cor, espaçamento, elevação, raios e movimento compartilhados pela home, quiz e rotas institucionais.

## Camadas

- `primitives.css`: valores brutos da marca e escalas fundamentais. Não devem ser usados diretamente por componentes.
- `semantic.css`: associa as primitivas a papéis de interface, como superfície, texto, ação e borda; também mantém aliases públicos de compatibilidade.
- `components.css`: tokens de ergonomia e acabamento para controles, cards, mídia, foco e durações.
- `motion.css`: coreografias reutilizáveis de entrada e saída da home, com suporte a movimento reduzido.
- `index.css`: ponto único de importação, carregado por `src/styles.css`.

## Regra de uso

Um componente deve consumir primeiro um token semântico ou de componente. Novas cores brutas entram em `primitives.css`; uma tela não deve criar uma paleta paralela.

As interações primárias mantêm pelo menos 44 px, feedback de pressão em até 100 ms e transições de interface entre 160 e 420 ms. Toda coreografia precisa preservar conteúdo quando `prefers-reduced-motion: reduce` estiver ativo.
