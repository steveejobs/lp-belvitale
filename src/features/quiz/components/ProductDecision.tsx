import { ingredientFacts, usageFact, warningFacts } from "../../../data/productFacts";
import { withFunnelAttribution } from "../../../analytics/funnelAttribution";

export function ProductDecision({ audience }: { readonly audience: "normal" | "mounjaro" }) {
  const isMonj = audience === "mounjaro";
  return (
    <section className="q7-product-decision" aria-labelledby="q7-product-decision-title">
      <header>
        <p className="q7-step-label">Conheça antes de escolher</p>
        <h2 id="q7-product-decision-title">{isMonj ? "Sua conquista merece um próximo cuidado bem escolhido." : "Conheça a composição. Veja os relatos. Escolha com clareza."}</h2>
        <p>{isMonj ? "O emagrecimento foi uma conquista. Cuidar da alimentação, da força e da aparência da pele agora pede escolhas compatíveis com o seu acompanhamento." : "Se você já tentou cremes, exercícios ou procedimentos, merece entender o papel de cada escolha. CeluClin é um suplemento alimentar em cápsulas."}</p>
      </header>
      <div className="q7-formula-editorial">
        <div className="q7-formula-editorial__fact"><span>Na composição</span><strong>Vitamina C</strong><b>100 mg <small>por porção de 2 cápsulas</small></b></div>
        <div><h3>Um nutriente que participa da formação de colágeno.</h3><p>A vitamina C faz parte da composição do CeluClin e participa da formação de colágeno. A referência abaixo explica essa função nutricional; não é um estudo clínico de eficácia da fórmula CeluClin.</p><a href="https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/" target="_blank" rel="noreferrer">Consultar a referência do NIH ↗</a></div>
      </div>
      <details className="q7-formula-details"><summary>Ver os 8 ingredientes e suas quantidades</summary><dl>{ingredientFacts.filter(f => f.status === "confirmed").map(f => <div key={f.id}><dt>{f.name}</dt><dd>{f.amount}</dd></div>)}</dl><p>Valores por porção informados na documentação do produto.</p><a href="/label/celuclin-label-complete.pdf" target="_blank" rel="noreferrer">Abrir o rótulo completo ↗</a></details>
      <aside className="q7-evidence-limit"><strong>Composição, ciência e experiência: cada uma tem seu papel.</strong><p>O rótulo informa o que você consome. As referências explicam os nutrientes. Os relatos mostram experiências individuais, não um resultado garantido. Não há estudo clínico da fórmula completa apresentado nesta página.</p></aside>
      <div className="q7-decision-questions">
        <h3>Antes de colocar no carrinho</h3>
        <details><summary>Em quanto tempo posso esperar uma mudança?</summary><p>Não prometemos um prazo de resultado individual. Um frasco contém {usageFact.totalCapsules} cápsulas e dura cerca de 30 dias no uso de {usageFact.capsulesPerDay} cápsulas ao dia informado no rótulo. Compare 30 e 90 dias como quantidades de produto, não como prazos garantidos de mudança na pele.</p></details>
        <details><summary>{isMonj ? "Uso Mounjaro. Posso associar?" : "Como saber se é adequado para mim?"}</summary><p>{isMonj ? "A associação precisa ser avaliada pelo profissional que acompanha você. Leve o rótulo e informe outros medicamentos e suplementos. CeluClin não trata efeitos da tirzepatida." : "Confira a composição e converse com um profissional se usa medicamentos, tem alguma condição de saúde ou dúvida sobre suplementação."} {warningFacts.find(w => w.id === "pregnancy-and-children")?.text} Uso destinado a adultos a partir de 19 anos.</p></details>
        <details><summary>{isMonj ? "Vai resolver o excesso de pele?" : "É diferente de creme ou procedimento?"}</summary><p>{isMonj ? "Não há comprovação de que CeluClin corrija excesso de pele. Uma avaliação individual ajuda a distinguir pele excedente, flacidez percebida e alterações de contorno." : "CeluClin é ingerido como suplemento; cremes são aplicados na pele e procedimentos têm outras indicações. Isso não demonstra superioridade de uma opção. Um dermatologista pode orientar sobre celulite e flacidez."}</p><a href="https://www.aad.org/public/cosmetic/fat-removal/cellulite-treatments-what-really-works" target="_blank" rel="noreferrer">O que a dermatologia explica sobre celulite ↗</a></details>
        <details><summary>E se eu não quiser continuar?</summary><p>Não existe uma duração universal ou compromisso de uso permanente indicado por este quiz. Confira preço total, frete, condições e política de devolução antes de pagar.</p><a href={withFunnelAttribution("/trocas-e-reembolso")}>Consultar a política de devolução</a></details>
      </div>
    </section>
  );
}
