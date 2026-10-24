import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import solidPlugin from "vite-plugin-solid";

// `@biaspay/elements` ships pre-compiled JS with styles injected at import time,
// so the dev app consumes it like any published package — no Svelte compiler
// here, exactly as a real Solid consumer would have.
export default defineConfig(({ mode }) => {
    const remoteDevelopmentHost = loadEnv(
        mode,
        path.resolve(__dirname, "../../../.."),
        "",
    ).REMOTE_DEVELOPMENT_URL;

    return {
        envDir: __dirname,
        resolve: {
            alias: {
                src: path.resolve(__dirname, "../src"),
            },
            // Ensure a single Solid copy (dev app + package source).
            dedupe: ["solid-js"],
        },
        plugins: [
            solidPlugin(),
            {
                name: "Replace env variables",
                transform(code, id) {
                    if (id.includes("node_modules")) {
                        return code;
                    }
                    return code
                        .replace(/process\.env\.SSR/g, "false")
                        .replace(/process\.env\.DEV/g, "true")
                        .replace(/process\.env\.PROD/g, "false")
                        .replace(/process\.env\.NODE_ENV/g, '"development"')
                        .replace(/import\.meta\.env\.SSR/g, "false")
                        .replace(/import\.meta\.env\.DEV/g, "true")
                        .replace(/import\.meta\.env\.PROD/g, "false")
                        .replace(/import\.meta\.env\.NODE_ENV/g, '"development"');
                },
            },
        ],
        server: {
            port: 3006,
            allowedHosts: remoteDevelopmentHost ? [remoteDevelopmentHost] : [],
        },
        build: {
            target: "esnext",
        },
    };
});
