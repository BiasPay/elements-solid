import { describe, expect, it } from "vitest";
import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";
import { useField, useFieldState, useAttemptPayment, PaymentForm, BiasProvider } from "../src";
import { renderWithProvider, withProvider } from "./helpers";
import { createMockSession } from "../../test-shared/mocks";

describe("smoke", () => {
    it("renders bias-payment-form inside bias-provider", async () => {
        const { container, dispose } = await renderWithProvider(() => <PaymentForm />);
        expect(container.querySelector("bias-provider")).not.toBeNull();
        expect(container.querySelector("bias-payment-form")).not.toBeNull();
        dispose();
    });

    it("updates payment form theme variables after mount", async () => {
        const [color, setColor] = createSignal("#192d58");
        const container = document.createElement("div");
        document.body.append(container);
        const dispose = render(
            () => (
                <BiasProvider clientSecret="cs_test_secret" _previewSession={createMockSession()}>
                    <PaymentForm variables={{ colorPrimary: color() }} />
                </BiasProvider>
            ),
            container,
        );
        flush();
        await Promise.resolve();
        flush();

        const element = container.querySelector("bias-payment-form") as any;
        expect(element).not.toBeNull();
        expect(element?.style.getPropertyValue("--bias-color-primary")).toBe("#192d58");
        expect(element.variables).toEqual({ colorPrimary: "#192d58" });

        setColor("#2734ec");
        flush();
        await Promise.resolve();
        flush();

        expect(element?.style.getPropertyValue("--bias-color-primary")).toBe("#2734ec");
        expect(element.variables).toEqual({ colorPrimary: "#2734ec" });

        dispose();
        container.remove();
    });

    it('useField("postalCode") can set value through the bridge', async () => {
        const { result: field, dispose } = await withProvider(() => useField("postalCode"));
        field.setValue("12345");
        flush();
        expect(field.value()).toBe("12345");
        dispose();
    });

    it("updates validation errors after attemptPayment", async () => {
        const { result, dispose } = await withProvider(() => ({
            fieldState: useFieldState(),
            attemptPayment: useAttemptPayment(),
        }));

        result.attemptPayment();
        flush();

        expect(result.fieldState().postalCode.error).toBe("Required");
        dispose();
    });
});
