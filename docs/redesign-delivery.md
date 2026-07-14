# Entrega do redesign editorial CeluClin

Data da validação: 14/07/2026.

Escopo: `/`, `/quiz` e `/quiz/resultado`.

## Tese criativa

Um editorial de beleza íntimo e vivo que devolve espaço à escolha. A experiência reconhece situações concretas — roupa, foto, espelho e constância — sem afirmar que o corpo está errado. CeluClin entra como uma rotina possível, nunca como solução salvadora.

Emoção dominante: **liberdade consciente**.

Headline principal: **Vista o que você quiser. Sem negociar com o espelho.**

Encerramento: **Sua pele não precisa ser perfeita para você voltar a se sentir livre.**

## Sistema visual

O rótulo oficial, a tampa e as cápsulas foram usados como fonte cromática. Amostras observadas: `#EC0791` e `#F823AF` na tampa; `#C3409C`, `#DC9FCC` e `#5A2895` no rótulo; `#990D15` e `#7A173B` nas cápsulas. A escala final, seus contrastes, geometria, motion e regras de aplicação estão em `design-system/belvitale-celuclin/MASTER.md`.

- Display: Newsreader Variable, com romano/itálico editorial e pesos 600–720.
- Conteúdo e interface: Figtree Variable, 430–760, corpo mínimo de 16 px.
- Base: `#FFF8F4`; tinta: `#24101E`; ação: `#D90A73`; vinho: `#5A1837`; rosa e violeta vêm diretamente do rótulo.
- DNA: faixas tensas, máscaras, recortes, sobreposição sólida/transparente e assimetria controlada. Sem glassmorphism, blobs, dourado artificial ou cards repetidos.

A skill UI/UX Pro Max foi instalada localmente e executada com o prompt requerido, `variance: 8`, `motion: 6` e `density: 3`. Sua recomendação inicial de amarelo ácido, roxo, Playfair/Inter, scroll horizontal e GSAP foi rejeitada por não conversar com o frasco, o rótulo ou a carga mobile. Foram incorporados os critérios úteis de alvos, foco, hierarquia, reduced motion, stacking e carregamento.

## Arquitetura entregue

### Home

1. Hero de escolha consciente com headline, categoria, CTA, fórmula, rótulo em grande escala e 60/2/30.
2. Cena editorial de identificação: roupa, foto e insegurança como ocupação da escolha, sem vergonha corporal.
3. Educação que separa celulite de peso, disciplina e causa única.
4. Revelação do CeluClin como rotina, com rótulo oficial e dados factuais.
5. Fórmula tátil por foco, não sete cards iguais.
6. Rotina 60 ÷ 2 = 30 e advertências confirmadas.
7. Rótulo original desenrolável, modal, zoom e PDF.
8. Comparação comercial editorial em desenvolvimento; produção integralmente bloqueada.
9. Direção de prova em desenvolvimento, sem história ou mídia inventada.
10. Convite ao quiz condicionado ao gate.
11. FAQ factual.
12. Encerramento emocional, seguido por dados institucionais e suporte.

### Quiz

Conceito: **Que ritmo faz o cuidado continuar?** Seis interações rápidas usam cartões editoriais, escala, oposição de atitudes e frase para completar. O progresso é desenhado pelas faixas do rótulo. Não há diagnóstico, ranking, emoji, confete, som ou recomendação corporal.

Ângulos das perguntas:

1. como uma rotina nova entra na vida;
2. o que costuma quebrar a constância;
3. como a pessoa reage quando perde um dia;
4. como prefere receber informação;
5. como organiza reposição;
6. qual compromisso parece realista.

Perfis:

- **Começo sem peso:** pouca fricção, essencial primeiro e ajuste durante a prática.
- **Ritmo que volta:** retorno sem punição, pistas visíveis e rotina que sobrevive a dias imperfeitos.
- **Cuidado em curso:** organização antecipada, contexto completo e continuidade planejada.

O scoring preserva o motor puro, mas usa pesos mistos por opção; não existe correspondência A/B/C com 1/3/7 potes. O desempate depende do conjunto de respostas, e diferentes combinações foram testadas. O storage continua em `belvitale:quiz:v1`, schema v2, TTL de 30 dias, sem PII e sem resposta na URL.

`quizRecommendation.ts` só pode devolver uma sugestão de conveniência quando situação regulatória, mapping do perfil e oferta estiverem aprovados. No estado atual devolve `null`. A copy permitida fala em evitar interrupções ou combinar com organização; nunca em eficácia, necessidade de tratamento ou maior resultado.

## Componentes

Substituídos ou reconstruídos: `InstitutionalHero`, `SiteHeader`, `FormulaSection`, `RoutineSection`, `LabelTransparency`, `CommercialSection`, `ProofGallery`, `QuizHomeCta`, `QuizRoute`, `BelvitaleInstitutional`, `SiteFooter` e toda a camada de CSS da home/quiz. `CeluClinIntro` e `TrustBar` foram removidos por redundância.

Criados: `FreedomEditorial`, `EducationSection`, `ProductReveal`, conteúdo central da home, gates regulatório/comercial e recomendação isolada do quiz.

Preservados: React, TypeScript estrito, Vite, dados centrais, cálculo/storage do quiz, chave de storage, fatos institucionais, documentos legais, checkouts exatos, tracking local sem PII, rótulo/PDF aprovados, exclusão de assets restritos e testes úteis. Os antigos hashes visuais foram deliberadamente aposentados; a verdade e os gates, não a interface anterior, são os contratos preservados.

## Gates ativos

- Situação sanitária: `pending`; publicação regulada bloqueada.
- Cúrcuma: bloqueada por conflito documental; sete ingredientes confirmados ficam publicáveis.
- Packshot, lifestyle e prova: bloqueados/pendentes; nenhum arquivo restrito chega ao build público.
- Preço, frete, garantia, condições, política e direitos: pendentes; ofertas e Yampi ausentes da produção.
- Quiz: bloqueado para indexação/publicação; apenas desenvolvimento ou `VITE_INTERNAL_QUIZ=true` permite revisão interna.
- Domínio real: pendente; sem canonical, OG URL ou sitemap fictício.
- `example.test`: ausente do código, build, metadados e scripts públicos.

## Qualidade verificada

- ESLint: aprovado sem warnings.
- TypeScript: aprovado em modo estrito.
- Build Vite: aprovado; home JS 68,69 kB gzip, CSS 7,58 kB gzip; quiz e rótulo em chunks próprios.
- Produção bloqueada: aprovada sem checkout, mídia restrita, canonical, indexação ou erro de runtime.
- Playwright: 49/49, um worker, incluindo teclado, touch, foco, 200%, reduced motion, storage, refresh, retomada, resultado inválido, imagens ausentes, console, rede, URLs e todos os viewports requeridos.
- Lighthouse mobile: Performance 95, Acessibilidade 100, Boas práticas 100, SEO 58 deliberadamente bloqueado; FCP 1,8 s, LCP 2,7 s, Speed Index 2,2 s, TBT 90 ms, CLS 0.
- O HTML crítico sem JavaScript contém headline, categoria, CTA, 60/2/30, rótulo editorial, composição parcial e PDF.

## Evidências

As 17 capturas finais estão em `artifacts/screenshots/`: os 13 enquadramentos solicitados e quatro páginas inteiras (`390x844-home-full`, `1440x900-home-full` e os dois resultados completos).

As cinco gravações finais estão em `artifacts/recordings/`:

- `home-first-60-seconds.webm` — 60,84 s;
- `formula-interaction.webm`;
- `label-interaction.webm`;
- `quiz-complete-flow.webm`;
- `home-to-checkout.webm` — checkout real interceptado localmente, sem requisição externa e com fixture fictícia identificada.

O relatório de Lighthouse está em `artifacts/lighthouse-mobile.json`.

Preview Vercel: `https://lp-belvitale-5xtyl8p0i-bandeirargabriel-6963s-projects.vercel.app`.

O preview não é produção, usa flag interna somente para revisão do quiz, permanece `noindex` e está protegido pela autenticação da equipe Vercel.

## Limitações reais

- Não há packshot oficial autorizado. O rótulo aprovado sustenta a direção editorial; a nota interna deixa o gate visível em desenvolvimento.
- Não há depoimentos, histórias ou prova visual autorizada. A direção existe apenas em desenvolvimento e não cria pessoas fictícias.
- Oferta, preço, parcelamento, frete, garantia, política e direitos continuam bloqueados. Os três checkouts permanecem centralizados e inalterados, mas fora do build público.
- A situação sanitária, o conflito de cúrcuma e o domínio oficial precisam de confirmação documental.
- O LCP móvel medido é 2,7 s: bom desempenho global (95), mas 0,2 s acima do limiar “good” do Core Web Vitals. Reduzir mais exigiria um packshot crítico menor/aprovado ou prerenderização React adicional; não foi escondido com remoção do protagonista.
- O preview Vercel exige login da equipe por política externa do projeto.

## Referências educacionais

A seção educacional foi limitada à distinção entre aparência da celulite e peso/gordura e ao caráter multifatorial, sem extrapolar para toxinas, drenagem, circulação, inflamação ou tratamento. Referências consultadas: revisão clínica em `https://pmc.ncbi.nlm.nih.gov/articles/PMC7515470/` e orientação da American Academy of Dermatology em `https://www.aad.org/public/cosmetic/fat-removal/cellulite-treatments-what-really-works`.
