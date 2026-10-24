import { isServer, renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import * as sdk from "../src";
import { BiasProvider, CardElement, ExpressCheckoutElement } from "../src";
import * as server from "../src/server";

describe("environment", () => {
    it("runs on server", () => {
        expect(typeof window).toBe("undefined");
        expect(isServer).toBe(true);
    });

    it("exports the same runtime API as the browser entry", () => {
        expect(Object.keys(server).sort()).toEqual(Object.keys(sdk).sort());
    });

    it("serializes custom-element hosts without evaluating their browser implementation", () => {
        expect(renderToString(() => <CardElement />)).toBe(
            "<bias-card-element></bias-card-element>",
        );
        expect(renderToString(() => <ExpressCheckoutElement />)).toBe(
            "<bias-express-checkout-element></bias-express-checkout-element>",
        );
    });

    it("renders no provider checkout markup and does not activate during SSR", () => {
        expect(
            renderToString(() => (
                <BiasProvider clientSecret="cs_test">
                    <div>secret UI</div>
                </BiasProvider>
            )),
        ).toBe("");
    });
});
