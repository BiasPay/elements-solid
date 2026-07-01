import { act } from "@testing-library/react";
import { flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
    useFieldState,
    useField,
    useSubmitState,
    usePaymentError,
    useSelectedPaymentMethod,
    useSetSelectedPaymentMethod,
    useClientSecret,
    useIsSubmittable,
    useAttemptPayment,
} from "../src";
import { withProvider } from "./helpers";
import { createMockSession } from "../../test-shared/mocks";

describe("useClientSecret", () => {
    it("returns the client secret", async () => {
        const { result, dispose } = await withProvider(() => useClientSecret(), {
            clientSecret: "cs_test_abc",
        });
        expect(result()).toBe("cs_test_abc");
        dispose();
    });
});

describe("useFieldState", () => {
    it("returns initial field state", async () => {
        const { result: fieldState, dispose } = await withProvider(() => useFieldState());
        expect(fieldState().cardNumber).toBeDefined();
        expect(fieldState().cardExpiry).toBeDefined();
        expect(fieldState().cardCvc).toBeDefined();
        expect(fieldState().country.value).toBe("US");
        expect(fieldState().postalCode.value).toBe("");
        expect(fieldState().accountType.value).toBe("checking");
        expect(fieldState().name.value).toBe("");
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

describe("useField", () => {
    it("returns field state and setter for value fields", async () => {
        const { result: field, dispose } = await withProvider(() => useField("country"));
        expect(field.value()).toBe("US");
        expect(typeof field.setValue).toBe("function");
        expect(typeof field.validate).toBe("function");
        dispose();
    });

    it("can set a value field", async () => {
        const { result: field, dispose } = await withProvider(() => useField("postalCode"));
        field.setValue("12345");
        flush();
        expect(field.value()).toBe("12345");
        dispose();
    });

    it("can register a validator", async () => {
        const validator = vi.fn().mockReturnValue({ valid: true, error: null });
        const { result: field, dispose } = await withProvider(() =>
            useField("postalCode", { validate: validator }),
        );
        field.setValue("90210");
        act(() => {
            flush();
            field.validate();
            flush();
        });
        expect(validator).toHaveBeenCalled();
        dispose();
    });
});

describe("useSubmitState", () => {
    it("returns initial submit state", async () => {
        const { result, dispose } = await withProvider(() => useSubmitState());
        expect(result.loading()).toBe(false);
        expect(result.success()).toBe(false);
        dispose();
    });
});

describe("usePaymentError", () => {
    it("returns null initially", async () => {
        const { result, dispose } = await withProvider(() => usePaymentError());
        expect(result()).toBeNull();
        dispose();
    });
});

describe("useSelectedPaymentMethod", () => {
    it("defaults to card", async () => {
        const { result, dispose } = await withProvider(() => useSelectedPaymentMethod());
        expect(result()).toBe("card");
        dispose();
    });
});

describe("useSetSelectedPaymentMethod", () => {
    it("can change payment method", async () => {
        const { result, dispose } = await withProvider(() => ({
            selected: useSelectedPaymentMethod(),
            setSelected: useSetSelectedPaymentMethod(),
        }));

        result.setSelected("us_bank_account");
        flush();
        expect(result.selected()).toBe("us_bank_account");
        dispose();
    });
});

describe("useIsSubmittable", () => {
    it("returns false initially (no encrypted fields)", async () => {
        const { result, dispose } = await withProvider(() => useIsSubmittable());
        expect(result()).toBe(false);
        dispose();
    });
});
