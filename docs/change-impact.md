# Impacto da reconstrução editorial de 14/07/2026

Esta rodada substitui os contratos de preservação visual e hashes registrados nas rodadas históricas abaixo. A autorização foi reconstruir a camada visual, narrativa e experiencial, preservando verdade, dados, gates, privacidade, acessibilidade, checkouts e infraestrutura saudável.

- Checkpoint imediatamente anterior a esta reconstrução: commit `59ecbcf`; checkpoint original antes da primeira exploração: `4d538aa`.
- Home, quiz e resultado foram recompostos novamente. `InstitutionalHero`, `FreedomEditorial`, `ProductReveal`, `ProofGallery` e `BelvitaleInstitutional` foram aposentados; os novos componentes de campanha assumem seus papéis sem preservar hashes visuais.
- Novos contratos centrais: `campaignAssets`, autorização em `proofGallery`, `homeContent`, gates regulatório/comercial, `quizRecommendation` e design system persistido.
- O rótulo plano foi removido do hero e de toda decoração. Seu antigo derivado de hero foi apagado; a arte só aparece em `#rotulo`, no modal e no PDF.
- As nove provas receberam autorização expressa nesta rodada e entram no build, nas categorias celulite, flacidez e gordura localizada. Produto, cápsulas, lifestyle e logos continuam em revisão e só aparecem no preview interno.
- Ofertas permanecem como direção interna sem preço ou checkout; os links Yampi exatos continuam centralizados e protegidos.
- Perguntas e pesos do quiz mudaram; scoring puro, storage, privacidade, rotas e recuperação foram preservados.
- HTML crítico, lazy loading, preloads latinos, content visibility e code splitting foram revistos.
- Evidências antigas serão substituídas pelas capturas, páginas inteiras e gravações da campanha corrente antes do commit final.
- Resultado final e limitações: `docs/redesign-delivery.md`.

# Impacto da rodada institucional

Registrado antes da implementação em 14/07/2026.

## Escopo autorizado

- Adicionar header, navegação responsiva, hero, barra compacta de confiança e introdução “O que é o CeluClin”.
- Ampliar tokens visuais, SEO básico, fallback sem JavaScript, testes e artefatos de validação.
- Reposicionar a galeria interna e a seção do rótulo depois da nova fundação institucional, sem alterar seus componentes ou contratos.

## Arquivos com impacto previsto

- `src/App.tsx`: composição da nova ordem da página.
- Novos componentes institucionais em `src/components/`.
- Novo registro tipado de assets em `src/data/`.
- `src/styles.css`: somente novos tokens e seletores institucionais; seletores da galeria/rótulo devem permanecer funcionalmente inalterados.
- `index.html`: metadados confirmados e fallback institucional sem JavaScript.
- `scripts/capture-artifacts.mjs` e testes: novas evidências e cenários.

## Áreas preservadas

- `src/components/ProofGallery.tsx`.
- `src/components/LabelTransparency.tsx`.
- `src/data/proofGallery.ts`.
- Assets originais e derivados existentes.
- Dependências e versões do `package.json`.
- Bloqueio de `proof`, `product`, `lifestyle` e `brand` no build de produção.

## Decisões de segurança de conteúdo

- O monograma e os wordmarks permanecem `brand-review`; o header usará texto, não imagem.
- O packshot permanece `blocked`; o hero usará composição abstrata.
- Fotos lifestyle permanecem `illustrative-only` e não serão consumidas nesta rodada.
- O rótulo continua sendo o único asset visual aprovado para produção.
- Nenhum schema `Product`, preço, disponibilidade, fabricante ou condição comercial será adicionado.

## Riscos controlados

- Altura da primeira dobra: validar CTA e aviso nos três viewports mobile.
- Menu mobile: validar Escape, foco, scroll e retorno ao botão.
- Regressão visual: manter testes anteriores da galeria/rótulo e adicionar testes institucionais.
- Navegação para conteúdo futuro: “Dúvidas” terá destino factual dentro da introdução, sem criar FAQ ou placeholder visível.

## Resultado implementado

- `src/App.tsx` passou a integrar header, hero, barra factual e introdução antes da galeria interna e do rótulo.
- Novos componentes: `SiteHeader`, `InstitutionalHero`, `TrustBar`, `CeluClinIntro` e `SeoMetadata`.
- Novos contratos: `src/config/site.ts`, `src/data/siteAssets.ts` e `src/vite-env.d.ts`.
- `src/styles.css` recebeu tokens e seletores institucionais; os seletores existentes da galeria e do rótulo não tiveram seus contratos alterados.
- `index.html` recebeu metadados confirmados, `Organization` mínimo e fallback estático sem JavaScript.
- O build de produção exclui as mídias `proof`, `product`, `lifestyle` e `brand`, não referencia packshot e não publica schema `Product`.

## Integridade das áreas preservadas

- `ProofGallery.tsx`: SHA-256 `934F758577D367BF5EDA80733394AB0669EEA6A0BF7CEEFCA2F41D0A2A28C451`.
- `LabelTransparency.tsx`: SHA-256 `47BC104ECA311C0705041176A79542FCA53C17A9AEA6EE8ADFC017F4A5C93F80`.
- `proofGallery.ts`: SHA-256 `A4B7DDB1F6A85B5E4A2B2D57D0620F6F357EB8EC863295F9867E05EACCFCCC04`.
- Os hashes coincidem com os registrados antes da implementação.

## Validação concluída

- 20 testes Playwright aprovados em 360 × 800, 390 × 844, 430 × 932, 1366 × 768 e 1440 × 900.
- CTA principal validado na primeira dobra dos três viewports mobile.
- Menu, Escape, foco, scroll, reduced motion, 200% de texto, JavaScript desabilitado, lazy loading e ausência de overflow validados.
- Lint, typecheck, build e verificação do bundle de produção aprovados.
- Quatro screenshots institucionais e `artifacts/recordings/mobile-menu.webm` gerados e inspecionados.

## Impacto planejado — composição e rotina

Registrado antes da implementação em 14/07/2026.

- `src/App.tsx`: inserir fórmula e rotina após a introdução; mover somente a posição da galeria de desenvolvimento para depois do rótulo.
- `src/data/productFacts.ts`: centralizar fatos, status, origem e cálculo de duração.
- Novos componentes institucionais de fórmula e rotina, sem imagens ou dependências.
- `src/styles.css`: adicionar apenas seletores locais das novas seções e da integração por hash; tokens existentes permanecem inalterados.
- `index.html`: ampliar somente o fallback `<noscript>` com a mesma seleção factual auditada.
- `LabelTransparency.tsx`: nenhuma mudança na lógica do modal; a transferência de foco será feita pelo link da fórmula.
- Testes e captura: cobrir os três estados de composição, cálculo, foco, acessibilidade, viewports e evidências.

### Arquivos protegidos antes da implementação

- `SiteHeader.tsx`: SHA-256 `EBB7C4BD11C9A227F610068B2AE778FC495D5688E8DC1CEAC98A8B4A9F399050`.
- `InstitutionalHero.tsx`: SHA-256 `CA197CF971FBD456CB0E5ACD05E998B1098A7F8F74B38C47215B6B617871766F`.
- `TrustBar.tsx`: SHA-256 `8665253887F99618A39EED07C502ECD1EEAE8A5405D4D08474DADD8DC145F8B4`.
- `CeluClinIntro.tsx`: SHA-256 `08BB5767D39DE3E6AE9A93DB96F3A81ECF4C3063F0D452B7C3A67D6A9289A97F`.
- `ProofGallery.tsx`: SHA-256 `934F758577D367BF5EDA80733394AB0669EEA6A0BF7CEEFCA2F41D0A2A28C451`.
- `proofGallery.ts`: SHA-256 `A4B7DDB1F6A85B5E4A2B2D57D0620F6F357EB8EC863295F9867E05EACCFCCC04`.
- `LabelTransparency.tsx`: SHA-256 `47BC104ECA311C0705041176A79542FCA53C17A9AEA6EE8ADFC017F4A5C93F80`.

## Resultado — composição e rotina

- `docs/formula-audit.md` registra a inspeção visual do PDF e do WebP do rótulo contra a fonte textual, sem tratar OCR como fonte definitiva.
- `src/data/productFacts.ts` centraliza ingredientes, uso, advertências, status de validação e o cálculo puro da duração.
- `FormulaSection.tsx` publica sete ingredientes confirmados, omite cúrcuma e valores diários divergentes/ausentes e cobre estados integral, parcial e bloqueado sem placeholders.
- `RoutineSection.tsx` apresenta somente a sugestão de uso, conteúdo, público, advertências coincidentes e duração calculada a partir do modelo central.
- `App.tsx` adota a ordem introdução → fórmula → rotina → rótulo → galeria interna, sem duplicar o modal.
- `index.html` preserva o mesmo conteúdo factual como fallback sem JavaScript; metadados e SEO permaneceram inalterados.
- `src/styles.css` recebeu apenas seletores locais para as duas seções e o destaque de foco/hash do rótulo; nenhum token global foi alterado.
- Não foram adicionadas dependências ou imagens.

### Divergências bloqueadas

- “Extrato de Rizoma de Cúrcuma (Curcumina)” no rótulo versus “extrato de cúrcuma” na fonte textual: linha inteira não publicada.
- Valores diários de vitamina C e zinco: presentes apenas no rótulo, não republicados.
- Ingredientes/excipientes integrais, armazenamento e orientação para não exceder a dose: presentes apenas no rótulo, mantidos somente na arte original.
- Orientação ampla sobre alimentação equilibrada, condições de saúde e medicamentos: ausente das fontes auditadas; substituída pelo fallback neutro autorizado.

### Integridade confirmada

- Header, hero, barra de confiança e introdução mantêm exatamente os hashes registrados antes da rodada.
- `ProofGallery.tsx`, `proofGallery.ts` e `LabelTransparency.tsx` também mantêm exatamente os hashes registrados.
- A galeria continua condicionada a desenvolvimento e nenhuma prova visual é incluída no bundle de produção.

### Evidências e qualidade

- Screenshots gerados em 390 × 844 e 1440 × 900 para fórmula e rotina.
- Gravação `artifacts/recordings/formula-to-label.webm` validada em 390 × 844, com 4,84 s de duração.
- Uma execução integral limpa do Playwright aprovou 35 de 35 testes nas cinco larguras exigidas.
- Lint, typecheck, build e verificação do bundle de produção foram aprovados sobre o estado final desta rodada.

## Impacto planejado — FAQ, marca, rodapé e estrutura legal

Registrado antes da implementação em 14/07/2026.

- Novos modelos tipados para fatos institucionais, FAQ e status dos documentos legais.
- Novos componentes para FAQ, apresentação da Belvitale, rodapé e rotas legais internas.
- `src/App.tsx`: adicionar somente as novas áreas depois do rótulo e manter a galeria bloqueada em desenvolvimento.
- `src/styles.css`: adicionar seletores locais; nenhum token ou seletor funcional das áreas aprovadas será alterado.
- `index.html`: ampliar o fallback `<noscript>` e preservar metadados/schema existentes da homepage.
- `scripts/capture-artifacts.mjs`, verificação de produção e testes: incluir as novas evidências e bloqueios.
- `package.json`, dependências, lógica de assets, analytics e schemas permanecem inalterados.

### Dados recebidos e escopo de publicação

- CNPJ `61.493.515/0001-65`: fornecido pelo usuário e com dígitos verificadores válidos.
- SAC `(63) 99108-1785`: fornecido pelo usuário; não será identificado como WhatsApp.
- Razão social, nome fantasia jurídico, e-mail, endereço, cidade, estado, fabricante, responsável técnica, domínio e prazo de resposta permanecem fora da interface.
- Os três kits e suas miniaturas Yampi foram auditados, mas permanecem fora da aplicação nesta rodada.

### Arquivos protegidos antes da implementação

- `SiteHeader.tsx`: SHA-256 `EBB7C4BD11C9A227F610068B2AE778FC495D5688E8DC1CEAC98A8B4A9F399050`.
- `InstitutionalHero.tsx`: SHA-256 `CA197CF971FBD456CB0E5ACD05E998B1098A7F8F74B38C47215B6B617871766F`.
- `TrustBar.tsx`: SHA-256 `8665253887F99618A39EED07C502ECD1EEAE8A5405D4D08474DADD8DC145F8B4`.
- `CeluClinIntro.tsx`: SHA-256 `08BB5767D39DE3E6AE9A93DB96F3A81ECF4C3063F0D452B7C3A67D6A9289A97F`.
- `FormulaSection.tsx`: SHA-256 `E305A8E872AD8BDCC50571EB2EDA9D74B896FCC980F3A474E3459702DAA5D821`.
- `RoutineSection.tsx`: SHA-256 `759448BDB61E47B1A36E9E12706150E213A9DD585C2669900E1E50FEE5E16FCC`.
- `LabelTransparency.tsx`: SHA-256 `47BC104ECA311C0705041176A79542FCA53C17A9AEA6EE8ADFC017F4A5C93F80`.
- `ProofGallery.tsx`: SHA-256 `934F758577D367BF5EDA80733394AB0669EEA6A0BF7CEEFCA2F41D0A2A28C451`.
- `proofGallery.ts`: SHA-256 `A4B7DDB1F6A85B5E4A2B2D57D0620F6F357EB8EC863295F9867E05EACCFCCC04`.
- `productFacts.ts`: SHA-256 `45104DABF84B9E410ED1D43ADA60C7E4AF2C894DE2CA85993CC511612F170DF6`.
- `siteAssets.ts`: SHA-256 `BA412D15C713C3EAE4C7DEE3B98D2AB87E7C052D01ED9EFACE4D248BB6E919A0`.
- `SeoMetadata.tsx`: SHA-256 `9660E035BE80F75D7033AE7B139BEC40B6148A23114852C7D7CD395643924A78`.

## Resultado — arquitetura comercial controlada

- `src/data/commercialOffers.ts` centraliza as três estruturas, URLs, status de preço, checkout, conteúdo, imagem, direitos e publicação.
- `canPublishOffer` exige oferta confirmada, URL HTTPS válida no host esperado, conteúdo confirmado, preço e parcelamento completos, mídia aprovada e direito de uso confirmado.
- `commercialPublicationReady` também exige política de trocas/reembolso `approved` e identificação jurídica suficiente `confirmed`; o valor atual é `false`.
- `CommercialSection.tsx` entra na ordem rótulo → kits → galeria interna → FAQ somente em desenvolvimento. O build público não renderiza a seção enquanto bloqueada.
- O estado bloqueado mostra apenas fatos já confirmados em ambiente interno, sem preço, CTA ou imagem. A fixture pronta usa valores fictícios claramente identificados e é injetada fora de `src/`.
- Os CTAs futuros preservam as URLs Yampi, abrem na mesma aba e registram eventos locais antes da navegação, sem modal, popup ou captura de e-mail.
- `calculatePricePerBottle`, `calculateInstallmentTotal` e `calculateVerifiedSavings` operam em centavos exatos e retornam `null` para entradas inválidas, ausentes ou inexatas.
- `src/commerce/commerceEvents.ts` prepara `offer_view`, `offer_select` e `checkout_click` por subscribers e evento local do navegador; não há analytics externo, cookies ou armazenamento.
- Nenhuma miniatura de 290 px foi movida para `public/`, carregada, ampliada ou incluída no build. Nenhum packshot ou kit foi reconstruído.
- Nenhum preço observado no checkout foi transcrito. A palavra promocional “grátis” permanece bloqueada; a estrutura usa “2 adicionais”.
- A verificação HTTP confirmou `302 Found` inicial, fluxo no mesmo domínio e destino final no navegador em `belvitale.pay.yampi.com.br/checkout`, preservando cada `tokenReference`.

### Integridade e evidências

- Os 18 arquivos protegidos mantêm exatamente os hashes registrados antes da implementação.
- Header, hero, barra, introdução, fórmula, rotina, rótulo, galeria, FAQ, seção institucional, rodapé, rotas legais, assets e SEO não foram alterados.
- Screenshots gerados e inspecionados: estados bloqueado e fixture pronta em 390 × 844 e 1440 × 900.
- Gravação `artifacts/recordings/commercial-selection.webm` gerada em 390 × 844, com foco, seleção e CTA interceptado apenas durante a captura.
- Lint e typecheck aprovados; build Vite aprovado com 41 módulos e sem novas dependências.
- O verificador de produção abriu o build em navegador e confirmou zero seção comercial, zero CTA Yampi, zero miniatura Yampi e console limpo.
- Uma execução Playwright integral e limpa aprovou 74 de 74 testes, com um único worker, em 2,8 min.

## Impacto planejado — fundação do quiz

Registrado antes da implementação em 14/07/2026.

- Criar apenas dados, pontuação, persistência, apresentação e entradas HTML próprias do quiz.
- `src/App.tsx` receberá somente o despacho das duas novas rotas; a árvore JSX da homepage permanecerá idêntica.
- `vite.config.ts` receberá entradas multipágina para garantir fallback sem JavaScript específico.
- O CSS do quiz ficará em arquivo isolado e não alterará tokens ou seletores da homepage.
- Nenhum link será adicionado ao header, homepage, rodapé ou sitemap.
- Nenhum checkout, preço, mapping aprovado, evento comercial, analytics, pixel, lead ou dado pessoal será adicionado.

### Integridade antes da implementação

- `SiteHeader.tsx`: SHA-256 `EBB7C4BD11C9A227F610068B2AE778FC495D5688E8DC1CEAC98A8B4A9F399050`.
- `InstitutionalHero.tsx`: SHA-256 `CA197CF971FBD456CB0E5ACD05E998B1098A7F8F74B38C47215B6B617871766F`.
- `TrustBar.tsx`: SHA-256 `8665253887F99618A39EED07C502ECD1EEAE8A5405D4D08474DADD8DC145F8B4`.
- `CeluClinIntro.tsx`: SHA-256 `08BB5767D39DE3E6AE9A93DB96F3A81ECF4C3063F0D452B7C3A67D6A9289A97F`.
- `FormulaSection.tsx`: SHA-256 `E305A8E872AD8BDCC50571EB2EDA9D74B896FCC980F3A474E3459702DAA5D821`.
- `RoutineSection.tsx`: SHA-256 `759448BDB61E47B1A36E9E12706150E213A9DD585C2669900E1E50FEE5E16FCC`.
- `LabelTransparency.tsx`: SHA-256 `47BC104ECA311C0705041176A79542FCA53C17A9AEA6EE8ADFC017F4A5C93F80`.
- `ProofGallery.tsx`: SHA-256 `934F758577D367BF5EDA80733394AB0669EEA6A0BF7CEEFCA2F41D0A2A28C451`.
- `FaqSection.tsx`: SHA-256 `7ACCCAD4A2193E18A3936A113227FDD556DBE844C99DF3FE3B494623E30E9A59`.
- `BelvitaleInstitutional.tsx`: SHA-256 `C48E9769CB7CD602DE05231FDAD99E67C20BFAA89F23306B8E992FA825AE8BBA`.
- `SiteFooter.tsx`: SHA-256 `FFB0EB48B161D003BFFD042892C7251CD22E776DD7E9A78EB63DBB09122E6491`.
- `LegalDocumentRoute.tsx`: SHA-256 `F60143ED7375F9FAD2D3790F1606F0082755D2550AEC528AC1B7B55D2A010A16`.
- `CommercialSection.tsx`: SHA-256 `3FE9BEF03AE5DAA790FF0F71B4BE7EA166181F1CADD5CDED75571C32F3505AB3`.
- `commercialOffers.ts`: SHA-256 `00E1AB2BC963452C241B5B4C809F3BF978B1B398359FDDEEE3DDE1706B900CFF`.
- `commerceEvents.ts`: SHA-256 `F4B7540ECD41AC4DEE6C397A647BC670AE1B9A53B5FD45913FBAC06FC1A76B3C`.
- `legalDocuments.ts`: SHA-256 `B23FAF39BA8AB0B5A11AC34289F5A9E09EE4DCA9B97D59628908ACB954D52DA8`.
- `SeoMetadata.tsx`: SHA-256 `9660E035BE80F75D7033AE7B139BEC40B6148A23114852C7D7CD395643924A78`.
- `index.html`: SHA-256 `07512E2D551237328C06E1E6034EA7349F384C1ECDCF67D7159A0A3407CABBA5`.

## Resultado — fundação do quiz

- Foram criadas as rotas multipágina `/quiz` e `/quiz/resultado`, ambas reconhecendo também a variante com barra final.
- `src/App.tsx` recebeu somente um despacho antecipado para essas rotas; a árvore da homepage não foi modificada.
- `src/data/quizQuestions.ts` centraliza seis perguntas e 18 opções; `src/data/quizProfiles.ts` centraliza os três perfis neutros.
- `src/quiz/quizScoring.ts` contém o cálculo puro 2/0/0, resultado determinístico e desempate pela sexta pergunta.
- `src/quiz/quizStorage.ts` sanitiza e persiste somente IDs, etapa, perfil e data em `belvitale:quiz:v1`.
- `src/data/quizPublication.ts` mantém status `development` e três mappings comerciais `pending`, sem `offerId`.
- `QuizRoute.tsx` implementa início, uma pergunta por etapa, voltar, alterar, retomar, concluir e recomeçar com foco controlado.
- O resultado apresenta descrição, três características, próximo passo neutro, composição e reinício; não contém oferta, preço ou checkout.
- O CSS está isolado em `src/quiz/quiz.css`; nenhum token ou seletor da homepage foi alterado.
- `quiz/index.html` e `quiz/resultado/index.html` fornecem fallback específico sem JavaScript, `noindex, nofollow`, sem schema ou canonical.
- O preview de produção mantém o quiz interativo indisponível enquanto o status não for aprovado; `VITE_INTERNAL_QUIZ=true` é a única exceção técnica prevista.
- Não foram adicionados dependências, imagens, dados pessoais, analytics, pixels, cookies, eventos comerciais ou requisições de resposta.

### Evidências do quiz

- Screenshots gerados e inspecionados para início, pergunta e resultado em 390 × 844 e 1440 × 900.
- Gravações geradas em 390 × 844 para fluxo completo e retomada após refresh.
- O arquivo direcionado do quiz aprovou 25 de 25 testes antes da suíte integral.
- A validação final foi executada em uma única sequência limpa: lint, typecheck, build, verificação do preview de produção e Playwright.
- O build Vite processou 53 módulos e gerou entradas próprias para `/quiz` e `/quiz/resultado`.
- O verificador de produção confirmou quiz e ofertas bloqueados, sem checkout ou mídia comercial.
- A suíte Playwright integral aprovou 99 de 99 testes, com um único worker, em 3,4 min.
- Os 18 arquivos protegidos mantiveram exatamente os hashes SHA-256 registrados antes da implementação.

## Impacto planejado — validação final e publicação controlada do quiz

Registrado antes da implementação em 14/07/2026.

- Perguntas, opções, pesos, perfis e cálculo permanecerão byte a byte inalterados.
- A chave `belvitale:quiz:v1` será preservada; o documento armazenado receberá versão, timestamp técnico, expiração e migração do formato legado.
- `src/data/quizPublication.ts` continuará centralizando tipos e mappings; uma configuração de ambiente separará aprovação explícita de desenvolvimento e bloqueio.
- `QuizRoute.tsx` receberá somente SEO por status, estado de resultado inválido e eventos locais sem respostas.
- `src/App.tsx` receberá um único componente de CTA antes do FAQ; nenhuma seção existente será editada.
- O CTA terá CSS isolado, sem alterar tokens ou seletores das seções aprovadas.
- `vite.config.ts` controlará sitemap e metadados HTML a partir do mesmo valor literal `approved`; nenhum valor booleano habilitará publicação.
- O verificador de produção validará separadamente builds bloqueado e aprovado.

### Integridade antes da implementação

- `src/data/quizQuestions.ts`: SHA-256 `11FA8D7BD93E100CC47CB23AD410118692AE447690A09CB669F41E4BF49C8491`.
- `src/data/quizProfiles.ts`: SHA-256 `05AA960FF311F14C5E51B566F381506B852E473EE27F7EC374BBAB071BD1A9A9`.
- `src/quiz/quizScoring.ts`: SHA-256 `563FC2C49A20B77A866B6E2E569F9177041C00D06204891E3F3C147E4E8C6AF5`.
- `src/data/commercialOffers.ts`: SHA-256 `00E1AB2BC963452C241B5B4C809F3BF978B1B398359FDDEEE3DDE1706B900CFF`.
- `src/commerce/commerceEvents.ts`: SHA-256 `F4B7540ECD41AC4DEE6C397A647BC670AE1B9A53B5FD45913FBAC06FC1A76B3C`.
- `src/components/SiteHeader.tsx`: SHA-256 `EBB7C4BD11C9A227F610068B2AE778FC495D5688E8DC1CEAC98A8B4A9F399050`.
- `src/components/InstitutionalHero.tsx`: SHA-256 `CA197CF971FBD456CB0E5ACD05E998B1098A7F8F74B38C47215B6B617871766F`.
- `src/components/TrustBar.tsx`: SHA-256 `8665253887F99618A39EED07C502ECD1EEAE8A5405D4D08474DADD8DC145F8B4`.
- `src/components/CeluClinIntro.tsx`: SHA-256 `08BB5767D39DE3E6AE9A93DB96F3A81ECF4C3063F0D452B7C3A67D6A9289A97F`.
- `src/components/FormulaSection.tsx`: SHA-256 `E305A8E872AD8BDCC50571EB2EDA9D74B896FCC980F3A474E3459702DAA5D821`.
- `src/components/RoutineSection.tsx`: SHA-256 `759448BDB61E47B1A36E9E12706150E213A9DD585C2669900E1E50FEE5E16FCC`.
- `src/components/LabelTransparency.tsx`: SHA-256 `47BC104ECA311C0705041176A79542FCA53C17A9AEA6EE8ADFC017F4A5C93F80`.
- `src/components/ProofGallery.tsx`: SHA-256 `934F758577D367BF5EDA80733394AB0669EEA6A0BF7CEEFCA2F41D0A2A28C451`.
- `src/components/FaqSection.tsx`: SHA-256 `7ACCCAD4A2193E18A3936A113227FDD556DBE844C99DF3FE3B494623E30E9A59`.
- `src/components/BelvitaleInstitutional.tsx`: SHA-256 `C48E9769CB7CD602DE05231FDAD99E67C20BFAA89F23306B8E992FA825AE8BBA`.
- `src/components/SiteFooter.tsx`: SHA-256 `FFB0EB48B161D003BFFD042892C7251CD22E776DD7E9A78EB63DBB09122E6491`.
- `src/components/LegalDocumentRoute.tsx`: SHA-256 `F60143ED7375F9FAD2D3790F1606F0082755D2550AEC528AC1B7B55D2A010A16`.
- `src/components/CommercialSection.tsx`: SHA-256 `3FE9BEF03AE5DAA790FF0F71B4BE7EA166181F1CADD5CDED75571C32F3505AB3`.

## Resultado — validação final e publicação controlada do quiz

- `docs/quiz-content-review.md` registra a função, sobreposição e risco das seis perguntas. As perguntas 2 e 4 permanecem pendentes de teste humano e a pergunta 5 foi marcada como redundante, sem qualquer alteração automática.
- `docs/quiz-user-test-script.md` contém as cinco perguntas de validação solicitadas e orienta aplicação fora do site público, sem dados pessoais.
- `quizPublicationApproved` depende exclusivamente de `VITE_QUIZ_PUBLICATION_STATUS === "approved"`. Valores como `true`, `1` ou ausência de valor não publicam o quiz.
- O build aprovado exige `VITE_CANONICAL_URL` válida. Sem a flag, `/quiz`, CTA e sitemap permanecem bloqueados e com `noindex, nofollow`.
- No modo aprovado, `/quiz` recebe canonical, Open Graph e entra sozinho no sitemap. `/quiz/resultado` usa canonical para `/quiz` e permanece `noindex, follow`.
- O CTA foi inserido antes do FAQ, fora do hero, e só renderiza sob o mesmo gate de aprovação.
- A chave `belvitale:quiz:v1` foi preservada. O documento local usa schema versão `2`, `savedAt`, expiração de 30 dias, limpeza automática e migração segura do formato legado.
- Acesso direto ao resultado sem estado válido mostra um estado neutro, remove storage corrompido e oferece início do quiz; nenhum perfil é inferido.
- Os seis eventos preparados são locais, sem rede, persistência ou IDs de pergunta/opção. O payload é normalizado para `source`, `step` e `profile` permitidos.
- O verificador de produção cobre builds bloqueado e aprovado, CTA, sitemap, canonical, resultado não indexável, ausência de checkout/preço, ausência de POST e ausência de campos pessoais no storage.
- Perguntas, pesos, perfis, pontuação, comércio e 13 componentes institucionais mantiveram os 18 hashes SHA-256 registrados antes da implementação.

### Evidências e qualidade

- Screenshots gerados e inspecionados para quiz público e CTA da homepage em 390 × 844 e 1440 × 900.
- Gravação `artifacts/recordings/home-to-quiz.webm` gerada em 390 × 844.
- Lint e TypeScript estrito aprovados.
- Builds bloqueado e aprovado processaram 57 módulos e passaram no verificador de produção.
- A suíte Playwright integral aprovou 105 de 105 testes, com um único worker, em uma execução limpa de 11,9 min.
- O domínio `https://example.test/` foi usado exclusivamente como fixture. O domínio canonical real continua pendente para publicação efetiva.

## Resultado — FAQ, marca, rodapé e estrutura legal

- `src/data/institutionalFacts.ts` centraliza os dados empresariais e publica somente CNPJ e telefone do SAC.
- `src/data/faqFacts.ts` mantém oito respostas confirmadas e três perguntas explicitamente bloqueadas.
- O FAQ usa botões reais, `aria-expanded`, `aria-controls`, múltiplas respostas abertas, teclado, hashes e painéis inertes quando fechados.
- A seção “Sobre a Belvitale” apresenta apenas o posicionamento editorial e três compromissos, sem história, equipe, laboratório, certificação ou números inventados.
- O rodapé reúne navegação, CNPJ, SAC, aviso factual e ano dinâmico. Não há e-mail, WhatsApp, endereço ou links legais pendentes.
- `src/data/legalDocuments.ts` registra os três documentos como `draft`; as rotas são internas em desenvolvimento e retornam uma página não publicada com `noindex, nofollow` em produção.
- Nenhum documento `draft` é vinculado no rodapé, tratado como política oficial ou incluído como conteúdo jurídico.
- Não foram adicionados schema `FAQPage`, schema `Product`, analytics, cookies, kits, preços, checkout ou novas dependências.

### Auditoria dos checkouts e imagens

- Os três checkouts confirmaram as estruturas de 1 pote, 3 potes e 5 + 2 grátis.
- Três miniaturas PNG foram recuperadas e preservadas em `galeria belvitale/checkout-assets/`, fora de `public/`.
- As versões originais sem `-thumb` retornaram HTTP 404. As miniaturas permanecem `commercial-review` e não entram no bundle.
- Contador, urgência, depoimentos e claims observados no checkout não foram reutilizados.

### Integridade das áreas protegidas

- Os doze arquivos protegidos mantêm exatamente os hashes registrados antes da implementação.
- Header, hero, barra de confiança, introdução, fórmula, rotina, rótulo, galeria, modal, assets tipados e SEO existente não foram alterados.
- A galeria continua ausente da produção e disponível somente para revisão em desenvolvimento.

### Evidências e qualidade

- Seis screenshots foram gerados e inspecionados em 390 × 844 e 1440 × 900.
- `artifacts/recordings/faq-interaction.webm` foi validado em 390 × 844, com 4,44 s de duração.
- Lint, typecheck, build com 38 módulos e verificação de produção foram aprovados.
- Uma execução Playwright integral e limpa aprovou 58 de 58 testes em 2 min 30 s.
- O preview do build confirmou `noindex, nofollow`, ausência de conteúdo jurídico oficial, zero links legais públicos, zero galeria e zero referências Yampi.

## Impacto planejado — arquitetura comercial controlada

Registrado antes da implementação em 14/07/2026.

- `src/data/commercialOffers.ts`: centralizar ofertas, URLs, status, cálculos e dependência jurídica.
- Nova camada local de eventos de comércio, sem rede, cookies, persistência ou dados pessoais.
- Novo componente comercial usado somente quando todos os requisitos estiverem prontos ou durante revisão em desenvolvimento.
- `src/App.tsx`: inserir o gate comercial depois do rótulo; manter a galeria exclusivamente em desenvolvimento e preservar as demais posições.
- `src/styles.css`: adicionar seletores comerciais locais; tokens e animações existentes permanecem inalterados.
- Fixture pronta será injetada apenas por testes/scripts de desenvolvimento e não existirá no bundle de produção.
- `scripts/capture-artifacts.mjs`, verificação do bundle e Playwright receberão cenários comerciais.
- `index.html` não receberá fallback, preço, CTA ou placeholder comercial porque a seção está bloqueada para produção.
- Nenhuma dependência, schema, analytics, pixel, quiz, depoimento ou política jurídica será adicionada.

### Arquivos protegidos antes da implementação

- `SiteHeader.tsx`: SHA-256 `EBB7C4BD11C9A227F610068B2AE778FC495D5688E8DC1CEAC98A8B4A9F399050`.
- `InstitutionalHero.tsx`: SHA-256 `CA197CF971FBD456CB0E5ACD05E998B1098A7F8F74B38C47215B6B617871766F`.
- `TrustBar.tsx`: SHA-256 `8665253887F99618A39EED07C502ECD1EEAE8A5405D4D08474DADD8DC145F8B4`.
- `CeluClinIntro.tsx`: SHA-256 `08BB5767D39DE3E6AE9A93DB96F3A81ECF4C3063F0D452B7C3A67D6A9289A97F`.
- `FormulaSection.tsx`: SHA-256 `E305A8E872AD8BDCC50571EB2EDA9D74B896FCC980F3A474E3459702DAA5D821`.
- `RoutineSection.tsx`: SHA-256 `759448BDB61E47B1A36E9E12706150E213A9DD585C2669900E1E50FEE5E16FCC`.
- `LabelTransparency.tsx`: SHA-256 `47BC104ECA311C0705041176A79542FCA53C17A9AEA6EE8ADFC017F4A5C93F80`.
- `ProofGallery.tsx`: SHA-256 `934F758577D367BF5EDA80733394AB0669EEA6A0BF7CEEFCA2F41D0A2A28C451`.
- `FaqSection.tsx`: SHA-256 `7ACCCAD4A2193E18A3936A113227FDD556DBE844C99DF3FE3B494623E30E9A59`.
- `BelvitaleInstitutional.tsx`: SHA-256 `C48E9769CB7CD602DE05231FDAD99E67C20BFAA89F23306B8E992FA825AE8BBA`.
- `SiteFooter.tsx`: SHA-256 `FFB0EB48B161D003BFFD042892C7251CD22E776DD7E9A78EB63DBB09122E6491`.
- `LegalDocumentRoute.tsx`: SHA-256 `F60143ED7375F9FAD2D3790F1606F0082755D2550AEC528AC1B7B55D2A010A16`.
- `proofGallery.ts`: SHA-256 `A4B7DDB1F6A85B5E4A2B2D57D0620F6F357EB8EC863295F9867E05EACCFCCC04`.
- `productFacts.ts`: SHA-256 `45104DABF84B9E410ED1D43ADA60C7E4AF2C894DE2CA85993CC511612F170DF6`.
- `institutionalFacts.ts`: SHA-256 `25C2BB03BCD8BB96CA309123970838F33304FA5D85EDF0DFF591A105AB5121DB`.
- `legalDocuments.ts`: SHA-256 `B23FAF39BA8AB0B5A11AC34289F5A9E09EE4DCA9B97D59628908ACB954D52DA8`.
- `siteAssets.ts`: SHA-256 `BA412D15C713C3EAE4C7DEE3B98D2AB87E7C052D01ED9EFACE4D248BB6E919A0`.
- `SeoMetadata.tsx`: SHA-256 `9660E035BE80F75D7033AE7B139BEC40B6148A23114852C7D7CD395643924A78`.
