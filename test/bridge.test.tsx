import { createEffect, type JSX } from "solid-js";
import { render } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { BiasProvider, PaymentElement, useBias } from "../src";
import { createMockMultiMethodSession } from "./fixtures/mocks";
import { settleBiasElements } from "./setup";

async function renderBridge(ui: () => JSX.Element, observe?: (bias: ReturnType<typeof useBias>) => void) {
    const session = createMockMultiMethodSession();
    const container = document.createElement("div");
    document.body.append(container);
    let bias!: ReturnType<typeof useBias>;
    const dispose = render(() => (
        <BiasProvider clientSecret={session.client_secret} initialCheckoutSession={session}>
            {(() => { bias = useBias(); observe?.(bias); return null; })()}
            {ui()}
        </BiasProvider>
    ), container);
    await settleBiasElements(container);
    return { container, bias, dispose: () => { dispose(); container.remove(); } };
}

const cardTab = (container: HTMLElement) =>
    container.querySelector<HTMLButtonElement>('[role="tab"][id$="-card"]');
const bankTab = (container: HTMLElement) =>
    container.querySelector<HTMLButtonElement>('[role="tab"][id$="-us_bank_account"]');

describe("Solid to custom-element bridge", () => {
    it("mounts both session-supported payment tabs", async () => {
        const { container, dispose } = await renderBridge(() => <PaymentElement />);
        expect(cardTab(container)?.getAttribute("aria-selected")).toBe("true");
        expect(bankTab(container)?.getAttribute("aria-selected")).toBe("false");
        dispose();
    });

    it("reflects a hook-side payment-method change in renderer DOM", async () => {
        const { container, bias, dispose } = await renderBridge(() => <PaymentElement />);
        bias.setPaymentMethod("us_bank_account");
            await settleBiasElements(container);
        expect(bankTab(container)?.getAttribute("aria-selected")).toBe("true");
        dispose();
    });

    it("reflects a renderer click through the public accessor", async () => {
        const { container, bias, dispose } = await renderBridge(() => <PaymentElement />);
        bankTab(container)?.click();
            await settleBiasElements(container);
        expect(bias.paymentMethod()).toBe("us_bank_account");
        dispose();
    });

    it("reruns Solid effects after Core notifications and stops after cleanup", async () => {
        const seen: Array<string | undefined> = [];
        const { bias, dispose } = await renderBridge(
            () => null,
            (current) => createEffect(() => seen.push(current.paymentMethod())),
        );
        expect(seen).toEqual(["card"]);
        bias.setPaymentMethod("us_bank_account");
            expect(seen[0]).toBe("card");
        expect(seen.at(-1)).toBe("us_bank_account");
        const countAtCleanup = seen.length;
        dispose();
        bias.setPaymentMethod("card");
            expect(seen).toHaveLength(countAtCleanup);
    });
});
