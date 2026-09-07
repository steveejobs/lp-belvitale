export function QuizFooter() {
  return (
    <footer className="q7-footer">
      <a href="/" aria-label="Belvitale — página inicial">
        <img src="/brand/belvitale-monogram-black-transparent.png" width="1005" height="1005" alt="" aria-hidden="true" />
        <span><b>Belvitale</b><small>Cuidado que cabe na vida real.</small></span>
      </a>
      <p>© {new Date().getFullYear()} Belvitale · CeluClin é um suplemento alimentar. Experiências individuais podem variar.</p>
    </footer>
  );
}
