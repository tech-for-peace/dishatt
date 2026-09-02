import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "path";

function git(command: string, fallback: string): string {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
}

const pkg = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf-8"),
) as { version: string };

const appVersion = pkg.version || "0.0.0";
const gitCommit = git("git rev-parse --short HEAD", "dev");
const gitCommitDate = git("git log -1 --format=%cI", new Date().toISOString());

process.env.VITE_APP_VERSION = appVersion;
process.env.VITE_GIT_COMMIT = gitCommit;
process.env.VITE_GIT_COMMIT_DATE = gitCommitDate;

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
    "import.meta.env.VITE_GIT_COMMIT": JSON.stringify(gitCommit),
    "import.meta.env.VITE_GIT_COMMIT_DATE": JSON.stringify(gitCommitDate),
  },
  plugins: [react()],
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-dom") ||
              id.includes("/react/") ||
              id.includes("react-i18next")
            )
              return "vendor-react";
            if (id.includes("react-router")) return "vendor-router";
            if (id.includes("i18next")) return "vendor-i18n";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("lucide-react")) return "vendor-icons";
          }
        },
      },
    },
  },
}));
