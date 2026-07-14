import { canonicalUrl } from "../config/site";

export function SeoMetadata() {
  return canonicalUrl === null ? null : (
    <>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
    </>
  );
}
