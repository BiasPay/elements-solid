import type { CheckoutSession } from "@biaspay/sdk";
import { vi } from "vitest";
import { createMockSession } from "./fixtures/mocks";

let checkoutSession = createMockSession();

export function setMockCheckoutSession(session: CheckoutSession) {
    checkoutSession = session;
}

vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/events")) {
        return new Response(new ReadableStream({ start() {} }), {
            status: 200,
            headers: { "content-type": "application/x-ndjson" },
        });
    }
    return Response.json(checkoutSession);
});

export async function settleBiasElements(container: HTMLElement) {
    // Svelte custom elements create their inner component on the tick after
    // connectedCallback; allow the provider and leaf upgrade queues to drain.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await vi.waitFor(() => {
        if (!container.querySelector("bias-provider")) {
            throw new Error("BiasProvider has not finished loading");
        }
    });
}
