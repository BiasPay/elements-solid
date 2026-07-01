import path from "node:path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

const elementsSrc = path.resolve(__dirname, "../../lit/src");
const elementsCoreSrc = path.resolve(__dirname, "../../core/src");

export default defineConfig({
    envDir: __dirname,
    resolve: {
        alias: {
            src: path.resolve(__dirname, "../src"),
            "~": elementsSrc,
            "@biaspay/web/styles.css": path.resolve(elementsSrc, "styles/styles.css"),
            "@biaspay/web": path.resolve(elementsSrc, "index.ts"),
            "@biaspay/elements-core": path.resolve(elementsCoreSrc, "index.ts"),
        },
    },
    plugins: [
        solidPlugin(),
        {
            name: "Reaplace env variables",
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
        port: 3000,
    },
    build: {
        target: "esnext",
    },
});
