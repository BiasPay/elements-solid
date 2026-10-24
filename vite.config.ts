import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type UserConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(rootDir, "src");

type BuildKind = "production" | "server";

function createLibraryConfig({
    kind,
    fileName,
    emptyOutDir,
    allowedHosts,
}: {
    kind: BuildKind;
    fileName: "index.js" | "server.js";
    emptyOutDir: boolean;
    allowedHosts: string[];
}): UserConfig {
    const isServer = kind === "server";
    const entryFile = path.resolve(srcDir, isServer ? "server.ts" : "index.tsx");

    return {
        resolve: {
            alias: {
                "~": srcDir,
            },
        },
        plugins: [solidPlugin()],
        server: {
            allowedHosts,
        },
        define: {
            "process.env.NODE_ENV": JSON.stringify("production"),
            "process.env.PROD": JSON.stringify(true),
            "process.env.DEV": JSON.stringify(false),
            "process.env.SSR": JSON.stringify(isServer),
            "import.meta.env.NODE_ENV": JSON.stringify("production"),
            "import.meta.env.PROD": JSON.stringify(true),
            "import.meta.env.DEV": JSON.stringify(false),
            "import.meta.env.SSR": JSON.stringify(isServer),
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
                external: ["solid-js", "solid-js/web", "@biaspay/sdk", "@biaspay/elements"],
                output: {
                    entryFileNames: () => fileName,
                },
            },
        },
    };
}

export default defineConfig(({ mode }) => {
    const isServer = mode === "server";
    const remoteDevelopmentHost = loadEnv(
        mode,
        path.resolve(rootDir, "../../.."),
        "",
    ).REMOTE_DEVELOPMENT_URL;

    return createLibraryConfig({
        kind: isServer ? "server" : "production",
        fileName: isServer ? "server.js" : "index.js",
        emptyOutDir: !isServer,
        allowedHosts: remoteDevelopmentHost ? [remoteDevelopmentHost] : [],
    });
});
