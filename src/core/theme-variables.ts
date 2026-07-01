import type { JSX } from "solid-js";

export type ThemeVariables = {
    colorPrimary?: string | null;
    colorBackground?: string | null;
    colorInput?: string | null;
    colorForeground?: string | null;
    colorMutedForeground?: string | null;
    colorPlaceholder?: string | null;
    colorBorder?: string | null;
    colorSuccess?: string | null;
    colorError?: string | null;
    focusRing?: string | null;
    shadow?: string | null;
    borderRadius?: string | null;
    fontFamily?: string | null;
    fontSize?: string | null;
};

function toKebab(key: string): string {
    return key.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`);
}

export function themeVariableStyle(vars: ThemeVariables | undefined): JSX.CSSProperties {
    if (!vars) return {};
    return Object.fromEntries(
        Object.entries(vars)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [`--bias-${toKebab(k)}`, v]),
    ) as JSX.CSSProperties;
}
