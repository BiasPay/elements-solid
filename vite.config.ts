import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type UserConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(rootDir, "src");
const entryFile = path.resolve(srcDir, "index.tsx");

type BuildKind = "production" | "development";

function createLibraryConfig({
    kind,
    fileName,
    emptyOutDir,
}: {
    kind: BuildKind;
    fileName: "index.js" | "dev.js";
    emptyOutDir: boolean;
}): UserConfig {
    const isDevelopment = kind === "development";

    return {
        resolve: {
            alias: {
                "~": srcDir,
            },
        },
        plugins: [solidPlugin()],
        define: {
            "process.env.NODE_ENV": JSON.stringify(isDevelopment ? "development" : "production"),
            "process.env.PROD": JSON.stringify(!isDevelopment),
            "process.env.DEV": JSON.stringify(isDevelopment),
            "process.env.SSR": "false",
            "import.meta.env.NODE_ENV": JSON.stringify(
                isDevelopment ? "development" : "production",
            ),
            "import.meta.env.PROD": JSON.stringify(!isDevelopment),
            "import.meta.env.DEV": JSON.stringify(isDevelopment),
            "import.meta.env.SSR": "false",
        },
        build: {
            outDir: "dist",
            emptyOutDir,
            sourcemap: false,
            minify: false,
            target: "esnext",
            lib: {
                entry: entryFile,
                formats: ["es"],
                fileName: () => fileName,
            },
            rollupOptions: {
                external: ["solid-js", "@solidjs/web", "@biaspay/web"],
                output: {
                    entryFileNames: () => fileName,
                },
            },
        },
    };
}

export default defineConfig(({ mode }) => {
    const isDevelopment = mode === "development";

    return createLibraryConfig({
        kind: isDevelopment ? "development" : "production",
        fileName: isDevelopment ? "dev.js" : "index.js",
        emptyOutDir: !isDevelopment,
    });
});
