# Perfil do projeto

## Diagnóstico inicial

- Diretório auditado: `C:\Users\jarde\Downloads\site belvitale`.
- Estado recebido: somente a pasta `galeria belvitale/`, sem aplicação, `package.json`, lockfile, Git ativo, componentes, testes ou convenções existentes.
- Instruções locais: nenhum `AGENTS.md` encontrado.
- Ambiente disponível: Windows/PowerShell, Node.js 24.12.0 e npm; Chrome e Edge instalados.
- Formatos de mídia recebidos: 22 PNGs, 1 PDF e nenhum WebP real. Os nomes terminados em `.webp.png` possuem assinatura PNG.

## Fundação técnica adotada

- Vite + React + TypeScript estrito, por ser uma base pequena e compatível com o escopo interativo solicitado.
- CSS nativo para layout, gestos, transições e reduced motion.
- Sem biblioteca de carrossel, modal ou animação no bundle de produção.
- Playwright apenas em desenvolvimento para validar interações, viewports, console, screenshots e gravações.
- A aplicação contém a campanha editorial da homepage, fórmula e rotina auditadas, provas autorizadas, FAQ factual, encerramento, rodapé, rotas legais controladas, seção pública do rótulo e arquitetura comercial protegida por status.
- A campanha inclui header responsivo, hero com mídia interna grande, narrativa lifestyle, educação sem culpa, palco de produto, capítulos de prova e fechamento emocional.
- O fallback tipado impede que packshot, lifestyle ou logo pendentes sejam renderizados no release normal; o hero permanece completo com um gate visual honesto.
- O gate comercial impede que ofertas incompletas criem DOM em produção. Preços de fixture existem somente nos testes e no script de evidências, fora do bundle público.
- O quiz de rotina usa duas entradas HTML próprias, dados tipados, pontuação pura e armazenamento local sanitizado. Seu status continua bloqueado para produção, mas integra a campanha em desenvolvimento e no preview com flag interna.

## Gerenciador e convenções

- Gerenciador: npm, com `package-lock.json` como lockfile.
- Componentes React em `src/components/`.
- Dados tipados e centralizados em `src/data/`.
- Tokens visuais em propriedades customizadas CSS no início de `src/styles.css`.
- Assets-fonte preservados; derivados normalizados ficam em `public/`.
- As nove provas autorizadas pelo proprietário entram no artefato `dist/`; produto, lifestyle e marca continuam removidos do build normal e disponíveis apenas no preview interno.
- Metadados estáticos incluem apenas fatos confirmados e schema `Organization` mínimo; o canonical depende de `VITE_CANONICAL_URL` válido e não há schema `Product`.
