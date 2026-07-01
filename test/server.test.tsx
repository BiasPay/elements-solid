import { isServer } from "@solidjs/web";
import { describe, expect, it } from "vitest";

describe("environment", () => {
    it("runs on server", () => {
        expect(typeof window).toBe("undefined");
        expect(isServer).toBe(true);
    });
});
