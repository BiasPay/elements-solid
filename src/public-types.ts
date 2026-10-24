import type {
    Card,
    CheckoutSession,
    CheckoutSessionExpand,
    CheckoutSessionUpdateParams,
    CountryCode,
    PaymentMethod as ApiPaymentMethod,
    UsBankAccount,
} from "@biaspay/sdk";
import type { Accessor } from "solid-js";

export type ConventionalPaymentMethod = "card" | "us_bank_account";
export type WalletPaymentMethod = "apple_pay";
export type SessionPaymentMethod = ConventionalPaymentMethod | WalletPaymentMethod;
export type PaymentMethod = ConventionalPaymentMethod;
export type WalletAvailabilityStatus = "loading" | "available" | "unavailable";
export type WalletAvailability = { readonly applePay: WalletAvailabilityStatus };
/** The parts of a saved payment method Elements shows and pays with. */
export type SavedPaymentMethod = Pick<
    ApiPaymentMethod,
    "object" | "id" | "live" | "created_at" | "active" | "type"
> & {
    billing_details: { name: string | null };
    card: Pick<Card, "brand" | "last4" | "exp_month" | "exp_year"> | null;
    us_bank_account: Pick<UsBankAccount, "bank_name" | "last4" | "account_type"> | null;
};
export type AddressScope = "billing" | "shipping";
/**
 * `processing`: the payment was submitted but its outcome is still unknown (for
 * example a card payment in review). Submission stays locked and Elements keeps
 * checking; it moves to `succeeded` or `failed` once the outcome is final.
 */
export type SubmissionStatus =
    | "idle"
    | "presenting_wallet"
    | "submitting"
    | "processing"
    | "succeeded"
    | "failed";
export type DiscountCodeAction = "apply" | "remove";
export type BiasElementsErrorCode =
    | "authentication_failed"
    | "session_load_failed"
    | "session_update_failed"
    | "payment_failed"
    | "frame_failed"
    | "configuration_error";
export interface BiasElementsError extends Error {
    readonly code: BiasElementsErrorCode;
    readonly retryable: boolean;
    /** The Bias API error type when the failure came from an API response, such as `server_error`. */
    readonly apiErrorType?: string;
    /** The API's `customer_message` when the failure came from an API response that wrote one. Safe to show a customer as is. */
    readonly customerMessage?: string;
}
export type DetailsSaveState =
    | { readonly status: "idle" | "dirty" | "saving" | "saved" }
    | { readonly status: "error"; readonly error: BiasElementsError };
export type SessionState =
    | { readonly status: "idle" }
    | { readonly status: "loading" }
    | { readonly status: "ready"; readonly session: CheckoutSession }
    | { readonly status: "refreshing"; readonly session: CheckoutSession }
    | {
          readonly status: "error";
          readonly error: BiasElementsError;
          readonly session?: CheckoutSession;
      };
export type DiscountCodeState = {
    readonly pendingAction: DiscountCodeAction | null;
    readonly error: string | null;
    readonly blocked: boolean;
    readonly blocksSubmission: boolean;
    readonly optimisticallyRemovedDiscountIds: readonly string[];
};
export type ThemeVariables = {
    colorPrimary?: string;
    colorBackground?: string;
    colorInput?: string;
    colorForeground?: string;
    colorMutedForeground?: string;
    colorPlaceholder?: string;
    colorBorder?: string;
    colorSuccess?: string;
    colorError?: string;
    focusRing?: string;
    shadow?: string;
    borderRadius?: string;
    fontFamily?: string;
    fontSize?: string;
    gap?: string;
};
export type Appearance = {
    variables?: ThemeVariables;
    labelStyle?: "static" | "floating" | "placeholder";
};
export type BiasFieldName =
    | "country"
    | "postalCode"
    | "accountType"
    | "accountHolderType"
    | "email"
    | "phone"
    | "name"
    | "firstName"
    | "lastName"
    | "addressLine1"
    | "addressLine2"
    | "city"
    | "state"
    | "shippingCountry"
    | "shippingPostalCode"
    | "shippingFirstName"
    | "shippingLastName"
    | "shippingAddressLine1"
    | "shippingAddressLine2"
    | "shippingCity"
    | "shippingState"
    | "shippingPhone";
export type BiasFieldValueMap = {
    country: string;
    postalCode: string;
    accountType: "checking" | "savings";
    accountHolderType: "individual" | "company";
    email: string;
    phone: string;
    name: string;
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    shippingCountry: string;
    shippingPostalCode: string;
    shippingFirstName: string;
    shippingLastName: string;
    shippingAddressLine1: string;
    shippingAddressLine2: string;
    shippingCity: string;
    shippingState: string;
    shippingPhone: string;
};
export type BiasFieldState<T> = {
    value: T;
    isFocused: boolean;
    isValid: boolean;
    error: string | null;
};
export type BiasFieldValidator<K extends BiasFieldName> = (value: BiasFieldValueMap[K]) => {
    isValid: boolean;
    error: string | null;
};
export type AddressSubdivision = { key: string; name: string };
export type AddressMetadata = {
    country: string;
    postalCode: {
        used: boolean;
        required: boolean;
        label: string;
        error: string;
        regex: RegExp | null;
        example: string | null;
        numeric: boolean;
    };
    state: { used: boolean; required: boolean; label: string; options: AddressSubdivision[] };
    city: { used: boolean; required: boolean };
};
export type AddressMetadataState =
    | { status: "loading"; metadata: AddressMetadata }
    | { status: "ready"; metadata: AddressMetadata }
    | { status: "fallback"; metadata: AddressMetadata };

export type BiasProviderProps = {
    clientSecret: string;
    initialCheckoutSession?: CheckoutSession;
    /** Shows `initialCheckoutSession` without contacting the Bias API. Submitting does nothing. */
    preview?: boolean;
    checkoutSessionExpand?: CheckoutSessionExpand;
    defaultValues?: Partial<BiasFieldValueMap>;
    rememberDetails?: boolean;
    savedPaymentMethods?: readonly SavedPaymentMethod[];
    apiBaseUrl?: string;
    appearance?: Appearance;
    onComplete?: () => void;
    children: import("solid-js").JSX.Element;
};
export type RememberDetailsCheckboxProps = {
    checked: boolean;
    disabled?: boolean;
    onChange(checked: boolean): void;
};
export type PaymentElementProps = {
    paymentMethodLayout?: "tabs" | "radio";
    savedPaymentMethodEmail?: string;
    collectBillingName?: boolean;
    collectBillingAddress?: boolean;
    appearance?: Appearance;
};
export type ExpressCheckoutElementProps = {
    disabled?: boolean;
    showSeparator?: boolean;
    appearance?: Appearance;
};
export type CardElementProps = { appearance?: Appearance };
export type USBankAccountElementProps = { appearance?: Appearance };
export type ContactElementProps = {
    appearance?: Appearance;
    readOnly?: boolean;
    /** Defaults to `true`. */
    collectEmail?: boolean;
    collectPhone?: boolean;
};
export type DiscountCodeElementProps = {
    appearance?: Appearance;
    onChange?: (session: CheckoutSession) => void | Promise<void>;
};
export type AddressElementProps = {
    scope?: AddressScope;
    collectPhone?: boolean;
    allowedCountries?: CountryCode[];
    appearance?: Appearance;
};
export type SubmitButtonProps = { disabled?: boolean; label?: string };

export type UseBiasResult = {
    sessionState: Accessor<SessionState>;
    discountCodeState: Accessor<DiscountCodeState>;
    detailsSaveState: Accessor<DetailsSaveState>;
    paymentMethod: Accessor<PaymentMethod | undefined>;
    walletAvailability: Accessor<WalletAvailability>;
    savedPaymentMethods: Accessor<readonly SavedPaymentMethod[]>;
    savedPaymentMethod: Accessor<SavedPaymentMethod | undefined>;
    setPaymentMethod(method: PaymentMethod): void;
    setSavedPaymentMethod(id: string): void;
    clearRememberedDetails(): void;
    status: Accessor<SubmissionStatus>;
    canSubmit: Accessor<boolean>;
    submissionError: Accessor<BiasElementsError | null>;
    submit(): void;
    refreshSession(): void;
    updateCheckoutSession(
        params: Pick<
            CheckoutSessionUpdateParams,
            | "billing_details"
            | "customer_details"
            | "discounts"
            | "shipping_details"
            | "shipping_rate"
        >,
    ): Promise<CheckoutSession>;
    retryDetailsSave(): void;
};
