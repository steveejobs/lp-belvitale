# Ledger de requisitos

## Refinamento modular e distribuicao de assets - 15/07/2026

| ID | Requisito | Rota | Dispositivo | Prioridade | Status | Evidencia |
| --- | --- | --- | --- | --- | --- | --- |
| RQ-101 | Segunda secao sem repeticao do hero, margens artificiais ou numeracao | `/` | todos | P0 | aprovado | capturas 390/1440 + Playwright |
| RQ-102 | Cada asset principal possui funcao editorial exclusiva | `/` | todos | P0 | aprovado | manifesto + teste de unicidade |
| RQ-103 | Kits de 1, 3 e 7 meses com checkouts exatos | `/` | todos | P0 | aprovado no preview | Playwright + auditoria Yampi |
| RQ-104 | Kit de 3 meses identificado como `Mais vendido` por confirmacao do proprietario | `/` | todos | P1 | aprovado | DOM + screenshot |
| RQ-105 | Numeracao decorativa removida de imagens, provas e ofertas | `/` | todos | P1 | aprovado | DOM + screenshots |
| RQ-106 | Tema e motion centralizados e reutilizaveis | `/` | todos | P1 | aprovado | `src/theme/` + reduced motion + Lighthouse |
| RQ-107 | Ferramenta local de otimizacao de imagem documentada | local | n/a | P2 | concluido | `tools/` |
| RQ-108 | Memoria operacional para contextos futuros | projeto | n/a | P0 | concluido | `PROJECT_CONTEXT.md` |

## Reconstrução de campanha — estado corrente

Esta seção substitui os contratos visuais das rodadas históricas abaixo. Os registros anteriores permanecem apenas como histórico técnico.

| Requisito | Implementação / evidência | Status |
| --- | --- | --- |
| Ler a documentação obrigatória e equivalentes existentes | Fonte da verdade, escopo, fórmula, comercial, quiz, assets, auditorias, change impact e ledger foram abertos integralmente; três arquivos históricos solicitados continuam ausentes e não foram alegados como lidos | Concluído |
| Usar UI/UX Pro Max ativamente | Skill local lida; buscas de design system, landing, social proof, React/performance, motion e auditoria UX; recomendação genérica rejeitada | Concluído |
| Comparar três direções sem transferir decisão | `Vestir o dia`, `Frasco de luz` e `Pele em capítulos`; síntese `Escolha em cena` persistida no design system | Concluído |
| Rótulo plano somente na transparência | Única referência renderizada em `LabelTransparency`; derivado de hero removido do repositório e do build | Concluído |
| Provas autorizadas nas três categorias | Nove arquivos `owner-authorized`, capítulos distintos, enquadramento integral, sem cronologia inventada e com nota obrigatória | Concluído |
| Packshot e lifestyle sem promoção indevida de status | Preview interno com nota; release normal remove `product/`, `lifestyle/` e `brand/` | Concluído |
| Hero de campanha mobile-first | Produto dominante, headline específica, CTA, categoria, 60/2/30, aviso e entrada sincronizada por máscara | Concluído |
| Narrativa contínua da home | Escolha → contexto → produto → fórmula → prova → rótulo → rotina → conveniência → quiz → dúvidas → encerramento | Concluído |
| Fórmula tátil sem claims inventados | Sete tabs factuais, quantidade em foco, cápsulas e cúrcuma bloqueada por conflito | Concluído |
| Quiz editorial com seis interações | Quatro apresentações, microfeedback, progresso, três perfis, storage/retomada e resultado não diagnóstico | Concluído |
| Recomendação sem manipulação comercial | `resolveQuizRecommendation` permanece `null` até oferta, mapping e gates regulatórios aprovados | Concluído |
| No máximo cinco famílias de motion | Tipografia, produto, mídia, progresso e feedback; sem loops; reduced motion preserva o estado final | Concluído |
| Mobile, teclado, touch, foco e texto a 200% | 44 × 44 px, 8 px, dialogs, scroll nativo, sem overflow nos sete viewports requeridos | Concluído |
| Release público seguro | Verificador aprovado: sem checkout, preço, canonical, sitemap, quiz publicado ou mídia de produto/lifestyle/brand; provas autorizadas permanecem | Concluído |
| Evidências, Lighthouse, preview e commit | 23 capturas, sete WebM, Lighthouse 89/100/100, preview Vercel protegido e commit final da rodada | Concluído |

## Escopo ativo desta rodada

| Requisito                                                       | Implementação/validação prevista                                                                          | Status    |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------- |
| Auditar estrutura e todas as mídias antes de editar a aplicação | Inventário binário, metadados e inspeção visual, incluindo as duas páginas do PDF                         | Concluído |
| Preservar fontes e criar cópias normalizadas                    | Fontes mantidas em `galeria belvitale/`; derivados organizados em `public/`                               | Concluído |
| Separar celulite, flacidez e gordura localizada                 | Dados tipados e diretórios independentes                                                                  | Concluído |
| Impedir publicação das provas pendentes                         | `verificationStatus: "pending"`, renderização somente em `import.meta.env.DEV` e exclusão de `dist/proof` | Concluído |
| Galeria mobile por swipe, sem autoplay e com altura estável     | Scroll nativo, scroll snap, indicador, progresso e controles                                              | Concluído |
| Galeria desktop com imagem principal e até duas miniaturas      | Layout responsivo com teclado e setas                                                                     | Concluído |
| Carregar somente atual, anterior e próxima                      | `src` condicionado à vizinhança do índice ativo                                                           | Concluído |
| Estados loading, loaded, missing, error, empty e blocked        | Estados no componente; cenários de erro/ausência/vazio simuláveis por query string em desenvolvimento     | Concluído |
| Reduced motion                                                  | Media query + detecção para remover deslocamento e brilho                                                 | Concluído |
| Fallback sem JavaScript                                         | `<noscript>` factual sem expor provas                                                                     | Concluído |
| Rótulo plano real, sem frasco falso                             | Derivado WebP da página 1 e PDF original para download                                                    | Concluído |
| Entrada com clip-path, scaleX e faixa de luz uma vez            | IntersectionObserver a 55%, animações CSS únicas                                                          | Concluído |
| Modal acessível                                                 | `<dialog>`, Escape, foco contido, restauração de foco e bloqueio de scroll                                | Concluído |
| Download apenas com PDF real                                    | Link para a cópia normalizada do PDF fornecido                                                            | Concluído |
| Sem overflow, console limpo e sem 404                           | Testes Playwright em cinco viewports                                                                      | Concluído |
| Lint, typecheck e build                                         | Scripts npm separados                                                                                     | Concluído |
| Screenshots 390 × 844 e 1440 × 900                              | Artefatos em `artifacts/screenshots/`                                                                     | Concluído |
| Gravações do swipe e da abertura do rótulo                      | Artefatos em `artifacts/recordings/`                                                                      | Concluído |

## Rodada institucional da homepage

| Requisito                              | Implementação/validação prevista                                                          | Status    |
| -------------------------------------- | ----------------------------------------------------------------------------------------- | --------- |
| Header institucional compacto          | Marca tipográfica, navegação responsiva e CTA discreto                                    | Concluído |
| Menu mobile acessível                  | `<dialog>`, Escape, foco contido, retorno de foco e bloqueio de scroll                    | Concluído |
| Hero sem packshot oficial              | Composição tipográfica e abstrata sem reservar espaço para mídia pendente                 | Concluído |
| Copy institucional sem promessa        | Transparência, rotina, autocuidado e identificação clara como suplemento alimentar        | Concluído |
| CTA principal na primeira dobra mobile | Validação em 360, 390 e 430 px                                                            | Concluído |
| Barra compacta de confiança            | Quatro fatos permitidos, com quebra em duas linhas no mobile                              | Concluído |
| Seção “O que é o CeluClin”             | Definição factual e três pilares editoriais sem cards gigantes                            | Concluído |
| Fallback tipado de asset               | Contrato `AssetStatus` com estados approved, pending e blocked                            | Concluído |
| Tokens visuais centralizados           | Cores, espaços, raios, sombras, largura, tipografia, duração e z-index                    | Concluído |
| SEO básico confirmado                  | Title, description, canonical configurável, Open Graph e Organization mínimo; sem Product | Concluído |
| Fallback sem JavaScript                | Conteúdo institucional estático sem menu interativo nem mídia bloqueada                   | Concluído |
| Motion reduzido                        | Entrada leve e menu/header sutis, removidos com `prefers-reduced-motion`                  | Concluído |
| Sem regressão na galeria/rótulo        | Componentes existentes preservados; somente posicionamento posterior na página            | Concluído |
| Evidências institucionais              | Quatro screenshots obrigatórios e gravação do menu mobile                                 | Concluído |
| Lint, typecheck, build e testes        | Suíte ampliada nas cinco viewports                                                        | Concluído |

## Fora do escopo e bloqueado após esta rodada

- Publicação de kits e checkout, quiz, blog e páginas orgânicas.
- Depoimentos, inclusive os rascunhos recebidos.
- Qualquer imagem apresentada como resultado real.
- Preços e condições comerciais.
- Garantia, urgência, contadores e prova visual em produção.

## Rodada de composição, fórmula e rotina de uso

| Requisito                               | Implementação/validação prevista                                                            | Status    |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | --------- |
| Auditar rótulo contra a fonte textual   | Matriz completa em `docs/formula-audit.md`, sem OCR como fonte definitiva                   | Concluído |
| Bloquear divergências                   | Apenas fatos `confirmed` podem ser renderizados; cúrcuma permanece fora da publicação       | Concluído |
| Modelo central tipado                   | `src/data/productFacts.ts` com status, origem, ingredientes e uso                           | Concluído |
| Fórmula parcialmente confirmada         | Lista editorial sem linhas vazias, valores diários não confirmados ou claims                | Concluído |
| Estados confirmado, parcial e bloqueado | Seleção de apresentação testável; produção permanece no estado parcial auditado             | Concluído |
| Rotina derivada das fontes              | 2 cápsulas/dia, 60 cápsulas, público 19+ e advertências coincidentes                        | Concluído |
| Duração pura e testada                  | Cálculo exato 60 ÷ 2 = 30; entradas inválidas ou inexatas retornam `null`                   | Concluído |
| Orientação profissional neutra          | Fallback autorizado porque o texto institucional amplo não foi confirmado                   | Concluído |
| Integração com rótulo existente         | Link âncora para `#rotulo`, foco no título e modal sem duplicação                           | Concluído |
| Ordem da página                         | Introdução, fórmula, rotina, rótulo e galeria somente em desenvolvimento                    | Concluído |
| Sem regressão nas áreas protegidas      | Header, hero, barra e introdução preservados por hash; lógica da galeria/modal preservada   | Concluído |
| Acessibilidade e performance            | Sem novas imagens/bibliotecas, sem overflow, reduced motion, 200% e fallback sem JavaScript | Concluído |
| Evidências                              | Quatro screenshots e gravação fórmula → rótulo                                              | Concluído |
| Qualidade                               | Lint, typecheck, build, produção e uma suíte Playwright integral limpa                      | Concluído |

## Rodada de FAQ, marca, rodapé e estrutura legal

| Requisito                     | Implementação/validação prevista                                                              | Status    |
| ----------------------------- | --------------------------------------------------------------------------------------------- | --------- |
| Auditoria institucional       | Matriz de confirmados, pendentes e bloqueados em `docs/institutional-data-audit.md`           | Concluído |
| Dados tipados centrais        | `src/data/institutionalFacts.ts`, sem renderizar fatos pendentes ou bloqueados                | Concluído |
| FAQ estritamente factual      | Accordion acessível com respostas derivadas da fonte da verdade e da auditoria da fórmula     | Concluído |
| Perguntas bloqueadas ausentes | Sem armazenamento, cúrcuma, fabricante, preço, frete, garantia, Anvisa ou alegações corporais | Concluído |
| Seção Belvitale               | Posicionamento editorial sem inventar história, equipe, certificações ou números              | Concluído |
| CNPJ e SAC                    | Exibir somente os valores fornecidos nesta rodada; SAC não será presumido como WhatsApp       | Concluído |
| Rodapé funcional              | Marca, navegação factual, contato confirmado, aviso e copyright dinâmico                      | Concluído |
| Documentos legais tipados     | Três rotas com status `draft`, visualização interna em desenvolvimento e bloqueio público     | Concluído |
| SEO legal restrito            | Títulos e descrições factuais; `noindex` para documentos não aprovados; sem novos schemas     | Concluído |
| Fallback sem JavaScript       | FAQ, marca, contato e aviso disponíveis estaticamente, sem políticas não aprovadas            | Concluído |
| Sem regressão                 | Hashes das seções protegidas, galeria, modal e modelos anteriores preservados                 | Concluído |
| Acessibilidade responsiva     | Teclado, hashes, foco, reduced motion, texto a 200% e cinco viewports                         | Concluído |
| Evidências                    | Seis screenshots e gravação da interação do FAQ                                               | Concluído |
| Qualidade                     | Lint, typecheck, build, produção e uma suíte Playwright integral limpa                        | Concluído |

## Rodada de arquitetura comercial controlada

| Requisito | Implementação/validação prevista | Status |
| --- | --- | --- |
| Auditoria comercial | Matriz completa e validação de redirects em `docs/commercial-offer-audit.md` | Concluído |
| URLs centralizadas | Três links Yampi literais em `src/data/commercialOffers.ts`, sem parâmetros adicionais | Concluído |
| Ofertas tipadas | Estrutura, preço, imagem, direitos, checkout e status centralizados | Concluído |
| Regra de publicação | `canPublishOffer` e `commercialPublicationReady`, incluindo política de reembolso aprovada | Concluído |
| Produção bloqueada | Nenhuma seção, preço, CTA, placeholder ou texto interno no DOM de produção | Concluído |
| Desenvolvimento controlado | Estado bloqueado factual e fixture pronta isolada fora do bundle de produção | Concluído |
| Comparação factual | Potes, duração e cápsulas; preços somente na fixture de teste | Concluído |
| CTAs externos | Links reais, mesma aba, nomes específicos e callback interno antes da saída | Concluído |
| Eventos locais | `offer_view`, `offer_select` e `checkout_click`, sem terceiros ou dados pessoais | Concluído |
| Cálculos puros | Preço por pote, total parcelado e economia, com `null` para entradas inválidas/inexatas | Concluído |
| Imagens bloqueadas | Miniaturas de 290 px fora de `public/`, sem upscale ou inclusão no build | Concluído |
| Acessibilidade | Teclado, foco, reduced motion, texto a 200% e cinco viewports | Concluído |
| Sem regressão | Componentes, copy, animações e rotas anteriores preservados por hash | Concluído |
| Evidências | Quatro screenshots e gravação somente em desenvolvimento | Concluído |
| Qualidade | Lint, typecheck, build, verificação de produção e Playwright integral limpo | Concluído |

## Rodada de fundação do quiz

| Requisito | Implementação/validação prevista | Status |
| --- | --- | --- |
| Rotas isoladas | `/quiz` e `/quiz/resultado`, sem alterar a homepage | Concluído |
| Publicação controlada | Status central, acesso de desenvolvimento/flag e `noindex, nofollow` | Concluído |
| Seis perguntas centralizadas | Dados e pesos fora dos componentes | Concluído |
| Três perfis neutros | Começo simples, Constância gradual e Continuidade consciente | Concluído |
| Pontuação auditável | Função pura determinística e desempate pela sexta resposta | Concluído |
| Persistência local mínima | IDs, etapa, perfil e data; sem dados pessoais ou texto livre | Concluído |
| Resultado sem oferta | Mapping comercial separado e integralmente `pending` | Concluído |
| Acessibilidade | Fieldset, legend, foco, teclado, erros, progresso e 200% | Concluído |
| Motion reduzido | Transição curta e estado imediato com reduced motion | Concluído |
| Fallback sem JavaScript | Entradas HTML específicas com explicação e link para composição | Concluído |
| Evidências | Seis screenshots e duas gravações nas rotas do quiz | Concluído |
| Qualidade | Lint, typecheck, build, preview e Playwright integral limpo | Concluído |

## Rodada de validação final e publicação controlada do quiz

| Requisito | Implementação/validação prevista | Status |
| --- | --- | --- |
| Revisão de conteúdo | Auditoria individual das seis perguntas, com atenção às perguntas 2, 4 e 5 | Concluído |
| Teste humano | Roteiro interno documentado, sem coleta dentro do site público | Concluído |
| Aprovação explícita | Publicação apenas com `VITE_QUIZ_PUBLICATION_STATUS=approved` | Concluído |
| CTA da homepage | Bloco discreto, condicionado ao mesmo gate e fora do hero | Concluído |
| SEO controlado | Canonical e sitemap somente quando aprovado; resultado sempre fora de indexação | Concluído |
| Resultado inválido | Estado neutro, storage inválido removido e caminho para começar | Concluído |
| Storage | Mesma chave, schema versionado, expiração de 30 dias e migração segura | Concluído |
| Eventos | Eventos exclusivamente locais, sem respostas individuais ou rede | Concluído |
| Segurança | Verificador cobre gate, CTA, sitemap, resultado, preço, checkout, rede e storage | Concluído |
| Evidências | Quatro screenshots e gravação do caminho homepage → quiz | Concluído |
| Qualidade | Lint, typecheck, builds bloqueado/aprovado e Playwright integral limpo | Concluído |
# Reconstrução editorial CeluClin — 14/07/2026

| Requisito | Implementação/validação | Status |
| --- | --- | --- |
| UI/UX Pro Max real | Skill instalada, busca executada com 8/6/3, recomendação confrontada e sistema persistido | Concluído |
| Tese “liberdade consciente” | Hero, identificação, educação, produto e encerramento com copy específica | Concluído |
| Paleta dos assets | Amostras do rótulo, tampa e cápsulas; escala e contrastes em `design-system/` | Concluído |
| Home não linear | Doze momentos com escala, silhueta, densidade e iluminação próprias | Concluído |
| Produto sem packshot falso | Rótulo oficial em composição editorial; gate do packshot visível apenas internamente | Concluído |
| Fórmula tátil | Sete ingredientes confirmados em foco navegável; cúrcuma bloqueada | Concluído |
| Rótulo legível | Reveal, modal, Escape, retorno de foco, erro de imagem e PDF | Concluído |
| Prova responsável | Nove mídias `owner-authorized` nas categorias recebidas, sem retoque, cronologia ou contexto inventado; zero depoimento fictício | Concluído |
| Kits responsáveis | Comparação 30/90/210 em desenvolvimento; preço, condição e checkout bloqueados | Concluído |
| Quiz editorial | Seis ângulos, quatro apresentações e progresso pelas faixas do rótulo | Concluído |
| Perfis humanos | Começo sem peso, Ritmo que volta e Cuidado em curso | Concluído |
| Recomendação não manipulativa | Conveniência somente após gates; estado atual retorna `null` | Concluído |
| Mobile-first | 360, 375, 390, 412, 430; alvos 44 px, safe area, sem overflow e 200% | Concluído |
| Desktop | 1366 × 768 e 1440 × 900 inspecionados e testados | Concluído |
| Acessibilidade | Teclado, foco, leitor semântico, reduced motion, erros e retorno de contexto | Concluído |
| Performance | Lighthouse 89/100/100; FCP 1,65 s, LCP 3,25 s, TBT 183 ms, CLS 0; AVIF responsivo, chunks, preload e `content-visibility` | Concluído com limitação documentada de LCP |
| SEO/release | Sem domínio fictício, canonical ou sitemap; home/quiz noindex enquanto gates fechados | Concluído |
| Produção bloqueada | Sem Yampi, oferta, packshot ou mídia restrita no build normal; apenas as provas expressamente autorizadas permanecem públicas | Concluído |
| Evidências | 23 capturas, quatro páginas inteiras, sete WebM e Lighthouse JSON | Concluído |
| Preview | Vercel não produtivo, quiz com flag interna, proteção de equipe preservada | Concluído |
| Qualidade | Lint, typecheck, build, verificador e Playwright 49/49 | Concluído |

## Rodada de acervo visual e impacto editorial — 15/07/2026

| Requisito | Implementação/validação | Status |
| --- | --- | --- |
| Usar todas as imagens elegíveis sem quebrar o contrato do rótulo | `GalleryAtlas` centraliza marca, produto, lifestyle, provas e kits via `src/data/galleryAssets.ts`; o rótulo permanece apenas em `#rotulo` | Concluído |
| Preservar gates de produção | `product`, `lifestyle`, `brand` e `checkout` continuam removidos do build público; provas autorizadas e rótulo permanecem publicados | Concluído |
| Acervo visível cedo | Nova seção `#acervo` entra logo após o hero e foi adicionada à navegação principal | Concluído |
| Galeria mobile intuitiva | Trilho horizontal com scroll-snap, dimensões reservadas e legendas curtas | Concluído |
| Mosaico desktop com presença visual | Grid editorial assimétrico, imagens no primeiro viewport do acervo e logos claros sobre fundo escuro | Concluído |
| Kits reais no preview interno | `CommercialSection` usa as três imagens de checkout quando o preview interno está ativo, mantendo preço/compra bloqueados | Concluído |
| Referências analisadas | `docs/reference-analysis.md` registra o que foi absorvido e o que não foi copiado das duas páginas enviadas | Concluído |
| Evidências | Screenshots `390x844-home-gallery.png`, `1440x900-home-gallery.png`, QA manual de acervo/rótulo/kits/overflow e Playwright 49/49 | Concluído |
| Qualidade | Lint, build, verificador de produção, Playwright e auditoria visual | Concluído |

## Reconstrução clean da homepage — 15/07/2026

Esta rodada substitui a direção visual assimétrica do acervo na rota `/`. A autorização explícita do proprietário neste pedido libera produto, lifestyle e logos fornecidos para uso na homepage. Kits, checkout, preços, claims, quiz e o gate sanitário continuam fora do escopo.

| Requisito | Implementação/validação | Status |
| --- | --- | --- |
| Home clean, minimalista e elegante | Superfícies claras, preto e branco, acento magenta do frasco, grid consistente e respiro controlado | Concluído |
| Produto real como protagonista | Frasco frontal no hero e seis cenas uniformes: frente integral, close, ângulo, mão, cápsulas e lifestyle | Concluído |
| Logos oficiais preto e branco | Wordmark escuro no header, monograma claro no rótulo e wordmark claro no rodapé, sem distorção | Concluído |
| Galerias separadas por solução | Celulite, flacidez e gordura localizada em controles e palcos independentes, sem misturar séries | Concluído |
| Imagens alinhadas | Proporções reservadas, mídia integral, trilhos uniformes e ausência de mosaico assimétrico | Concluído |
| Rótulo claramente localizado | Seção própria, abertura visual por máscara, quatro focos de leitura, modal legível e PDF original | Concluído |
| Motion funcional | Movimento restrito a produto, troca de galeria e abertura do rótulo; reduced motion preservado | Concluído |
| Quiz preservado | Nenhum arquivo, conteúdo, scoring, storage ou rota do quiz foi alterado; 13 testes do quiz passaram | Concluído |
| Kits e comércio preservados | Nenhum kit, preço, checkout ou CTA comercial aparece na home real; fixtures continuam isoladas | Concluído |
| QA visual e técnico | Capturas `home-clean-*`, vídeo `home-clean-interactions.webm`, sete viewports, 200%, teclado, console, rede, lint, typecheck, build, gate de produção e regressão afetada 36/36 | Concluído |
