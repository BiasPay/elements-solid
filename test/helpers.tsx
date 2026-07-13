/**
 * Solid test helpers — provides a mock BiasProvider wrapper
 * and a render utility that returns a container element.
 */
import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import type { CheckoutSession } from "@biaspay/sdk";
import type { Appearance } from "../src";
import { BiasProvider } from "../src";
import { createMockSession } from "./fixtures/mocks";
import { settleBiasElements } from "./setup";

type WrapperOptions = {
    session?: CheckoutSession;
    clientSecret?: string;
    onComplete?: () => void;
    appearance?: Appearance | (() => Appearance);
};

type RenderResult = {
    container: HTMLDivElement;
    dispose: () => void;
};

export async function renderWithProvider(
    ui: () => JSX.Element,
    options: WrapperOptions = {},
): Promise<RenderResult> {
    const session = options.session ?? createMockSession();
    const clientSecret = options.clientSecret ?? session.client_secret;
    const container = document.createElement("div");
    document.body.append(container);
    const dispose = render(
        () => (
            <BiasProvider
                clientSecret={clientSecret}
                initialCheckoutSession={session}
                onComplete={options.onComplete}
                appearance={
                    typeof options.appearance === "function"
                        ? options.appearance()
                        : options.appearance
                }
            >
                {ui()}
            </BiasProvider>
        ),
        container,
    );
    await settleBiasElements(container);

    return { container, dispose: () => { dispose(); container.remove(); } };
}

/**
 * Run a function inside a BiasProvider context (for testing hooks).
 * Uses render() to set up proper context, then captures the result.
 */
export async function withProvider<T>(
    fn: () => T,
    options: WrapperOptions = {},
): Promise<{ result: T; dispose: () => void }> {
    const session = options.session ?? createMockSession();
    const clientSecret = options.clientSecret ?? session.client_secret;
    const container = document.createElement("div");
    document.body.append(container);
    let result!: T;
    const dispose = render(
        () => (
            <BiasProvider
                clientSecret={clientSecret}
                initialCheckoutSession={session}
                onComplete={options.onComplete}
                appearance={
                    typeof options.appearance === "function"
                        ? options.appearance()
                        : options.appearance
                }
            >
                {(() => {
                    result = fn();
                    return null;
                })()}
            </BiasProvider>
        ),
        container,
    );
    await settleBiasElements(container);

    return { result, dispose: () => { dispose(); container.remove(); } };
}
