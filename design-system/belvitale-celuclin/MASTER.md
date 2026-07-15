# Belvitale / CeluClin — sistema mestre

## Direção escolhida: Escolha em cena

Uma campanha editorial móvel em que roupa, pele e rotina ocupam a cena antes da explicação técnica. O frasco entra como objeto de rotina; as provas ocupam capítulos inteiros; o rótulo plano aparece somente quando a narrativa chega à transparência.

Emoção central: **voltar a escolher sem negociar com a insegurança**.

### Direções comparadas internamente

1. **Vestir o dia** — recortes de moda, pensamentos curtos e tipografia cinética. Forte para identificação, menos forte para revelar o produto.
2. **Frasco de luz** — ameixa escura, transparência e cápsulas. Forte para desejo, com risco de parecer uma campanha genérica de suplemento.
3. **Pele em capítulos** — prova visual full bleed e linguagem documental. Forte para credibilidade, com risco de esfriar a emoção.

`Escolha em cena` combina a tensão humana da primeira, o palco material da segunda e a escala de prova da terceira. Não usa a solução automática inicial da UI/UX Pro Max: amarelo/lilás, Playfair + Inter, marquee infinito e pinning longo foram rejeitados por não nascerem do CeluClin e por piorarem a carga móvel.

## Paleta extraída dos assets

As amostras foram quantizadas a partir do rótulo aprovado, da tampa presente nas imagens de produto e das cápsulas. Tons de fundo foram equilibrados para contraste e leitura.

| Token | Valor | Origem / função |
| --- | --- | --- |
| `ink-950` | `#1B0814` | ameixa quase preta; texto e áreas noturnas |
| `plum-900` | `#3D1029` | vinho profundo; palco de produto |
| `plum-700` | `#6A173F` | cápsula/vinho; transições |
| `cap-700` | `#C60067` | ação acessível sobre fundo claro |
| `cap-500` | `#E6007E` | tampa magenta; áreas de energia |
| `label-500` | `#C34BA1` | rosa do rótulo; faixas secundárias |
| `label-700` | `#5D2E98` | violeta do rótulo; contraste pontual |
| `capsule-700` | `#A6141D` | cápsulas; foco da composição |
| `capsule-900` | `#6E1014` | cápsula profunda; detalhe e sombra |
| `blush-100` | `#F7DDE8` | rosa pálido; respiro, nunca fundo universal |
| `warm-050` | `#FFF8F3` | branco quente principal |
| `warm-200` | `#EFD8CC` | tom translúcido/pele, bordas e placeholders |
| `white` | `#FFFFFF` | texto sobre áreas escuras |

Regras:

- `cap-500` pode dominar mídia, faixas e superfícies grandes; texto branco em botões usa `cap-700`.
- Sobre `cap-500`, texto corrido usa `#10000A`: a variação de ameixa quase preta mantém a origem cromática e atinge contraste AA; lettering grande decorativo usa `warm-050` com pelo menos 82% de opacidade.
- Verde, bege skincare, dourado, neon e gradiente de startup não entram.
- Gradientes permitidos simulam luz atravessando vidro ou a passagem real entre magenta, vinho e violeta do rótulo.
- Imagens de pele nunca recebem overlay, filtro, blur, máscara colorida ou texto sobre a região relevante.

## Tipografia

- **Display:** Fraunces Variable em eixo de peso 560–760, sem depender de itálico ou eixos ausentes no arquivo latino carregado. Expressiva sem ficar fina; cria curvas tensas próximas ao monograma e ao nome CeluClin.
- **Conteúdo e interface:** Figtree Variable, pesos 430–780, corpo mínimo de 16 px.
- **Números:** Figtree 760–820, `font-variant-numeric: tabular-nums`, tracking negativo em escala grande.
- Títulos não usam caixa alta integral. Eyebrows podem usar caixa alta com no máximo 0,12em de tracking.
- Mobile: display entre 3rem e 4.35rem na primeira dobra; seções entre 2.7rem e 4rem. Desktop amplia por composição, não por repetição.

## Geometria e composição

- Base móvel: 390 × 844; shell responsivo de 16–24 px e áreas full bleed quando a mídia deve dominar.
- Desktop: grid de 12 colunas, shell máximo de 92rem, copy contida e mídia escapando de 1 a 3 colunas.
- Bordas são retas, oblíquas ou recortadas. Cantos arredondados ficam restritos a controles que precisam comunicar toque; nunca viram linguagem de seção.
- DNA visual: faixas diagonais, recortes de 6–12 graus, linhas que atravessam divisões, máscaras verticais e sobreposição entre área sólida e transparência.
- Cada capítulo precisa de uma silhueta própria: hero assimétrico, cena lifestyle full bleed, interlúdio tipográfico, palco escuro de produto, fórmula mineral, provas dominantes, rótulo horizontal, rotina calma e encerramento fotográfico.

## Assets e verdade

- O rótulo plano só pode aparecer em `#rotulo`, no modal e no PDF associado.
- As nove provas têm autorização expressa do proprietário em 14/07/2026. São exibidas inteiras, na categoria recebida, sem inferir ordem, pessoa, período ou cronologia.
- Nota obrigatória junto à prova: “Resultados reais autorizados. Experiências individuais podem variar.”
- Os packshots disponíveis mostram texto divergente do rótulo oficial. Eles podem sustentar apenas o preview interno de direção enquanto `productMedia` estiver bloqueado; o build de release os remove.
- Lifestyle, logos e cápsulas seguem o status documental registrado. O preview interno pode demonstrar a direção, mas status de produção não muda por variável de ambiente.
- Miniaturas Yampi de 290 px nunca são ampliadas. Ofertas continuam sem preço ou checkout enquanto os gates comerciais estiverem pendentes.

## Famílias de motion (máximo 5)

1. **Entrada tipográfica:** recorte horizontal e mudança curta de eixo; 420–720 ms; uma vez por cena.
2. **Revelação de produto:** máscara de 520 ms no hero e transições mais curtas nas interações; escala/rotação ficam limitadas a 2,5° e usam propriedades compostas.
3. **Transição de mídia:** troca de imagem por máscara ou crossfade curto; nunca anima texto de leitura.
4. **Progresso narrativo:** sticky curto, faixa de progresso e scroll nativo; no máximo uma área pinada por página e sem pinning móvel forçado.
5. **Feedback:** seleção de opção, controle de prova e foco com resposta de 120–220 ms.

`prefers-reduced-motion` mantém todas as composições finais, remove scrub/parallax e troca máscaras por estados imediatos. Loops não são usados.

## Acessibilidade

- Contraste mínimo WCAG AA; foco de 3 px com offset visível sobre claro e escuro.
- Alvos de 44 × 44 px, 8 px entre alvos adjacentes.
- Sem informação apenas por cor, movimento ou posição.
- Provas têm alt descritivo sem “antes/depois”; legendas deixam explícito que a ordem não foi inferida.
- Carrosséis usam scroll nativo, controles rotulados e região anunciada sem autoplay.
- Quiz usa `fieldset`, `legend`, progresso semântico, feedback em `aria-live`, foco após mudança e retorno preservado.

## Performance

- Só a mídia do hero recebe prioridade. No mobile ela usa um derivado AVIF de 640 px/11 KB; o original permanece intacto para desktop e arquivo-fonte. Lifestyle, produto secundário, provas e rótulo usam lazy loading.
- Dimensões e `aspect-ratio` sempre reservadas; placeholders usam `warm-200`, `plum-900` ou a cor dominante do capítulo.
- Provas carregam por proximidade e `content-visibility: auto` por capítulo.
- Quiz e rótulo continuam em chunks próprios; prova pode ser chunk próprio se o custo de interação justificar.
- Scroll usa IntersectionObserver e um único `requestAnimationFrame` quando necessário. GSAP não é dependência desta direção.

## Gates de aprovação visual

- Hero: produto ou gate visual dominante, CTA na primeira dobra, headline compreendida em cinco segundos.
- Seções: função, silhueta, dominante e contraste explícitos; remover qualquer trecho que apenas repita título + parágrafo.
- Quiz: seis interações com quatro apresentações; o perfil não pode ser previsto por uma letra ou por uma única pergunta.
- Prova: todas as imagens inteiras, sem slider artificial quando enquadramentos não coincidem.
- Release: nenhuma variável de preview converte mídia, oferta, jurídico ou situação sanitária pendente em aprovado.
