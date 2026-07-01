/**
 * Solid test helpers — provides a mock BiasProvider wrapper
 * and a render utility that returns a container element.
 */
import { act } from "@testing-library/react";
import { flush, type JSX } from "solid-js";
import { render } from "@solidjs/web";
import type { CheckoutSession } from "@biaspay/server";
import { BiasProvider } from "../src";
import { createMockSession } from "../../test-shared/mocks";
import { settleBiasElements } from "./setup";

type WrapperOptions = {
    session?: CheckoutSession;
    clientSecret?: string;
    onComplete?: () => void;
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
    const clientSecret = options.clientSecret ?? "cs_test_secret";
    const container = document.createElement("div");
    let dispose!: () => void;

    await act(async () => {
        dispose = render(
            () => (
                <BiasProvider
                    clientSecret={clientSecret}
                    _previewSession={session}
                    onComplete={options.onComplete}
                >
                    {ui()}
                </BiasProvider>
            ),
            container,
        );
        flush();
        await settleBiasElements(container);
    });

    return { container, dispose };
}

export async function renderComponent(ui: () => JSX.Element): Promise<RenderResult> {
    const container = document.createElement("div");
    let dispose!: () => void;

    await act(async () => {
        dispose = render(ui, container);
        flush();
        await settleBiasElements(container);
    });

    return { container, dispose };
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
    const clientSecret = options.clientSecret ?? "cs_test_secret";
    const container = document.createElement("div");
    let result!: T;
    let dispose!: () => void;

    await act(async () => {
        dispose = render(
            () => (
                <BiasProvider
                    clientSecret={clientSecret}
                    _previewSession={session}
                    onComplete={options.onComplete}
                >
                    {(() => {
                        result = fn();
                        return null;
                    })()}
                </BiasProvider>
            ),
            container,
        );
        flush();
        await settleBiasElements(container);
    });

    return { result, dispose };
}
