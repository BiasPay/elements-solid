import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { describe, expect, it, vi } from "vitest";
import * as sdk from "../src";
import { AddressElement, BiasProvider, useBias, useBiasField } from "../src";
import { createMockSession } from "./fixtures/mocks";

describe("public contract", () => {
    it("has the exact runtime export allowlist", () => {
        expect(Object.keys(sdk).sort()).toEqual([
            "AddressElement", "BiasProvider", "CardElement", "ContactElement", "PaymentElement",
            "SubmitButton", "USBankAccountElement", "useBias", "useBiasField",
        ]);
    });

    it("exposes accessor-based state and field bindings", () => {
        const session = createMockSession();
        const container = document.createElement("div");
        let bias!: ReturnType<typeof useBias>;
        let field!: ReturnType<typeof useBiasField<"name">>;
        const dispose = render(() => (
            <BiasProvider clientSecret={session.client_secret} initialCheckoutSession={session}>
                {(() => { bias = useBias(); field = useBiasField("name"); return null; })()}
            </BiasProvider>
        ), container);

        expect(bias.paymentMethod()).toBe("card");
        expect(bias.status()).toBe("idle");
        expect(field.state().value).toBe("");
        field.setValue("Ada Lovelace");
        expect(field.state().value).toBe("Ada Lovelace");
        dispose();
    });

    it("owns field focus, blur, and validator cleanup", () => {
        const session = createMockSession();
        const validator = vi.fn(() => ({ isValid: false, error: "Use a full name" }));
        const container = document.createElement("div");
        let field!: ReturnType<typeof useBiasField<"name">>;
        const dispose = render(() => (
            <BiasProvider clientSecret={session.client_secret} initialCheckoutSession={session}>
                {(() => { field = useBiasField("name", { validate: validator }); return null; })()}
            </BiasProvider>
        ), container);
            field.onFocus();
        expect(field.state().isFocused).toBe(true);
        field.validate();
        expect(validator).toHaveBeenCalledWith("");
        expect(field.state().error).toBe("Use a full name");
        field.onBlur();
        expect(field.state().isFocused).toBe(false);
        dispose();
    });

    it("tracks a normal reactive clientSecret expression", () => {
        const first = createMockSession();
        const [secret, setSecret] = createSignal(first.client_secret);
        const container = document.createElement("div");
        let bias!: ReturnType<typeof useBias>;
        const dispose = render(() => (
            <BiasProvider clientSecret={secret()} initialCheckoutSession={first}>
                {(() => { bias = useBias(); return null; })()}
            </BiasProvider>
        ), container);
            expect(bias.sessionState().status).not.toBe("idle");
        setSecret("cs_replacement");
            expect(["loading", "error"]).toContain(bias.sessionState().status);
        dispose();
    });

    it("updates the latest completion callback through reactive config", () => {
        const session = createMockSession();
        const first = vi.fn();
        const second = vi.fn();
        const [callback, setCallback] = createSignal(first);
        const container = document.createElement("div");
        const dispose = render(() => (
            <BiasProvider clientSecret={session.client_secret} initialCheckoutSession={session} onComplete={callback()}>
                <div />
            </BiasProvider>
        ), container);
        setCallback(() => second);
            expect(first).not.toHaveBeenCalled();
        expect(second).not.toHaveBeenCalled();
        dispose();
    });

    it("mounts and cleans up a scoped address collector", async () => {
        const session = createMockSession();
        const container = document.createElement("div");
        document.body.append(container);
        const dispose = render(() => (
            <BiasProvider clientSecret={session.client_secret} initialCheckoutSession={session}>
                <AddressElement scope="shipping" collectPhone />
            </BiasProvider>
        ), container);
            await Promise.resolve();
        await Promise.resolve();
        expect(container.querySelector(".bias-form")).not.toBeNull();
        expect(container.querySelector('input[autocomplete="tel"]')).not.toBeNull();
        dispose();
        container.remove();
    });

    it("ignores a later initial seed and warns in development", async () => {
        const session = createMockSession();
        const [seed, setSeed] = createSignal(session);
        const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
        const container = document.createElement("div");
        const dispose = render(() => (
            <BiasProvider clientSecret={session.client_secret} initialCheckoutSession={seed()}>
                <div />
            </BiasProvider>
        ), container);
            setSeed({ ...session });
            expect(warning).toHaveBeenCalledWith(expect.stringContaining("initialCheckoutSession"));
        dispose();
        warning.mockRestore();
    });
});
