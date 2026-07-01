import path from "node:path";
import solidPlugin from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
    // to test in server environment, run with "--mode ssr" or "--mode test:ssr" flag
    // loads only server.test.ts file
    const testSSR = mode === "test:ssr" || mode === "ssr";

    return {
        plugins: [
            solidPlugin({
                // https://github.com/solidjs/solid-refresh/issues/29
                hot: false,
                // For testing SSR we need to do a SSR JSX transform
                solid: { generate: testSSR ? "ssr" : "dom" },
            }),
        ],
        test: {
            setupFiles: ["test/setup.ts"],
            watch: false,
            isolate: !testSSR,
            env: {
                NODE_ENV: testSSR ? "production" : "development",
                DEV: testSSR ? "" : "1",
                SSR: testSSR ? "1" : "",
                PROD: testSSR ? "1" : "",
            },
            environment: testSSR ? "node" : "jsdom",
            transformMode: { web: [/\.[jt]sx$/] },
            ...(testSSR
                ? {
                      include: ["test/server.test.{ts,tsx}"],
                  }
                : {
                      include: ["test/*.test.{ts,tsx}"],
                      exclude: ["test/server.test.{ts,tsx}"],
                  }),
        },
        resolve: {
            alias: {
                "~/components": path.resolve(__dirname, "src/components.ts"),
                "~/provider": path.resolve(__dirname, "src/provider.tsx"),
                "~": path.resolve(__dirname, "src"),
            },
            conditions: testSSR ? ["node"] : ["browser", "development"],
        },
    };
});
