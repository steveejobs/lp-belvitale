export function QuizFooter() {
  return (
    <footer className="q7-footer">
      <a href="/" aria-label="Belvitale — página inicial">
        <img src="/brand/belvitale-monogram-light.webp" width="560" height="560" alt="" aria-hidden="true" />
        <span><b>Belvitale</b><small>Cuidado que cabe na vida real.</small></span>
      </a>
      <p>© {new Date().getFullYear()} Belvitale · CeluClin é um suplemento alimentar. Experiências individuais podem variar.</p>
    </footer>
  );
}
