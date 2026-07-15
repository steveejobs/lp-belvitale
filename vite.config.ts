import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { regulatoryPublicationReady } from "./src/data/regulatoryFacts";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const homeEntry = path.resolve(rootDirectory, "index.html");
const restrictedPublicFolders = ["product", "lifestyle", "brand"];
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

function preloadInternalHeroMedia(internalMediaPreview: boolean): Plugin {
  return {
    name: "preload-internal-hero-media",
    transformIndexHtml(html, context) {
      if (
        !internalMediaPreview ||
        path.resolve(context.filename) !== homeEntry
      ) {
        return html;
      }

      return html.replace(
        "</head>",
        '    <link rel="preload" href="/product/celuclin-front-02-640.avif" as="image" type="image/avif" media="(max-width: 47.99rem)" fetchpriority="high" />\n    <link rel="preload" href="/product/celuclin-front-02.webp" as="image" type="image/webp" media="(min-width: 48rem)" fetchpriority="high" />\n  </head>',
      );
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
        '<meta property="og:description" content="Seis perguntas sobre hábitos e preferências para conhecer um perfil neutro de rotina de autocuidado." />',
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
    plugins: [
      react(),
      preloadInternalHeroMedia(internalMediaPreview),
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
          quizResult: path.resolve(
            rootDirectory,
            "quiz",
            "resultado",
            "index.html",
          ),
        },
      },
    },
  };
});
