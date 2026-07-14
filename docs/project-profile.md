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
- A aplicação contém a fundação institucional da homepage, fórmula e rotina auditadas, FAQ factual, seção da Belvitale, rodapé, rotas legais controladas, galeria interna bloqueada em desenvolvimento, seção pública do rótulo e arquitetura comercial protegida por status.
- A fundação institucional inclui header responsivo, hero sem packshot, barra factual e introdução “O que é o CeluClin”.
- O fallback tipado impede que packshot ou logo pendentes sejam renderizados; o hero permanece completo com composição abstrata própria.
- O gate comercial impede que ofertas incompletas criem DOM em produção. Preços de fixture existem somente nos testes e no script de evidências, fora do bundle público.
- O quiz de rotina usa duas entradas HTML próprias, dados tipados, pontuação pura e armazenamento local sanitizado. Seu status continua `development`, portanto não aparece na homepage nem libera perguntas em produção sem flag interna.

## Gerenciador e convenções

- Gerenciador: npm, com `package-lock.json` como lockfile.
- Componentes React em `src/components/`.
- Dados tipados e centralizados em `src/data/`.
- Tokens visuais em propriedades customizadas CSS no início de `src/styles.css`.
- Assets-fonte preservados; derivados normalizados ficam em `public/`.
- Assets de prova são removidos do artefato `dist/` no build de produção, embora permaneçam disponíveis no servidor de desenvolvimento.
- Metadados estáticos incluem apenas fatos confirmados e schema `Organization` mínimo; o canonical depende de `VITE_CANONICAL_URL` válido e não há schema `Product`.
