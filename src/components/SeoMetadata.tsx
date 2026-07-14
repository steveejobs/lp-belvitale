import { canonicalUrl } from "../config/site";
import { regulatoryPublicationReady } from "../data/regulatoryFacts";

export function SeoMetadata() {
  return canonicalUrl === null || !regulatoryPublicationReady ? null : (
    <>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
    </>
  );
}
