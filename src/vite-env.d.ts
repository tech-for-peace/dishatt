/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_GIT_COMMIT: string;
  readonly VITE_GIT_COMMIT_DATE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
