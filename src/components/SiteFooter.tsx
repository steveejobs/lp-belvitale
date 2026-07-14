import {
  getTelephoneHref,
  institutionalFacts,
  isConfirmedInstitutionalFact,
} from "../data/institutionalFacts";
import { getPublicLegalDocuments } from "../data/legalDocuments";

const footerNavigation = [
  { label: "O CeluClin", href: "#celuclin" },
  { label: "Composição", href: "#composicao" },
  { label: "Rótulo", href: "#rotulo" },
  { label: "Dúvidas", href: "#faq" },
] as const;

export function SiteFooter() {
  const publicLegalDocuments = getPublicLegalDocuments();
  const telephoneHref = getTelephoneHref(institutionalFacts.phone);
  const hasCnpj = isConfirmedInstitutionalFact(institutionalFacts.cnpj);
  const hasPhone =
    isConfirmedInstitutionalFact(institutionalFacts.phone) &&
    telephoneHref !== null;

  return (
    <footer className="site-footer">
      <div className="section-shell site-footer__layout">
        <div className="site-footer__brand">
          <a href="/#inicio" aria-label="Belvitale — início">
            Belvitale
          </a>
          <p>
            CeluClin é um suplemento alimentar e não é medicamento. Experiências
            individuais podem variar.
          </p>
        </div>

        <nav className="site-footer__navigation" aria-label="Rodapé">
          <h2>Navegação</h2>
          <ul>
            {footerNavigation.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {hasPhone || hasCnpj ? (
          <div className="site-footer__contact">
            <h2>Contato e identificação</h2>
            <dl>
              {hasPhone ? (
                <div>
                  <dt>SAC</dt>
                  <dd>
                    <a href={telephoneHref}>{institutionalFacts.phone.value}</a>
                  </dd>
                </div>
              ) : null}
              {hasCnpj ? (
                <div>
                  <dt>CNPJ</dt>
                  <dd>{institutionalFacts.cnpj.value}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        {publicLegalDocuments.length === 0 ? null : (
          <nav className="site-footer__legal" aria-label="Informações legais">
            <h2>Informações legais</h2>
            <ul>
              {publicLegalDocuments.map((document) => (
                <li key={document.path}>
                  <a href={document.path}>{document.navigationLabel}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="section-shell site-footer__bottom">
        <p>© {new Date().getFullYear()} Belvitale.</p>
      </div>
    </footer>
  );
}
