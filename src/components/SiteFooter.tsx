import {
  getTelephoneHref,
  institutionalFacts,
  isConfirmedInstitutionalFact,
} from "../data/institutionalFacts";
import { getPublicLegalDocuments } from "../data/legalDocuments";
import { commercialNavigationReady } from "../data/commercialPreview";

const footerNavigation = [
  { label: "Escolha", href: "#liberdade" },
  { label: "CeluClin", href: "#celuclin" },
  { label: "Fórmula", href: "#composicao" },
  { label: "Resultados", href: "#resultados" },
  { label: "Rótulo", href: "#rotulo" },
  ...(commercialNavigationReady
    ? [{ label: "Opções", href: "#ofertas" } as const]
    : []),
  { label: "Dúvidas", href: "#faq" },
] as const;

export function SiteFooter() {
  const documents = getPublicLegalDocuments();
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
            <img
              src="/brand/belvitale-wordmark-light.webp"
              width="2508"
              height="627"
              alt="Belvitale"
              loading="lazy"
              decoding="async"
            />
          </a>
          <p>
            CeluClin é um suplemento alimentar e não é medicamento.
            Experiências individuais podem variar.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <h2>Explore</h2>
          <ul>
            {footerNavigation.map((link) => (
              <li key={link.href}><a href={link.href}>{link.label}</a></li>
            ))}
          </ul>
        </nav>

        {hasPhone || hasCnpj ? (
          <div className="site-footer__contact">
            <h2>Marca e suporte</h2>
            <dl>
              {hasPhone ? (
                <div>
                  <dt>SAC</dt>
                  <dd><a href={telephoneHref}>{institutionalFacts.phone.value}</a></dd>
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

        {documents.length > 0 ? (
          <nav aria-label="Informações legais">
            <h2>Legal</h2>
            <ul>
              {documents.map((document) => (
                <li key={document.path}>
                  <a href={document.path}>{document.navigationLabel}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>

      <div className="section-shell site-footer__bottom">
        <p>© {new Date().getFullYear()} Belvitale.</p>
        <p>CeluClin · suplemento alimentar</p>
      </div>
    </footer>
  );
}
