import { lazy, Suspense } from "react";
import { CampaignClosing } from "./components/CampaignClosing";
import { CampaignHero } from "./components/CampaignHero";
import { ChoiceSequence } from "./components/ChoiceSequence";
import { EducationSection } from "./components/EducationSection";
import { FaqSection } from "./components/FaqSection";
import { FormulaSection } from "./components/FormulaSection";
import { LegalDocumentRoute } from "./components/LegalDocumentRoute";
import { ProductStory } from "./components/ProductStory";
import { RoutineSection } from "./components/RoutineSection";
import { SeoMetadata } from "./components/SeoMetadata";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { getLegalDocumentByPath } from "./data/legalDocuments";
import { regulatoryFacts } from "./data/regulatoryFacts";
import { useAccessibleHashFocus } from "./hooks/useAccessibleHashFocus";
import { isQuizPath } from "./quiz/quizRouting";
import "./home.css";

const QuizRoute = lazy(() =>
  import("./components/QuizRoute").then((module) => ({ default: module.QuizRoute })),
);
const LabelTransparency = lazy(() =>
  import("./components/LabelTransparency").then((module) => ({ default: module.LabelTransparency })),
);
const ProofStories = lazy(() =>
  import("./components/ProofStories").then((module) => ({ default: module.ProofStories })),
);
const CommercialSection = lazy(() =>
  import("./components/CommercialSection").then((module) => ({ default: module.CommercialSection })),
);

function RouteLoading() {
  return <div className="route-loading" role="status"><span aria-hidden="true" />Preparando a experiência…</div>;
}

export function App() {
  useAccessibleHashFocus();

  if (isQuizPath(window.location.pathname)) {
    return <Suspense fallback={<RouteLoading />}><QuizRoute /></Suspense>;
  }

  const legalDocument = getLegalDocumentByPath(window.location.pathname);
  if (legalDocument !== null) return <LegalDocumentRoute document={legalDocument} />;

  return (
    <div className="site" data-regulatory-status={regulatoryFacts.sanitaryStatus}>
      <SeoMetadata />
      <a className="skip-link" href="#conteudo-principal">Ir para o conteúdo</a>
      <SiteHeader />
      <main id="conteudo-principal">
        <CampaignHero />
        <ProductStory />
        <ChoiceSequence />
        <EducationSection />
        <FormulaSection />
        <Suspense fallback={<div className="section-placeholder section-placeholder--proof" aria-hidden="true" />}>
          <ProofStories />
        </Suspense>
        <Suspense fallback={<div className="section-placeholder" aria-hidden="true" />}>
          <LabelTransparency />
        </Suspense>
        <RoutineSection />
        <Suspense fallback={null}><CommercialSection /></Suspense>
        <FaqSection />
        <CampaignClosing />
      </main>
      <SiteFooter />
    </div>
  );
}
