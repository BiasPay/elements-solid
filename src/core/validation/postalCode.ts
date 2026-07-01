import type { ValueFieldValidationOptions, ValueFieldValidationResult } from "~/core/types";

export const POSTAL_CODE_CONFIG = {
    GB: {
        placeholder: "EC11 1AA",
        mask: "A[A]0[0][A] 0AA",
        regex: /^[A-Z]{1,2}\d{1,2}[A-Z]? \d[A-Z]{2}$/,
        inputMode: "text" as const,
        error: "Your postal code is invalid.",
    },
    CA: {
        placeholder: "M1A 1T1",
        mask: "A0A 0A0",
        regex: /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] \d[ABCEGHJ-NPRSTV-Z]\d$/,
        inputMode: "text" as const,
        error: "Your postal code is invalid.",
    },
    US: {
        placeholder: "12345",
        mask: "00000",
        regex: /^\d{5}$/,
        inputMode: "numeric" as const,
        error: "Your ZIP code is invalid.",
    },
} as const;

export type PostalCodeCountry = keyof typeof POSTAL_CODE_CONFIG;

export function getPostalCodeConfig(country: string) {
    return country in POSTAL_CODE_CONFIG ? POSTAL_CODE_CONFIG[country as PostalCodeCountry] : null;
}

export function validatePostalCode(
    value: string,
    country: string,
    options: ValueFieldValidationOptions,
): ValueFieldValidationResult {
    const normalized = value.trim();

    if (!normalized) {
        return {
            valid: false,
            error: options.showRequired ? "Required" : null,
        };
    }

    const config = getPostalCodeConfig(country);
    if (!config) {
        return { valid: true, error: null };
    }

    const valid = config.regex.test(normalized);
    return {
        valid,
        error: valid ? null : config.error,
    };
}
