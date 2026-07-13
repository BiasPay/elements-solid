import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("packed package", () => {
    const temporary = mkdtempSync(join(tmpdir(), "bias-solid-package-"));
    const extracted = join(temporary, "extracted");
    let packageRoot = "";
    let packedFiles: string[] = [];

    beforeAll(() => {
        execFileSync("bun", ["pm", "pack", "--destination", temporary], { stdio: "pipe" });
        const tarball = readdirSync(temporary).find((name) => name.endsWith(".tgz"));
        if (!tarball) throw new Error("bun pack did not produce a tarball");
        execFileSync("mkdir", ["-p", extracted]);
        execFileSync("tar", ["-xzf", join(temporary, tarball), "-C", extracted]);
        packageRoot = join(extracted, "package");
        packedFiles = readdirSync(packageRoot, { recursive: true }).map(String);
        symlinkSync(join(process.cwd(), "node_modules"), join(packageRoot, "node_modules"));
    });

    afterAll(() => rmSync(temporary, { recursive: true, force: true }));

    it("contains exact dependencies and repository metadata", () => {
        const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
        expect(manifest.dependencies).toEqual({
            "@biaspay/elements": "0.0.1",
            "@biaspay/sdk": "1.0.1",
        });
        expect(manifest.repository).toEqual({
            type: "git",
            url: "git+https://github.com/BiasPay/elements-solid.git",
        });
        expect(manifest.peerDependencies).toEqual({ "solid-js": "^1.9.14" });
    });

    it("imports the web package and contains no service endpoints or development files", () => {
        const production = readFileSync(join(packageRoot, "dist/index.js"), "utf8");
        expect(production).toMatch(/from ["']@biaspay\/elements["']/);
        expect(production).not.toMatch(/https:\/\/(?:api|field)\.biaspay\.com/);
        expect(production).not.toMatch(/bias\.localhost|VITE_BIAS_(?:API_URL|FIELD_FRAME_URL)/);
        expect(production).not.toMatch(/\.\.\/(?:web|test-shared|scripts)/);
        expect(
            packedFiles.some((file) => /(?:^|\/)(?:dev|test|scripts)(?:\/|$)|\.env/.test(file)),
        ).toBe(false);
    });
});
