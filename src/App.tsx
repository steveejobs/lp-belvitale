import { lazy, Suspense } from "react";
import { BelvitaleInstitutional } from "./components/BelvitaleInstitutional";
import { EducationSection } from "./components/EducationSection";
import { FaqSection } from "./components/FaqSection";
import { FormulaSection } from "./components/FormulaSection";
import { FreedomEditorial } from "./components/FreedomEditorial";
import { InstitutionalHero } from "./components/InstitutionalHero";
import { LegalDocumentRoute } from "./components/LegalDocumentRoute";
import { ProductReveal } from "./components/ProductReveal";
import { QuizHomeCta } from "./components/QuizHomeCta";
import { RoutineSection } from "./components/RoutineSection";
import { SeoMetadata } from "./components/SeoMetadata";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { getLegalDocumentByPath } from "./data/legalDocuments";
import { regulatoryFacts } from "./data/regulatoryFacts";
import { isQuizPath } from "./quiz/quizRouting";

const QuizRoute = lazy(() =>
  import("./components/QuizRoute").then((module) => ({
    default: module.QuizRoute,
  })),
);
const LabelTransparency = lazy(() =>
  import("./components/LabelTransparency").then((module) => ({
    default: module.LabelTransparency,
  })),
);
const CommercialSection = import.meta.env.DEV
  ? lazy(() =>
      import("./components/CommercialSection").then((module) => ({
        default: module.CommercialSection,
      })),
    )
  : null;
const ProofGallery = import.meta.env.DEV
  ? lazy(() =>
      import("./components/ProofGallery").then((module) => ({
        default: module.ProofGallery,
      })),
    )
  : null;

function RouteLoading() {
  return (
    <div className="route-loading" role="status">
      <span aria-hidden="true" />
      Preparando a experiência…
    </div>
  );
}

export function App() {
  if (isQuizPath(window.location.pathname)) {
    return (
      <Suspense fallback={<RouteLoading />}>
        <QuizRoute />
      </Suspense>
    );
  }

  const legalDocument = getLegalDocumentByPath(window.location.pathname);
  if (legalDocument !== null) {
    return <LegalDocumentRoute document={legalDocument} />;
  }

  return (
    <div
      className="site"
      data-regulatory-status={regulatoryFacts.sanitaryStatus}
    >
      <SeoMetadata />
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo-principal">
        <InstitutionalHero />
        <FreedomEditorial />
        <EducationSection />
        <ProductReveal />
        <FormulaSection />
        <RoutineSection />
        <Suspense fallback={<div className="section-placeholder" aria-hidden="true" />}>
          <LabelTransparency />
        </Suspense>
        {CommercialSection === null ? null : (
          <Suspense fallback={null}>
            <CommercialSection />
          </Suspense>
        )}
        {ProofGallery === null ? null : (
          <Suspense fallback={null}>
            <ProofGallery />
          </Suspense>
        )}
        <QuizHomeCta />
        <FaqSection />
        <BelvitaleInstitutional />
      </main>
      <SiteFooter />
    </div>
  );
}
