import { isServer, renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { BiasProvider, CardElement } from "../src";

describe("environment", () => {
    it("runs on server", () => {
        expect(typeof window).toBe("undefined");
        expect(isServer).toBe(true);
    });

    it("serializes custom-element hosts without evaluating their browser implementation", () => {
        expect(renderToString(() => <CardElement />)).toBe(
            "<bias-card-element></bias-card-element>",
        );
    });

    it("renders no provider checkout markup and does not activate during SSR", () => {
        expect(renderToString(() => <BiasProvider clientSecret="cs_test"><div>secret UI</div></BiasProvider>)).toBe("");
    });
});
