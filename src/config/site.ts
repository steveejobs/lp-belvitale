export const navigationItems = [
  { label: "Produto", href: "#celuclin" },
  { label: "Composição", href: "#composicao" },
  { label: "Resultados", href: "#resultados" },
  { label: "Opções", href: "#ofertas" },
] as const;

function isReservedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.endsWith(".test") ||
    normalized.endsWith(".invalid") ||
    normalized.endsWith(".example")
  );
}

function getCanonicalUrl() {
  const configuredUrl = import.meta.env.VITE_CANONICAL_URL?.trim();
  if (configuredUrl === undefined || configuredUrl.length === 0) return null;

  try {
    const url = new URL(configuredUrl);
    return url.protocol === "https:" && !isReservedHostname(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export const canonicalUrl = getCanonicalUrl();
