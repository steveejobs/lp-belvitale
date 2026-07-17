/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CANONICAL_URL?: string;
  readonly VITE_INTERNAL_QUIZ?: string;
  readonly VITE_INTERNAL_MEDIA?: string;
  readonly VITE_QUIZ_PUBLICATION_STATUS?: string;
  readonly VITE_COMMERCIAL_PREVIEW?: string;
  readonly VITE_QUIZ_PREVIEW?: string;
  readonly VITE_QUIZ_EXPERIMENT_VARIANT?: string;
  readonly VITE_SEO_PREVIEW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
