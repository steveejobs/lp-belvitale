/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CANONICAL_URL?: string;
  readonly VITE_INTERNAL_QUIZ?: string;
  readonly VITE_QUIZ_PUBLICATION_STATUS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
