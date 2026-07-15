# Informações pendentes

Adendo de 14/07/2026: autorização de publicação e atribuição das nove imagens de resultado foi declarada pelo proprietário e deixou de ser pendência. Permanecem ausentes identidade, datas, duração e cronologia; nenhum desses campos pode ser inventado.

## Contexto não fornecido para a galeria autorizada

- Entregar o arquivo ausente `prova 1`, citado pelo usuário mas não encontrado.
- Identidade, contexto individual, datas e duração não foram fornecidos e não podem aparecer na copy.
- A implementação preserva a classificação recebida e não interpreta nomes, números ou lados das montagens como cronologia.

## Bloqueios para mídias de produto e marca

- Fornecer fotografias oficiais do frasco, cápsulas e embalagem com texto legível e fiel ao rótulo.
- Confirmar origem e direitos das imagens lifestyle.
- Aprovar a variante oficial do monograma e do wordmark.
- Fornecer, se necessário para a futura seção de kits, as versões originais em alta resolução das três miniaturas recuperadas da Yampi. As URLs públicas sem `-thumb` retornam 404.

## Validações empresariais futuras

- CNPJ e SAC foram confirmados diretamente pelo usuário em 14/07/2026. Ainda faltam razão social, nome fantasia jurídico, e-mail, WhatsApp, endereço, cidade, estado, domínio institucional, prazo de resposta e confirmação cadastral da entidade vinculada ao CNPJ.
- Confirmar a atualidade dos demais dados impressos no rótulo antes de reutilizá-los fora da imagem: fabricante, distribuidora, responsável técnica, alergênicos e status regulatório.
- Confirmar preços, parcelamento, frete, prazos, estoque, garantias, trocas e reembolsos antes de ligar os links de checkout à interface.
- Redigir e aprovar juridicamente a Política de Privacidade, os Termos de Uso e a Política de Trocas e Reembolso antes de publicar rotas, links ou indexação.
- Obter depoimentos diretamente das clientes, com edição livre, aprovação final, autorização, identificação escolhida e decisão sobre uso de imagem. Os textos recebidos permanecem rascunhos internos.

## Bloqueios para publicar as ofertas comerciais

- Confirmar humanamente o preço total de cada opção, sem promover automaticamente valores observados no checkout.
- Confirmar número de parcelas, valor da parcela e existência ou ausência de juros para cada kit.
- Entregar imagem oficial de cada kit em alta resolução e confirmar seu direito de uso. As miniaturas de 290 px continuam restritas à inspeção interna.
- Aprovar juridicamente e publicar a Política de Trocas e Reembolso aplicável às ofertas.
- Completar a identificação jurídica da empresa com razão social e endereço, além de vincular os dados à operação comercial.
- Confirmar formalmente a condição dos dois potes adicionais do kit de sete meses. A palavra “grátis” observada no checkout não foi aprovada para a copy do site.
- Confirmar frete, prazo, garantia e eventual economia apenas se esses dados forem futuramente usados; nenhum deles é necessário para a interface enquanto permanecer omitido, mas não pode ser presumido.

## Bloqueios para publicar o quiz

- Executar o roteiro de teste humano e revisar os sinais registrados: perguntas 2 e 4 pendentes de teste e pergunta 5 redundante. Nenhum texto foi alterado automaticamente.
- Validar juridicamente o aviso de armazenamento local e sua coerência com a futura Política de Privacidade.
- Configurar `VITE_QUIZ_PUBLICATION_STATUS=approved` somente no ambiente autorizado; qualquer outro valor mantém o bloqueio.
- Informar o domínio institucional real em `VITE_CANONICAL_URL`. O valor `https://example.test/` existe somente na fixture de validação e não pode ser usado em publicação.
- Manter todos os mappings comerciais `pending` até uma rodada separada; aprovação do quiz não aprova kit, preço ou checkout.
