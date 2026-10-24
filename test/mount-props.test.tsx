import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { ExpressCheckoutElement, PaymentElement, SubmitButton } from "../src";
import { renderWithProvider } from "./helpers";

describe("reactive renderer props", () => {
    it("forwards and updates the saved payment method email without remounting", async () => {
        const [email, setEmail] = createSignal<string | undefined>("shopper@example.com");
        const [collectBilling, setCollectBilling] = createSignal(false);
        const [expressDisabled, setExpressDisabled] = createSignal(false);
        const { container, dispose } = await renderWithProvider(() => (
            <>
                <ExpressCheckoutElement
                    disabled={expressDisabled()}
                    showSeparator={collectBilling()}
                />
                <PaymentElement
                    savedPaymentMethodEmail={email()}
                    collectBillingAddress={collectBilling()}
                />
            </>
        ));
        const payment = container.querySelector("bias-payment-element")!;
        expect(payment.savedPaymentMethodEmail).toBe("shopper@example.com");
        setEmail("updated@example.com");
        setCollectBilling(true);
        setExpressDisabled(true);
        expect(payment.savedPaymentMethodEmail).toBe("updated@example.com");
        expect(payment.collectBillingAddress).toBe(true);
        const express = container.querySelector("bias-express-checkout-element")!;
        expect(express.disabled).toBe(true);
        expect(express.showSeparator).toBe(true);
        setEmail(undefined);
        expect(payment.savedPaymentMethodEmail).toBeUndefined();
        expect(container.querySelector("bias-payment-element")).toBe(payment);
        dispose();
    });
    it("updates renamed label and native disabled props without remounting", async () => {
        const [label, setLabel] = createSignal("Pay now");
        const [disabled, setDisabled] = createSignal(false);
        const { container, dispose } = await renderWithProvider(() => (
            <SubmitButton label={label()} disabled={disabled()} />
        ));
        const button = container.querySelector<HTMLButtonElement>("button[type=submit]")!;
        expect(button.textContent).toContain("Pay now");

        setLabel("Confirm");
        setDisabled(true);
        await Promise.resolve();
        expect(button.textContent).toContain("Confirm");
        expect(button.disabled).toBe(true);
        dispose();
    });

    it("reactively updates provider appearance variables", async () => {
        const [color, setColor] = createSignal("red");
        const { container, dispose } = await renderWithProvider(() => <div />, {
            appearance: () => ({ variables: { colorPrimary: color() } }),
        });
        const provider = container.querySelector<HTMLElement>(".bias-provider")!;
        expect(provider.style.getPropertyValue("--bias-color-primary")).toBe("red");
        setColor("blue");
        expect(provider.style.getPropertyValue("--bias-color-primary")).toBe("blue");
        dispose();
    });
});
