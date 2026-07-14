import { BelvitaleInstitutional } from "./components/BelvitaleInstitutional";
import { CeluClinIntro } from "./components/CeluClinIntro";
import { CommercialSection } from "./components/CommercialSection";
import { FaqSection } from "./components/FaqSection";
import { FormulaSection } from "./components/FormulaSection";
import { InstitutionalHero } from "./components/InstitutionalHero";
import { LabelTransparency } from "./components/LabelTransparency";
import { LegalDocumentRoute } from "./components/LegalDocumentRoute";
import { ProofGallery } from "./components/ProofGallery";
import { QuizHomeCta } from "./components/QuizHomeCta";
import { QuizRoute } from "./components/QuizRoute";
import { RoutineSection } from "./components/RoutineSection";
import { SeoMetadata } from "./components/SeoMetadata";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { TrustBar } from "./components/TrustBar";
import { commercialPublicationReady } from "./data/commercialOffers";
import { getLegalDocumentByPath } from "./data/legalDocuments";
import { isQuizPath } from "./quiz/quizRouting";

export function App() {
  if (isQuizPath(window.location.pathname)) return <QuizRoute />;

  const legalDocument = getLegalDocumentByPath(window.location.pathname);
  if (legalDocument !== null) {
    return <LegalDocumentRoute document={legalDocument} />;
  }

  return (
    <>
      <SeoMetadata />
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo-principal">
        <InstitutionalHero />
        <TrustBar />
        <CeluClinIntro />
        <FormulaSection />
        <RoutineSection />
        <LabelTransparency />
        {import.meta.env.DEV || commercialPublicationReady ? (
          <CommercialSection />
        ) : null}
        {import.meta.env.DEV ? <ProofGallery /> : null}
        <QuizHomeCta />
        <FaqSection />
        <BelvitaleInstitutional />
      </main>
      <SiteFooter />
    </>
  );
}
