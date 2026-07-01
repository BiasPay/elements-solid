// ---------------------------------------------------------------------------
// Frame message protocol (iframe ↔ host communication)
// ---------------------------------------------------------------------------

export type FrameFieldType =
    | "cardNumber"
    | "cardExpiry"
    | "cardCvc"
    | "bankAccountNumber"
    | "bankRoutingNumber";

type ReadyMessage = { type: "ready" };
type ValidityMessage = { type: "validity"; valid: boolean };
type ErrorMessage = { type: "error"; error: string | null };
type CardBrandMessage = { type: "cardBrand"; brand: string | null };
type FocusMessage = { type: "focus" };
type BlurMessage = { type: "blur" };
type EncryptedDataMessage = {
    type: "encryptedData";
    field: FrameFieldType;
    encryptedValue: string | null;
};

export type FrameMessage =
    | ReadyMessage
    | ValidityMessage
    | ErrorMessage
    | CardBrandMessage
    | FocusMessage
    | BlurMessage
    | EncryptedDataMessage;

// ---------------------------------------------------------------------------
// Field state
// ---------------------------------------------------------------------------

export type BiasFieldStatus = {
    loading: boolean;
    focused: boolean;
    valid: boolean;
    error: string | null;
    /** The card brand string as reported by the iframe field, e.g. "visa", "american-express". */
    cardBrand: string | null;
};

export type ValueFieldStatus<T = string> = {
    value: T;
    focused: boolean;
    valid: boolean;
    error: string | null;
};

// ---------------------------------------------------------------------------
// Field types & value map
// ---------------------------------------------------------------------------

export type FieldType = FrameFieldType | "country" | "postalCode" | "accountType" | "name";

export type FieldValueMap = {
    cardNumber: never;
    cardExpiry: never;
    cardCvc: never;
    bankAccountNumber: never;
    bankRoutingNumber: never;
    country: string;
    postalCode: string;
    accountType: "checking" | "savings";
    name: string;
};

export type ValueFieldType = {
    [K in FieldType]: FieldValueMap[K] extends never ? never : K;
}[FieldType];

export type UnifiedFieldState = {
    cardNumber: BiasFieldStatus;
    cardExpiry: BiasFieldStatus;
    cardCvc: BiasFieldStatus;
    bankAccountNumber: BiasFieldStatus;
    bankRoutingNumber: BiasFieldStatus;
    country: ValueFieldStatus<string>;
    postalCode: ValueFieldStatus<string>;
    accountType: ValueFieldStatus<"checking" | "savings">;
    name: ValueFieldStatus<string>;
};

export type FieldState = UnifiedFieldState;

// ---------------------------------------------------------------------------
// Payment method
// ---------------------------------------------------------------------------

export type PaymentMethodType = "card" | "us_bank_account";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type ValueFieldValidationOptions = {
    showRequired: boolean;
};

export type ValueFieldValidationResult = {
    valid: boolean;
    error: string | null;
};

export type ValueFieldValidator<K extends ValueFieldType> = (
    value: FieldValueMap[K],
    options: ValueFieldValidationOptions,
) => ValueFieldValidationResult;
