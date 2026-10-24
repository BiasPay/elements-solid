import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { describe, expect, it, vi } from "vitest";
import * as sdk from "../src";
import { AddressElement, BiasProvider, useBias, useBiasField } from "../src";
import { createMockSession } from "./fixtures/mocks";
import { setMockCheckoutSession, settleBiasElements } from "./setup";

describe("public contract", () => {
    it("has the exact runtime export allowlist", () => {
        expect(Object.keys(sdk).sort()).toEqual([
            "AddressElement",
            "BiasProvider",
            "CardElement",
            "ContactElement",
            "DiscountCodeElement",
            "ExpressCheckoutElement",
            "PaymentElement",
            "RememberDetailsCheckbox",
            "SubmitButton",
            "USBankAccountElement",
            "useBias",
            "useBiasField",
        ]);
    });

    it("exposes accessor-based state and field bindings", async () => {
        const session = createMockSession();
        setMockCheckoutSession(session);
        const container = document.createElement("div");
        let bias!: ReturnType<typeof useBias>;
        let field!: ReturnType<typeof useBiasField<"name">>;
        const dispose = render(
            () => (
                <BiasProvider clientSecret={session.client_secret}>
                    {(() => {
                        bias = useBias();
                        field = useBiasField("name");
                        return null;
                    })()}
                </BiasProvider>
            ),
            container,
        );
        await settleBiasElements(container);

        expect(bias.paymentMethod()).toBe("card");
        expect(bias.walletAvailability()).toEqual({ applePay: "unavailable" });
        expect(bias.status()).toBe("idle");
        expect(bias.discountCodeState().pendingAction).toBeNull();
        expect(bias.detailsSaveState().status).toBe("idle");
        expect(bias.retryDetailsSave).toEqual(expect.any(Function));
        expect(field.state().value).toBe("");
        field.setValue("Ada Lovelace");
        expect(field.state().value).toBe("Ada Lovelace");
        dispose();
    });

    it("owns field focus, blur, and validator cleanup", async () => {
        const session = createMockSession();
        setMockCheckoutSession(session);
        const validator = vi.fn(() => ({ isValid: false, error: "Use a full name" }));
        const container = document.createElement("div");
        let field!: ReturnType<typeof useBiasField<"name">>;
        const dispose = render(
            () => (
                <BiasProvider clientSecret={session.client_secret}>
                    {(() => {
                        field = useBiasField("name", { validate: validator });
                        return null;
                    })()}
                </BiasProvider>
            ),
            container,
        );
        await settleBiasElements(container);
        field.onFocus();
        expect(field.state().isFocused).toBe(true);
        field.validate();
        expect(validator).toHaveBeenCalledWith("");
        expect(field.state().error).toBe("Use a full name");
        field.onBlur();
        expect(field.state().isFocused).toBe(false);
        dispose();
    });

    it("tracks a normal reactive clientSecret expression", async () => {
        const first = createMockSession();
        setMockCheckoutSession(first);
        const [secret, setSecret] = createSignal(first.client_secret);
        const container = document.createElement("div");
        let bias!: ReturnType<typeof useBias>;
        const dispose = render(
            () => (
                <BiasProvider clientSecret={secret()}>
                    {(() => {
                        bias = useBias();
                        return null;
                    })()}
                </BiasProvider>
            ),
            container,
        );
        await settleBiasElements(container);
        expect(bias.sessionState().status).not.toBe("idle");
        setSecret("cs_replacement");
        expect(["loading", "error"]).toContain(bias.sessionState().status);
        dispose();
    });

    it("mounts and cleans up a scoped address collector", async () => {
        const session = createMockSession();
        setMockCheckoutSession(session);
        const container = document.createElement("div");
        document.body.append(container);
        const dispose = render(
            () => (
                <BiasProvider clientSecret={session.client_secret}>
                    <AddressElement scope="shipping" collectPhone />
                </BiasProvider>
            ),
            container,
        );
        await settleBiasElements(container);
        expect(container.querySelector(".bias-form")).not.toBeNull();
        expect(container.querySelector('input[autocomplete="shipping tel"]')).not.toBeNull();
        dispose();
        container.remove();
    });

    it("does not refresh for structurally equal expansion objects", async () => {
        const session = createMockSession();
        setMockCheckoutSession(session);
        const [expand, setExpand] = createSignal({ discounts: true } as const);
        const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
        const container = document.createElement("div");
        const dispose = render(
            () => (
                <BiasProvider clientSecret={session.client_secret} checkoutSessionExpand={expand()}>
                    <div />
                </BiasProvider>
            ),
            container,
        );
        await settleBiasElements(container);
        setExpand({ discounts: true });
        await settleBiasElements(container);
        expect(warning).not.toHaveBeenCalled();
        dispose();
        warning.mockRestore();
    });
});
