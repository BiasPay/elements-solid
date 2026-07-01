import { act } from "@testing-library/react";
import { createRoot, flush } from "solid-js";
import { render } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { useBiasContext } from "../src";

describe("environment", () => {
    it("runs on client", () => {
        expect(typeof window).toBe("object");
    });
});

describe("BiasProvider", () => {
    it("throws when hooks are used outside provider", () => {
        expect(() => {
            createRoot((dispose) => {
                const container = document.createElement("div");
                act(() => {
                    render(() => {
                        useBiasContext();
                        return null;
                    }, container);
                    flush();
                });
                dispose();
            });
        }).toThrow();
    });
});
