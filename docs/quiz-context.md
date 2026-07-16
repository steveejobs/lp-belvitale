# Contexto do quiz

O quiz continua implementado, mas sua proxima rodada deve acontecer somente depois da aprovacao visual da homepage.

## Estado atual

- rotas: `/quiz` e `/quiz/resultado`;
- seis perguntas e tres perfis neutros de rotina;
- scoring deterministico, sem IA e sem usar estoque, preco ou quantidade de potes;
- storage local `belvitale:quiz:v1`, schema v2 e expiracao em 30 dias;
- nenhum nome, email, telefone, dado medico ou resposta individual sai do navegador;
- mappings comerciais permanecem pendentes;
- producao exige status literal `approved`, gate regulatorio e canonical real;
- sem aprovacao, a rota permanece `noindex` e fora da navegacao publica.

## Validacao humana pendente

Antes de publicar, observar com participantes anonimos:

1. A pessoa consegue prever o resultado antes do final?
2. Alguma pergunta parece repetida?
3. O perfil final parece coerente com as respostas?
4. O quiz parece empurrar uma compra?
5. Fica claro que nao e diagnostico?

Nao coletar dados pessoais durante esse teste. Mudancas editoriais devem ser feitas em uma rodada propria, sem alterar automaticamente scoring ou ofertas.
