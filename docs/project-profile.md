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
- A campanha inclui header responsivo com wordmark oficial, hero com produto autorizado em grande escala, narrativa lifestyle, educação sem culpa, galeria uniforme de produto, provas por solução, leitura ampliável do rótulo e fechamento emocional.
- O build normal publica produto, lifestyle e logos autorizados; kits, checkout e quiz público continuam protegidos pelos gates próprios.
- O gate comercial impede que ofertas incompletas criem DOM em produção. Preços de fixture existem somente nos testes e no script de evidências, fora do bundle público.
- O quiz de rotina usa duas entradas HTML próprias, dados tipados, pontuação pura e armazenamento local sanitizado. Seu status continua bloqueado para produção, mas integra a campanha em desenvolvimento e no preview com flag interna.

## Gerenciador e convenções

- Gerenciador: npm, com `package-lock.json` como lockfile.
- Componentes React em `src/components/`.
- Dados tipados e centralizados em `src/data/`.
- Tokens visuais em propriedades customizadas CSS no início de `src/styles.css`.
- Assets-fonte preservados; derivados normalizados ficam em `public/`.
- As nove provas autorizadas entram no artefato `dist/`. A autorização explícita de 15/07/2026 também libera produto, lifestyle e logos fornecidos para a homepage; kits e checkout continuam removidos do build normal.
- Metadados estáticos incluem apenas fatos confirmados e schema `Organization` mínimo; o canonical depende de `VITE_CANONICAL_URL` válido e não há schema `Product`.
