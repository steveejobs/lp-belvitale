import { institutionalFacts, isConfirmedInstitutionalFact } from "../../../data/institutionalFacts";
import { getPublicLegalDocuments } from "../../../data/legalDocuments";

export function QuizFooter() {
  const documents = getPublicLegalDocuments();
  const hasCnpj = isConfirmedInstitutionalFact(institutionalFacts.cnpj);

  return (
    <footer className="q7-footer">
      <div className="q7-footer__inner">
        <a className="q7-footer__brand" href="/" aria-label="Belvitale — página inicial">
          <img
            src="/brand/belvitale-wordmark-light.webp"
            width="560"
            height="120"
            alt="Belvitale"
          />
        </a>
        {documents.length > 0 ? (
          <nav className="q7-footer__nav" aria-label="Informações legais">
            {documents.map((document) => (
              <a key={document.path} href={document.path}>{document.navigationLabel}</a>
            ))}
          </nav>
        ) : null}
        <div className="q7-footer__meta">
          {hasCnpj ? <span>CNPJ {institutionalFacts.cnpj.value}</span> : null}
          <span>© {new Date().getFullYear()} Belvitale</span>
        </div>
      </div>
    </footer>
  );
}
