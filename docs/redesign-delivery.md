# Entrega da campanha Belvitale / CeluClin

Validada em 14/07/2026. Escopo: `/`, `/quiz` e `/quiz/resultado`.

## Preview e evidências

- Preview Vercel interno, `noindex`, sem promoção para produção: `https://lp-belvitale-6dh7wk2mn-bandeirargabriel-6963s-projects.vercel.app`
- 23 capturas finais em `artifacts/screenshots/`, incluindo as duas páginas completas e todos os enquadramentos requeridos em 390 × 844 e 1440 × 900.
- Sete gravações em `artifacts/recordings/`: `home-first-60-seconds.webm`, `home-full-campaign.webm`, `formula-interaction.webm`, `label-interaction.webm`, `results-section.webm`, `quiz-complete-flow.webm` e `home-to-checkout.webm`.
- Lighthouse mobile em `artifacts/lighthouse-mobile.json`.

O preview usa `VITE_INTERNAL_MEDIA=true` e `VITE_INTERNAL_QUIZ=true`, permanece protegido pela autenticação da equipe Vercel e não altera o alias de produção.

## Tese criativa

**Escolha em cena.** Uma campanha editorial móvel em que roupa, pele e rotina entram antes da explicação técnica. A progressão transforma o desconforto silencioso em liberdade consciente: reconhecer, desejar, descobrir, compreender, observar provas, escolher e comprar quando os gates permitirem.

Headline: **A celulite não precisa decidir o que você veste.**

Fechamento: **Sua pele não precisa ser perfeita para você voltar a se sentir livre.**

Três direções foram comparadas internamente — `Vestir o dia`, `Frasco de luz` e `Pele em capítulos`. A direção final combina identificação humana, protagonismo material do frasco e escala documental das provas sem cair em estética clínica, suplemento genérico ou template de cards.

## Design system

O sistema persistido está em `design-system/belvitale-celuclin/MASTER.md` e nas especificações de home, quiz e resultado.

- Paleta derivada do frasco/rótulo/cápsulas: ameixa `#1B0814`, vinho `#3D1029`/`#6A173F`, ação `#C60067`, magenta da tampa `#E6007E`, rosa do rótulo `#C34BA1`, violeta `#5D2E98`, cápsula `#A6141D`, blush `#F7DDE8` e branco quente `#FFF8F3`.
- Tipografia: Fraunces Variable para display editorial; Figtree Variable para leitura, interface e números tabulares.
- Geometria: faixas tensas, recortes oblíquos, mídia fora da grade, sobreposição entre sólido e transparência e capítulos de silhueta diferente.
- Motion: entrada tipográfica, reveal de produto, transição de mídia, progresso narrativo e feedback. Não há loops, biblioteca pesada ou repetição de `fade-up`.

A UI/UX Pro Max foi usada para pesquisa de editorial beauty, tactile digital, kinetic typography, parallax storytelling, hero-centric ecommerce, social proof, premium feminine wellness e mobile-first storytelling. Foram aproveitados seus critérios de toque, foco, reduced motion, hierarquia e performance. A recomendação automática de amarelo/lilás, Playfair + Inter, marquee infinito e pinning longo foi descartada por não nascer do produto.

## Nova arquitetura

### Home

1. Hero assimétrico com frasco dominante, CTA e 60/2/30 na primeira experiência mobile.
2. Sequência lifestyle de roupa, foto e espelho tratada como pensamento humano.
3. Interlúdio magenta que reduz culpa e separa aparência da celulite de peso ou causa única.
4. Palco escuro do produto com vistas reais, cápsulas e fatos de rotina.
5. Fórmula tátil com um ingrediente em foco, quantidade e origem factual.
6. Provas em três capítulos: celulite em trilho editorial, flacidez em díptico e gordura localizada em tríptico.
7. Rótulo desenrolável — único ponto em que a arte plana domina — com zoom, modal e PDF.
8. Rotina desacelerada com produto em mãos.
9. Comparação editorial de kits, preservada atrás do gate comercial.
10. Quiz, FAQ factual e fechamento emocional antes do rodapé legal.

### Quiz

Conceito: **Onde o seu cuidado encontra ritmo?** São seis interações com quatro formatos visuais e progresso baseado nas faixas da marca. Os ângulos cobrem entrada de uma rotina, quebra de constância, reação a um dia perdido, preferência de informação, reposição e compromisso confortável.

Perfis:

- **Começo sem peso:** reduzir fricção e começar pelo essencial.
- **Ritmo que volta:** criar pistas de retorno sem punição.
- **Cuidado em curso:** organizar contexto e continuidade antecipadamente.

O scoring mistura pesos por resposta e desempata pelo conjunto; não existe equivalência A/B/C com 1/3/7 potes. Storage `belvitale:quiz:v1`, schema v2, TTL de 30 dias, retomada sem PII e resultado inválido protegido foram preservados. A recomendação comercial é rotulada **Opção sugerida para o seu ritmo** e só existe quando oferta, mapping e gates estiverem aprovados; hoje retorna `null` fora de fixture de QA.

## Componentes

Criados: `CampaignHero`, `ChoiceSequence`, `ProductStory`, `ProofStories`, `CampaignClosing`, conteúdo central de campanha e mapas tipados de assets/provas.

Reconstruídos: `EducationSection`, `FormulaSection`, `RoutineSection`, `LabelTransparency`, `CommercialSection`, `QuizHomeCta`, `QuizRoute`, `SiteHeader`, `SiteFooter` e toda a camada CSS da home/quiz.

Removidos por não servirem à nova narrativa: `InstitutionalHero`, `FreedomEditorial`, `ProductReveal`, `ProofGallery` e `BelvitaleInstitutional`.

Preservados: React, TypeScript estrito, Vite, fatos e dados centralizados, storage/cálculo do quiz, privacidade, rótulo/PDF, documentos legais, checkouts Yampi exatos, gates de build, tracking sem PII e testes úteis.

## Assets e prova

O mapa completo está em `docs/campaign-asset-map.md`.

- Produto frontal: hero e introdução; produto em ângulo: desejo/transição; produto na mão: rotina; cápsulas: fórmula; lifestyle: identificação; kits: somente com confirmação comercial; rótulo plano: apenas `#rotulo`.
- As nove imagens de prova foram marcadas `owner-authorized`, preservadas sem retoque e publicadas somente na categoria recebida. Não se infere pessoa, data, duração, cronologia ou relação antes/depois.
- Nota junto às provas: **Resultados reais autorizados. Experiências individuais podem variar.**
- O original do frasco foi preservado. Um derivado AVIF de 640 px/11 KB e fallback WebP de 16 KB atendem o hero mobile sem alterar conteúdo ou enquadramento.

## Gates ativos e limitações reais

- As fotos de produto contêm texto miúdo divergente do rótulo oficial; por isso continuam `internal-review`, recebem nota visível no preview e são removidas fisicamente do build normal.
- Lifestyle e logos ainda dependem de procedência/direitos; ficam restritos ao preview interno.
- Situação sanitária permanece pendente. Cúrcuma continua bloqueada por conflito documental; sete ingredientes confirmados podem ser exibidos.
- Preços, parcelamento, frete, garantia, política comercial, imagens de kit e identidade empresarial ainda não têm confirmação completa. Nenhuma oferta ou URL Yampi entra no build normal.
- Não há depoimentos textuais autorizados; a prova publicada é exclusivamente a mídia expressamente autorizada pelo proprietário.
- Domínio canônico real não foi confirmado. Preview e quiz seguem `noindex`; não há canonical, OG URL ou sitemap fictício.

## QA e performance

- ESLint: aprovado sem warnings.
- TypeScript estrito: aprovado.
- Build e verificador de release: aprovados; mídia de produto/lifestyle/marca, oferta, checkout, canonical e quiz público continuam ausentes do build normal.
- Playwright: 49/49 em teclado, touch, foco, texto a 200%, reduced motion, storage, refresh, retomada, resultado inválido, imagens ausentes, console, rede, UTMs/checkouts e sete viewports.
- Viewports: 360 × 800, 375 × 812, 390 × 844, 412 × 915, 430 × 932, 1366 × 768 e 1440 × 900.
- Lighthouse mobile: Performance 89, Acessibilidade 100, Boas práticas 100 e SEO 58 deliberadamente limitado por `noindex` e ausência de canonical; FCP 1,65 s, LCP 3,25 s, Speed Index 2,10 s, TBT 183 ms e CLS 0.
- Main CSS: aproximadamente 40,4 kB bruto/8,6 kB gzip. Main JS do preview: 219,1 kB bruto/67,9 kB gzip; quiz, provas, rótulo e comercial em chunks próprios.
- O frasco é o LCP do preview interno. Ele foi mantido como protagonista; preload responsivo, AVIF, `content-visibility` abaixo da dobra e uma entrada de 520 ms reduziram o custo sem apagar a direção criativa.

O erro `EPERM` emitido pelo launcher do Chrome ocorreu somente ao remover seu diretório temporário no Windows, depois de o relatório JSON ser gravado integralmente; o conteúdo do Lighthouse foi validado e é legível.
