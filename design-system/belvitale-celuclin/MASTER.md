# Belvitale CeluClin — sistema mestre

Status: direção proprietária aprovada para desenvolvimento. Publicação comercial e regulatória continuam bloqueadas pelos gates do projeto.

## Tese

Um editorial de beleza íntimo e vivo que devolve espaço à escolha. A experiência reconhece o desconforto silencioso sem declarar o corpo errado e apresenta o CeluClin como uma rotina possível, nunca como salvador.

Emoção dominante: **liberdade consciente**.

Frase de encerramento: **Sua pele não precisa ser perfeita para você voltar a se sentir livre.**

## Princípios

1. O produto e o rótulo determinam a linguagem; tendências não determinam a marca.
2. Desejo vem de composição, ritmo e copy específica — não de claims, urgência ou vergonha.
3. Cada seção muda de silhueta e tem uma única função dominante.
4. O rótulo oficial é a fonte visual publicável; packshots restritos servem apenas para direção interna até aprovação.
5. A venda é explícita e só aparece quando todos os dados e direitos estiverem confirmados.

## Paleta extraída dos assets

As amostras vieram de histogramas e recortes do rótulo, tampa e cápsulas reais. As cores de ação foram ajustadas apenas o necessário para contraste WCAG.

| Token | Valor | Origem e uso |
|---|---:|---|
| `ink-950` | `#24101E` | ameixa quase preta; texto principal |
| `wine-800` | `#5A1837` | cápsulas/sombra profunda; fundos densos |
| `wine-700` | `#7A173B` | cápsulas; superfície e dados |
| `capsule-600` | `#990D15` | vinho avermelhado; detalhe controlado |
| `action-600` | `#D90A73` | magenta ajustado; CTA com texto branco |
| `cap-500` | `#EC0791` | magenta da tampa; faixas e foco não textual |
| `label-500` | `#C3409C` | rosa vibrante do rótulo |
| `label-300` | `#DC9FCC` | rosa claro do rótulo |
| `violet-700` | `#5A2895` | violeta do rótulo; acento secundário raro |
| `rose-100` | `#F3E7F1` | rosa pálido do rótulo; superfícies |
| `paper-50` | `#FFF8F4` | branco quente; base editorial |
| `white` | `#FFFFFF` | texto em fundos escuros e respiro |

Pares validados: `ink-950/paper-50` 17.1:1; `action-600/white` 4.7:1; `wine-700/white` 9.9:1. `cap-500` não é usado com texto branco em corpo pequeno.

## Tipografia

- Display: **Newsreader Variable**, 600–720, optical sizing ativo. Para frases emocionais, alterna romano e itálico sem usar peso fino.
- Interface e conteúdo: **Figtree Variable**, 430–760. Corpo mínimo 16 px; preferencial 17–19 px.
- Dados: Figtree 680, algarismos tabulares, tracking negativo leve. Quantidade vem antes da legenda.
- Escala fluida: display `clamp(2.8rem, 9vw, 7.8rem)`; H2 `clamp(2.35rem, 6.2vw, 5.8rem)`; corpo `clamp(1rem, 1.2vw, 1.16rem)`.
- Linhas: títulos 0.88–0.98; corpo 1.5–1.65. Nunca justificar texto ou converter todos os títulos em caixa alta.

## Geometria

- Grade mobile: 4 colunas, margem 20 px, gutter 12 px; referência 390 × 844.
- Grade desktop: 12 colunas, largura máxima 1440 px, margem 42–64 px.
- Espaçamento base 4 px; ritmo principal 8 / 12 / 20 / 32 / 48 / 72 / 112.
- Raios restritos: 0, 2, 12 e 24 px. Pílula só para estado/ação; cards não recebem raio por padrão.
- Faixas inclinadas entre −4° e 4°; máscaras verticais; bordas que atravessam a grade; transparência como sobreposição de planos, não glassmorphism.

## Vocabulário de motion

1. **Reveal tipográfico:** máscara horizontal curta; 420–620 ms.
2. **Reveal de produto:** escala 0.96→1 e deslocamento de faixa; 650–900 ms.
3. **Transição de mídia:** clip-path/objeto deslizando; 500–700 ms.
4. **Estado do quiz:** troca lateral causal, 260–380 ms.
5. **Feedback:** borda, preenchimento e microdeslocamento de 2 px; 120–180 ms.

CSS é o padrão. Sem loop decorativo contínuo. `prefers-reduced-motion` remove deslocamento e preserva contraste/estado. A animação só começa em viewport e a interface permanece legível antes dela.

## Acessibilidade e performance

- Alvos mínimos 44 × 44 px e distância mínima de 8 px.
- Foco de 3 px em magenta/white, nunca removido.
- Navegação completa por teclado; estado não depende de cor; headings recebem foco nas mudanças do quiz.
- `100svh` como fallback e `100dvh` quando útil; safe areas em CTAs inferiores.
- Imagens reservam proporção, usam dimensões explícitas, `decoding=async` e lazy load abaixo da dobra.
- Sem packshot/lifestyle/prova bloqueado no bundle de produção.
- Quiz e componentes internos pesados em chunks próprios.
- Conteúdo essencial da home permanece no HTML de fallback e na árvore inicial.

## Gates imutáveis

- Categoria: suplemento alimentar em cápsulas; não é medicamento.
- Conteúdo: 60 cápsulas; uso informado de 2 ao dia; 30 dias é cálculo exato.
- Fórmula pública parcial: só ingredientes confirmados; cúrcuma fica bloqueada enquanto o conflito documental existir.
- Provas, depoimentos, lifestyle, packshot, ofertas, preço, frete, garantia e políticas só aparecem quando aprovados.
- Checkouts Yampi não recebem parâmetros e permanecem fora da interface pública enquanto o gate comercial estiver fechado.
- Quiz não diagnostica, não coleta PII e usa `belvitale:quiz:v1` com expiração de 30 dias.
- Canonical, OG, sitemap e indexação do quiz exigem domínio real, revisão humana, status sanitário confirmado e configuração explícita.

## Antipadrões reprovados

Cards repetidos, verde botânico dominante, bege de skincare, rosa infantil, glassmorphism, blobs, glow, gradiente de startup, dourado artificial, ícone genérico, sombra colorida, hero simétrico, fade-up universal, estética médica ou de dropshipping.
