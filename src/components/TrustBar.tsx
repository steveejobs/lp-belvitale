const trustFacts = [
  "60 cápsulas",
  "Suplemento alimentar",
  "Rótulo disponível",
  "Informações transparentes",
] as const;

export function TrustBar() {
  return (
    <aside
      className="trust-bar"
      aria-label="Informações essenciais do CeluClin"
    >
      <ul className="section-shell">
        {trustFacts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
    </aside>
  );
}
