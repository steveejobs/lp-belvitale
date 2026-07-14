# Arquitetura atual da página

A homepage continua deliberadamente parcial. A arquitetura comercial está implementada com gate de publicação e permanece ausente da produção enquanto houver requisitos essenciais pendentes.

## 1. Header institucional

- Wordmark tipográfico Belvitale enquanto o logo permanece pendente de aprovação.
- Links para O CeluClin, Composição, Rótulo e Dúvidas.
- Desktop compacto; mobile em `<dialog>` com Escape, foco contido, retorno de foco e bloqueio de scroll.

## 2. Hero

- H1 único: “Cuidado que começa com informação clara.”
- Identificação explícita do CeluClin como suplemento alimentar.
- CTA principal para a introdução e CTA secundário para a área do rótulo/composição.
- O packshot está bloqueado; a composição abstrata não simula frasco ou embalagem.

## 3. Barra compacta de confiança

- 60 cápsulas.
- Suplemento alimentar.
- Rótulo disponível.
- Informações transparentes.

## 4. O que é o CeluClin

- Definição institucional direta e factual.
- Pilares: Transparência, Simplicidade e Consciência.
- O destino “Dúvidas” do header permanece na orientação já aprovada; o FAQ completo é acessível pelo rodapé e pelos links institucionais sem alterar o header.

## 5. Fórmula transparente

- Estado de produção: parcialmente confirmado.
- Exibe porção e somente os sete ingredientes cujos nomes e quantidades coincidem entre rótulo e fonte textual.
- A linha de cúrcuma, os valores diários e os dados presentes em apenas uma fonte permanecem bloqueados.
- O CTA “Consultar rótulo original” funciona como âncora nativa e transfere o foco para o título do rótulo quando JavaScript está disponível.

## 6. Rotina de uso

- Sugestão confirmada: 2 cápsulas ao dia.
- Conteúdo confirmado: 60 cápsulas.
- Duração calculada: 30 dias, somente porque 60 ÷ 2 é uma divisão positiva e exata.
- Público informado: maiores de 19 anos.
- Advertências publicadas somente quando coincidentes entre as fontes; orientações amplas não confirmadas são substituídas pelo texto institucional neutro autorizado.

## 7. Transparência do rótulo

- Título: “Nada escondido. Leia exatamente o que você está levando.”
- Subtexto: “Veja o rótulo original e confira as informações da embalagem com calma.”
- Mídia: somente a página 1 da arte plana real.
- Entrada: abertura horizontal uma vez quando cerca de 55% da seção estiver visível; reduced motion recebe fade curto.
- Interações: ampliar em modal e baixar o PDF original completo.

## 8. Escolha sua rotina — arquitetura comercial

- Posição pública prevista: depois do rótulo e antes do FAQ.
- Três estruturas confirmadas: 1 pote, 3 potes e 5 potes + 2 adicionais.
- Durações calculadas: 30, 90 e 210 dias; totais de 60, 180 e 420 cápsulas.
- URLs de checkout centralizadas e preservadas sem parâmetros adicionais.
- Estado atual: bloqueado. Preços, parcelamento, imagem oficial em alta resolução, direitos, política de trocas/reembolso aprovada e identificação jurídica suficiente ainda não foram confirmados.
- Em produção, a seção não cria DOM, CTA, preço, placeholder ou espaço vazio.
- Em desenvolvimento, há um estado interno bloqueado e uma fixture fictícia injetada apenas por testes e pelo script de evidências.

## 9. Galeria editorial interna

- Título: “Histórias que merecem ser vistas com contexto”.
- Texto: “Cada experiência é individual. Esta área será publicada somente com registros reais, autorização e contexto confirmado.”
- Disponibilidade: apenas no modo de desenvolvimento enquanto todos os itens estiverem com `verificationStatus: "pending"`.
- Filtros: Celulite, Flacidez e Gordura localizada.
- Mobile: trilho horizontal nativo com scroll snap e uma prévia parcial do próximo item.
- Desktop: imagem principal e no máximo duas miniaturas de navegação.
- Não há atribuição ao CeluClin, identificação de pessoa, cronologia ou linguagem de resultado.

## 10. FAQ factual

- Título: “Dúvidas comuns, respostas sem rodeios.”
- Oito perguntas confirmadas sobre natureza do produto, conteúdo, porção, duração, público, composição e informações legíveis do rótulo.
- Accordion com múltiplos itens, teclado, hashes individuais e links para composição/rótulo.
- Armazenamento, cúrcuma e resultados permanecem bloqueados e não aparecem na interface.

## 11. Sobre a Belvitale

- Posicionamento baseado em clareza, transparência e responsabilidade.
- Sem história empresarial, equipe, laboratório, fundadora, certificações, imagens ou números não confirmados.
- Links internos para composição, rótulo e FAQ, sem repetir a fórmula.

## 12. Rodapé

- Marca, navegação factual, aviso de suplemento alimentar e copyright dinâmico.
- CNPJ `61.493.515/0001-65` e SAC `(63) 99108-1785` são os únicos dados institucionais publicados.
- Nenhum documento legal recebe link enquanto permanecer em `draft`.

## Rotas legais estruturais

- `/politica-de-privacidade`: `draft`.
- `/termos-de-uso`: `draft`.
- `/trocas-e-reembolso`: `draft`.
- Em desenvolvimento, as rotas mostram somente um estado interno de revisão, sem texto jurídico.
- Em produção, retornam estado não publicado com `noindex, nofollow`; não aparecem na navegação pública ou sitemap.

## Rotas do quiz de rotina

- `/quiz`: introdução e seis perguntas, uma por etapa.
- `/quiz/resultado`: perfil retomável após conclusão válida armazenada localmente.
- Status: `development`; sem link no header, homepage, rodapé ou sitemap.
- Produção sem flag interna: estado indisponível e `noindex, nofollow`, sem perguntas ou ofertas.
- Perfis: Começo simples, Constância gradual e Continuidade consciente.
- Persistência: somente IDs de resposta, etapa, perfil e data de conclusão no dispositivo.
- CTA final: composição da homepage; nenhum mapping comercial está aprovado.

## Expansão futura

A galeria só poderá ser ligada em produção após cada item mudar de `pending` para um status documentalmente aprovado. A fórmula completa depende da resolução documental da linha de cúrcuma e dos dados presentes em apenas uma fonte. A seção comercial depende da confirmação integral registrada em `docs/commercial-offer-audit.md`, incluindo a aprovação jurídica da política de trocas e reembolso. O quiz depende de revisão de copy, privacidade e aprovação explícita do status; depoimentos continuam fora desta arquitetura.
