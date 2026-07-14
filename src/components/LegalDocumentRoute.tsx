import { useEffect } from "react";
import { canonicalUrl } from "../config/site";
import { getLegalRouteMode, type LegalDocument } from "../data/legalDocuments";

function LegalRouteMetadata({
  document: legalDocument,
  noindex,
}: {
  readonly document: LegalDocument;
  readonly noindex: boolean;
}) {
  useEffect(() => {
    globalThis.document.title = `${legalDocument.title} | Belvitale`;

    const description = globalThis.document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    description?.setAttribute("content", legalDocument.metaDescription);

    let robots = globalThis.document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    if (robots === null) {
      robots = globalThis.document.createElement("meta");
      robots.name = "robots";
      globalThis.document.head.append(robots);
    }
    robots.content = noindex ? "noindex, nofollow" : "index, follow";

    if (!noindex && canonicalUrl !== null) {
      let canonical = globalThis.document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      );
      if (canonical === null) {
        canonical = globalThis.document.createElement("link");
        canonical.rel = "canonical";
        globalThis.document.head.append(canonical);
      }
      canonical.href = new URL(legalDocument.path, canonicalUrl).toString();
    }
  }, [legalDocument, noindex]);

  return null;
}

function LegalUnavailable({ document }: { readonly document: LegalDocument }) {
  return (
    <>
      <LegalRouteMetadata document={document} noindex />
      <a className="skip-link" href="#conteudo-legal">
        Ir para o conteúdo
      </a>
      <main className="legal-route" id="conteudo-legal">
        <div className="legal-route__content">
          <a className="legal-route__brand" href="/">
            Belvitale
          </a>
          <p className="institutional-eyebrow">Informação legal</p>
          <h1>Página não publicada.</h1>
          <p>
            Este documento ainda não está disponível como política oficial da
            Belvitale.
          </p>
          <a className="legal-route__back" href="/">
            Voltar para a página principal
          </a>
        </div>
      </main>
    </>
  );
}

function LegalDraft({ document }: { readonly document: LegalDocument }) {
  return (
    <>
      <LegalRouteMetadata document={document} noindex />
      <a className="skip-link" href="#conteudo-legal">
        Ir para o conteúdo
      </a>
      <main
        className="legal-route"
        id="conteudo-legal"
        data-legal-status={document.status}
      >
        <div className="legal-route__content">
          <a className="legal-route__brand" href="/">
            Belvitale
          </a>
          <p className="institutional-eyebrow">
            Visualização interna · não publicada
          </p>
          <h1>{document.title}</h1>
          <p>
            A estrutura desta página existe apenas para validação técnica. O
            conteúdo jurídico ainda não foi aprovado e não é apresentado como
            política oficial.
          </p>
          <a className="legal-route__back" href="/">
            Voltar para a página principal
          </a>
        </div>
      </main>
    </>
  );
}

export function LegalDocumentRoute({
  document,
}: {
  readonly document: LegalDocument;
}) {
  const mode = getLegalRouteMode(document, import.meta.env.DEV);
  if (mode === "internal-draft") return <LegalDraft document={document} />;
  if (mode === "unavailable") return <LegalUnavailable document={document} />;

  return (
    <>
      <LegalRouteMetadata document={document} noindex={false} />
      <a className="skip-link" href="#conteudo-legal">
        Ir para o conteúdo
      </a>
      <main className="legal-route" id="conteudo-legal">
        <div className="legal-route__content">
          <a className="legal-route__brand" href="/">
            Belvitale
          </a>
          <h1>{document.title}</h1>
          {document.sections?.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
