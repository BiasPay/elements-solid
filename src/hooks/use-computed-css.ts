import { isServer } from "@solidjs/web";
import { type Accessor, createMemo } from "solid-js";

export type UseComputedCssOptions = {
    target: Accessor<Element | undefined>;
    vars: readonly string[];
    fallbackTarget?: Accessor<Element | undefined>;
};

export function useComputedCss(options: UseComputedCssOptions) {
    return createMemo<Record<string, string>>(() => {
        if (isServer) return {};

        const source = options.target() ?? options.fallbackTarget?.() ?? document.documentElement;
        if (!source) return {};

        const computed = getComputedStyle(source);

        return Object.fromEntries(
            options.vars.map((name) => [name, computed.getPropertyValue(name).trim()]),
        );
    });
}
