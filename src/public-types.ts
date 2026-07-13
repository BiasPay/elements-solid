import type { CheckoutSession } from "@biaspay/sdk";
import type { Accessor } from "solid-js";

export type PaymentMethod = "card" | "us_bank_account";
export type AddressScope = "billing" | "shipping";
export type SubmissionStatus = "idle" | "submitting" | "succeeded" | "failed";
export type BiasElementsErrorCode = "authentication_failed" | "session_load_failed" | "session_update_failed" | "payment_failed" | "frame_failed" | "configuration_error";
export interface BiasElementsError extends Error { readonly code: BiasElementsErrorCode; readonly retryable: boolean }
export type SessionState =
    | { readonly status: "idle" }
    | { readonly status: "loading" }
    | { readonly status: "ready"; readonly session: CheckoutSession }
    | { readonly status: "refreshing"; readonly session: CheckoutSession }
    | { readonly status: "error"; readonly error: BiasElementsError; readonly session?: CheckoutSession };
export type ThemeVariables = {
    colorPrimary?: string; colorBackground?: string; colorInput?: string; colorForeground?: string;
    colorMutedForeground?: string; colorPlaceholder?: string; colorBorder?: string;
    colorSuccess?: string; colorError?: string; focusRing?: string; shadow?: string;
    borderRadius?: string; fontFamily?: string; fontSize?: string; gap?: string;
};
export type Appearance = { variables?: ThemeVariables; labelStyle?: "static" | "floating" | "placeholder" };
export type BiasFieldName = "country" | "postalCode" | "accountType" | "email" | "name" | "addressLine1" | "addressLine2" | "city" | "state" | "phone" | "shippingCountry" | "shippingPostalCode" | "shippingName" | "shippingAddressLine1" | "shippingAddressLine2" | "shippingCity" | "shippingState" | "shippingPhone";
export type BiasFieldValueMap = {
    country: string; postalCode: string; accountType: "checking" | "savings"; email: string;
    name: string; addressLine1: string; addressLine2: string; city: string; state: string;
    phone: string; shippingCountry: string; shippingPostalCode: string; shippingName: string;
    shippingAddressLine1: string; shippingAddressLine2: string; shippingCity: string;
    shippingState: string; shippingPhone: string;
};
export type BiasFieldState<T> = { value: T; isFocused: boolean; isValid: boolean; error: string | null };
export type BiasFieldValidator<K extends BiasFieldName> = (value: BiasFieldValueMap[K]) => { isValid: boolean; error: string | null };
export type AddressSubdivision = { key: string; name: string };
export type AddressMetadata = {
    country: string;
    postalCode: { used: boolean; required: boolean; label: string; error: string; regex: RegExp | null; example: string | null; numeric: boolean };
    state: { used: boolean; required: boolean; label: string; options: AddressSubdivision[] };
    city: { used: boolean; required: boolean };
};
export type AddressMetadataState =
    | { status: "loading"; metadata: AddressMetadata }
    | { status: "ready"; metadata: AddressMetadata }
    | { status: "fallback"; metadata: AddressMetadata };

export type BiasProviderProps = {
    clientSecret: string; initialCheckoutSession?: CheckoutSession;
    appearance?: Appearance; onComplete?: () => void; children: import("solid-js").JSX.Element;
};
export type PaymentElementProps = { paymentMethodLayout?: "tabs" | "radio"; appearance?: Appearance };
export type CardElementProps = { appearance?: Appearance };
export type USBankAccountElementProps = { appearance?: Appearance };
export type ContactElementProps = { appearance?: Appearance };
export type AddressElementProps = { scope?: AddressScope; collectPhone?: boolean; appearance?: Appearance };
export type SubmitButtonProps = { disabled?: boolean; label?: string };

export type UseBiasResult = {
    sessionState: Accessor<SessionState>;
    paymentMethod: Accessor<PaymentMethod | undefined>;
    setPaymentMethod(method: PaymentMethod): void;
    status: Accessor<SubmissionStatus>;
    canSubmit: Accessor<boolean>;
    submissionError: Accessor<BiasElementsError | null>;
    submit(): void;
    refreshSession(): void;
};
