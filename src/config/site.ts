export const navigationItems = [
  { label: "O CeluClin", href: "#celuclin" },
  { label: "Composição", href: "#composicao" },
  { label: "Rótulo", href: "#rotulo" },
  { label: "Dúvidas", href: "#duvidas" },
] as const;

function getCanonicalUrl() {
  const configuredUrl = import.meta.env.VITE_CANONICAL_URL?.trim();
  if (configuredUrl === undefined || configuredUrl.length === 0) return null;

  try {
    const url = new URL(configuredUrl);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export const canonicalUrl = getCanonicalUrl();
