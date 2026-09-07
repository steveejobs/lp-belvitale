import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import {
  defineConfig,
  loadEnv,
  type Plugin,
  type PreviewServer,
  type ViteDevServer,
} from "vite";
import { regulatoryPublicationReady } from "./src/data/regulatoryFacts";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const homeEntry = path.resolve(rootDirectory, "index.html");
const restrictedPublicFolders = ["checkout"];
const obsoletePublicFiles = [
  path.join("label", "celuclin-label-front-hero.webp"),
];

function excludeUnverifiedMedia(internalMediaPreview: boolean): Plugin {
  return {
    name: "exclude-unverified-media",
    apply: "build",
    async closeBundle() {
      if (internalMediaPreview) return;
      await Promise.all(
        [
          ...restrictedPublicFolders.map((folder) => path.join(folder)),
          ...obsoletePublicFiles,
        ].map(async (target) =>
          rm(path.join(rootDirectory, "dist", target), {
            recursive: true,
            force: true,
          }),
        ),
      );
    },
  };
}

function preloadHomeHeroMedia(): Plugin {
  return {
    name: "preload-home-hero-media",
    transformIndexHtml(html, context) {
      if (path.resolve(context.filename) !== homeEntry) {
        return html;
      }

      return html.replace(
        "</head>",
        '    <link rel="preload" href="/product/celuclin-front-02-hero-mobile.webp" as="image" type="image/webp" media="(max-width: 47.99rem)" fetchpriority="high" />\n    <link rel="preload" href="/product/celuclin-front-02.webp" as="image" type="image/webp" media="(min-width: 48rem)" fetchpriority="high" />\n  </head>',
      );
    },
  };
}

function serveQuizHtmlEntries(): Plugin {
  function rewriteQuizRequest(requestUrl: string | undefined): string | undefined {
    if (requestUrl === undefined) return undefined;
    const url = new URL(requestUrl, "http://belvitale.local");
    const normalized = url.pathname.length > 1 && url.pathname.endsWith("/")
      ? url.pathname.slice(0, -1)
      : url.pathname;
    if (normalized === "/quiz") {
      return `/quiz/index.html${url.search}`;
    }
    if (normalized === "/quiz/resultado") {
      return `/quiz/resultado/index.html${url.search}`;
    }
    if (normalized === "/quiz/analytics") {
      return `/quiz/analytics/index.html${url.search}`;
    }
    if (normalized === "/quiz-monj") {
      return `/quiz-monj/index.html${url.search}`;
    }
    if (normalized === "/quiz-monj/resultado") {
      return `/quiz-monj/resultado/index.html${url.search}`;
    }
    return undefined;
  }

  const configure = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((request, _response, next) => {
      const rewritten = rewriteQuizRequest(request.url);
      if (rewritten !== undefined) request.url = rewritten;
      next();
    });
  };

  return {
    name: "serve-quiz-html-entries",
    configureServer(server) {
      configure(server);
    },
    configurePreviewServer(server) {
      configure(server);
    },
  };
}

function parseCanonicalUrl(value: string | undefined): URL | null {
  if (value === undefined || value.trim().length === 0) return null;
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();
    const reserved =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".test") ||
      hostname.endsWith(".invalid") ||
      hostname.endsWith(".example");
    return url.protocol === "https:" && !reserved ? url : null;
  } catch {
    return null;
  }
}

function replaceRobots(html: string, content: string): string {
  return html.replace(
    /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="robots" content="${content}" />`,
  );
}

function homePreviewSeo(enabled: boolean, canonicalBase: URL | null): Plugin {
  return {
    name: "home-preview-seo",
    transformIndexHtml(html, context) {
      if (
        !enabled ||
        canonicalBase === null ||
        path.resolve(context.filename) !== homeEntry
      ) {
        return html;
      }

      const homeUrl = new URL("/", canonicalBase).toString();
      const imageUrl = new URL(
        "/product/celuclin-front-02.webp",
        canonicalBase,
      ).toString();
      const tags = [
        `<link rel="canonical" href="${homeUrl}" />`,
        `<meta property="og:url" content="${homeUrl}" />`,
        `<meta property="og:image" content="${imageUrl}" />`,
        '<meta property="og:image:width" content="1122" />',
        '<meta property="og:image:height" content="1402" />',
        '<meta name="twitter:card" content="summary_large_image" />',
        `<script type="application/ld+json">${JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "CeluClin",
          description:
            "Suplemento alimentar em cápsulas da Belvitale com 60 cápsulas.",
          image: imageUrl,
          brand: { "@type": "Brand", name: "Belvitale" },
          category: "Suplemento alimentar em cápsulas",
        })}</script>`,
      ].join("\n    ");

      return replaceRobots(html, "index, follow").replace(
        "</head>",
        `    ${tags}\n  </head>`,
      );
    },
  };
}

function quizPublicationSeo(
  approved: boolean,
  canonicalBase: URL | null,
  writeBuildArtifacts: boolean,
): Plugin {
  const quizEntry = path.resolve(rootDirectory, "quiz", "index.html");
  const resultEntry = path.resolve(
    rootDirectory,
    "quiz",
    "resultado",
    "index.html",
  );

  return {
    name: "quiz-publication-seo",
    transformIndexHtml(html, context) {
      const isQuiz = path.resolve(context.filename) === quizEntry;
      const isResult = path.resolve(context.filename) === resultEntry;
      if (!approved || (!isQuiz && !isResult) || canonicalBase === null) {
        return html;
      }

      const quizUrl = new URL("/quiz", canonicalBase).toString();
      const robots = isResult ? "noindex, follow" : "index, follow";
      const tags = [
        `<link rel="canonical" href="${quizUrl}" />`,
        '<meta property="og:title" content="Quiz de rotina | Belvitale" />',
        '<meta property="og:description" content="Uma conversa em 12 perguntas para entender como a celulite influencia sua rotina e encontrar um caminho de cuidado sem pressão." />',
        '<meta property="og:type" content="website" />',
        `<meta property="og:url" content="${quizUrl}" />`,
      ].join("\n    ");

      return replaceRobots(html, robots).replace(
        "</head>",
        `    ${tags}\n  </head>`,
      );
    },
    async closeBundle() {
      if (!writeBuildArtifacts) return;
      const sitemapPath = path.join(rootDirectory, "dist", "sitemap.xml");
      if (!approved || canonicalBase === null) {
        await rm(sitemapPath, { force: true });
        return;
      }

      const quizUrl = new URL("/quiz", canonicalBase).toString();
      await writeFile(
        sitemapPath,
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${quizUrl}</loc></url>\n</urlset>\n`,
        "utf8",
      );
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const loadedEnvironment = loadEnv(mode, rootDirectory, "");
  const publicationValue =
    process.env.VITE_QUIZ_PUBLICATION_STATUS ??
    loadedEnvironment.VITE_QUIZ_PUBLICATION_STATUS;
  const canonicalValue =
    process.env.VITE_CANONICAL_URL ?? loadedEnvironment.VITE_CANONICAL_URL;
  const internalMediaPreview =
    (process.env.VITE_INTERNAL_MEDIA ??
      loadedEnvironment.VITE_INTERNAL_MEDIA) === "true";
  const seoPreviewEnabled =
    (process.env.VITE_SEO_PREVIEW ??
      loadedEnvironment.VITE_SEO_PREVIEW) === "enabled";
  const publicationRequested = publicationValue === "approved";
  const publicationApproved =
    publicationRequested && regulatoryPublicationReady;
  const canonicalBase = parseCanonicalUrl(canonicalValue);

  if (publicationRequested && !regulatoryPublicationReady) {
    throw new Error(
      "O quiz não pode ser aprovado enquanto o gate sanitário estiver pendente.",
    );
  }

  if (publicationApproved && canonicalBase === null) {
    throw new Error(
      "VITE_CANONICAL_URL válida é obrigatória quando o quiz está approved.",
    );
  }

  return {
    resolve: {
      alias: [
        { find: /^react-dom\/test-utils$/, replacement: "preact/test-utils" },
        { find: /^react-dom\/client$/, replacement: "preact/compat/client" },
        { find: /^react-dom$/, replacement: "preact/compat" },
        { find: /^react\/jsx-runtime$/, replacement: "preact/jsx-runtime" },
        { find: /^react\/jsx-dev-runtime$/, replacement: "preact/jsx-dev-runtime" },
        { find: /^react$/, replacement: "preact/compat" },
      ],
    },
    plugins: [
      react(),
      serveQuizHtmlEntries(),
      preloadHomeHeroMedia(),
      homePreviewSeo(seoPreviewEnabled, canonicalBase),
      quizPublicationSeo(
        publicationApproved,
        canonicalBase,
        command === "build",
      ),
      excludeUnverifiedMedia(internalMediaPreview),
    ],
    build: {
      sourcemap: false,
      rollupOptions: {
        input: {
          main: path.resolve(rootDirectory, "index.html"),
          quiz: path.resolve(rootDirectory, "quiz", "index.html"),
          quizAnalytics: path.resolve(rootDirectory, "quiz", "analytics", "index.html"),
          quizResult: path.resolve(
            rootDirectory,
            "quiz",
            "resultado",
            "index.html",
          ),
          quizMonj: path.resolve(rootDirectory, "quiz-monj", "index.html"),
          quizMonjResult: path.resolve(
            rootDirectory,
            "quiz-monj",
            "resultado",
            "index.html",
          ),
        },
      },
    },
  };
});
