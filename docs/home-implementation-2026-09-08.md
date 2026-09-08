# Home Belvitale — implementação e validação

Implementação local de 08/09/2026. Não houve publicação, compra de teste nem alteração das variantes dos quizzes nesta execução. O workspace já continha alterações paralelas de funil, que foram preservadas.

## Resultado

A abertura passou a ser “Mais à vontade na sua pele.” A narrativa reconhece tanto a celulite persistente quanto as mudanças percebidas depois de emagrecer. A identificação vem antes do produto, com duas situações editoriais que não exigem um rótulo da visitante. CeluClin permanece um único produto.

Sequência: hero → identificação → contexto → produto → composição → informações verificáveis → kits → rotina → personalização opcional → rótulo → FAQ → fechamento → rodapé.

O hero apresenta um novo packshot ilustrativo, produzido a partir do produto e do rótulo original. Os arquivos WebP têm aproximadamente 27 KB e 52 KB. O rótulo original continua disponível para ampliação e download. O header usa uma versão otimizada da marca transparente, com superfície opaca e sem o fundo irregular do arquivo anterior.

## Compra e posicionamento

- Kit de 3 frascos em primeiro lugar, com destaque calculado pelo menor preço por frasco.
- Preços à vista: 1 frasco R$ 89,90; 3 frascos R$ 169,90; 7 frascos R$ 597,00.
- Economia do kit de 3: R$ 99,80 comparada a três frascos avulsos. Essa comparação não é apresentada como preço anterior ou desconto com prazo.
- Preços registrados como conferidos em 08/09/2026 nos carrinhos públicos Yampi. Quantidades e URLs comerciais existentes foram preservadas. Frete e condições finais ficam no checkout.
- CTAs diretos de compra, preços visíveis e opção de conhecer o produto antes de comprar.
- Removida a frase “não trata celulite ou flacidez”. O FAQ apresenta o papel dos ingredientes e da rotina. Não foram adicionadas afirmações sem documentação de tratamento, redução de medidas em semanas ou aprovação da fórmula.
- A antiga galeria saiu da home: sua existência e autorização não demonstravam, por si, causalidade e prazo de efeito do produto. Os arquivos e as experiências dos quizzes foram preservados. A seção atual oferece composição, funções dos nutrientes e rótulo consultável.

Referências consultadas para as funções e a delimitação das evidências: [Anvisa — benefícios comprovados](https://www.gov.br/anvisa/pt-br/assuntos/alimentos/suplementos-alimentares/conheca-os-beneficios-comprovados/) e [Academia Americana de Dermatologia — contexto da celulite](https://www.aad.org/public/cosmetic/fat-removal/cellulite-treatments-what-really-works). Essas fontes não são apresentadas como estudo clínico do CeluClin.

## Engenharia

- HTML inicial sincronizado com a nova abertura, com CSS disponível antes do JavaScript e preload da imagem realmente utilizada.
- Canonical e compartilhamento da home apontam para www.belvitale.com.br, sem duplicação de canonical ou Twitter card.
- Sitemap da home gerado no modo de preview indexável. Regras de publicação existentes e indexação dos quizzes foram preservadas; o modo production continua sujeito aos gates anteriores.
- Importação de analytics do quiz feita sob demanda apenas quando há atribuição anterior de funil.
- Eventos product_view e offer_view dependem da visibilidade do conteúdo, em vez de disparar a impressão dos kits ao montar a página.
- FAQ preserva os parâmetros da campanha ao remover seu hash.
- Seletores de imagem e rótulo usam grupos com aria-pressed; os ingredientes mantêm tabs com teclado.
- Animações de entrada deixam o conteúdo visível depois da primeira exposição. Reduced motion respeitado; foco dentro de uma seção força sua visibilidade.
- Reserva genérica de altura por content-visibility removida da home para evitar posições imprecisas no scroll e na navegação por âncoras.
- Pixel Meta preservado, inclusive PageView. Não foi desativado ou atrasado para melhorar a pontuação.

## Validação

- Build com TypeScript: passou.
- Lint: passou.
- Playwright: seis larguras, 375, 390, 430, 768, 1024 e 1440 px; sem transbordamento lateral, imagens quebradas ou erros de execução nas capturas.
- Menu, Escape, retorno do foco, ampliação de rótulo, tabs por teclado, FAQ, eventos de checkout e UTMs verificados.
- Axe-core 4.12.1: nenhuma violação detectada nas regras WCAG 2 A/AA, WCAG 2.1 AA e boas práticas executadas, em 390 px com movimento reduzido. Isso não substitui uma auditoria manual completa ou testes com pessoas com deficiência.
- Testes permanentes em `tests/e2e/home-redesign.spec.ts`: dupla relevância, destaque comercial, atribuição, canonical e retorno do foco. Para executar no Windows: `$env:PLAYWRIGHT_CHANNEL='chrome'; npm.cmd run test:e2e -- tests/e2e/home-redesign.spec.ts`.

### Lighthouse local

Chrome, Lighthouse 13.4.1, build preview servido em localhost. Mobile com simulação padrão; desktop em 1440 × 900, CPU 1× e rede configurada em 40 ms / 10.240 Kbps. Uma execução por perfil, sem exclusão do Pixel.

| Medida | Mobile | Desktop |
|---|---:|---:|
| Performance | 77 | 78 |
| Acessibilidade | 100 | 100 |
| SEO | 100 | 100 |
| Boas práticas | 77 | 77 |
| FCP | 1,17 s | 0,50 s |
| LCP | 1,88 s | 1,23 s |
| CLS | 0 | 0 |
| TBT | 1.026 ms | 440 ms |
| Speed Index | 1,39 s | 0,68 s |

O custo dos scripts da Meta é relevante: no mobile, fbevents.js e a configuração do Pixel somam aproximadamente 1,04 s de CPU na auditoria de inicialização. O código e a renderização da própria página também têm custo. As falhas de boas práticas reportadas dizem respeito a cookies de terceiros da Meta e aos avisos associados no Chrome. Não há INP de campo nesta medição.

Esses números não demonstram aumento de conversão. A comparação com a home pública anterior não é um experimento controlado: servidor, carga da máquina, scripts externos e versões de navegador podem variar. O próximo acompanhamento deve separar os dois públicos e observar início de checkout, compra confirmada e receita por visitante, preservando a atribuição.

## Skills e decisões

- Seguidas: inspeção real das imagens e do rótulo; contraste; teclado; movimento reduzido; validação visual responsiva.
- Adaptadas: direção de hero e animações ao código e ao público reais; entrada discreta, sem desaparecimento recorrente durante leitura.
- Rejeitadas como receita: reorganização da home em cards repetidos, simetria obrigatória e etapas adicionais de aprovação de implementação, diante da autonomia concedida.
- Solução escolhida: reconhecimento editorial, produto dominante e comparação comercial explícita. O benefício esperado é diminuir dúvida e facilitar a compra; permanece uma hipótese de produto a medir.

## Arquivos desta execução

`index.html`, `vite.config.ts`, `public/robots.txt`, `src/App.tsx`, `src/home-refined.css`, `src/config/site.ts`, `src/content/homeContent.ts`, `src/data/homeOfferFacts.ts`, `src/data/faqFacts.ts`.

Componentes: `CampaignHero`, `ChoiceSequence`, `EducationSection`, `ProductStory`, `FormulaSection`, `ProofStories`, `CommercialSection`, `commercial/OfferCard`, `MobileOfferCta`, `SiteHeader`, `SiteFooter`, `LabelTransparency`, `FaqSection` e `ui/Reveal`, em `src/components/`.

Novos assets: `public/product/celuclin-home-640.webp`, `public/product/celuclin-home-960.webp`, `public/brand/belvitale-wordmark-home.webp`.

Evidências locais em `artifacts/home-review/`: `hero-{largura}.png`, `full-{largura}.png`, capturas de seções, `validation.json`, `events.json`, `accessibility.json`, `lighthouse-mobile.json`, `lighthouse-desktop.json`. Essas evidências estão na área de artefatos local e podem ser ignoradas pelo Git conforme a configuração existente.
