import { Bias, type CountryCode } from "@biaspay/server";
import type {
    BiasFieldStatus,
    FieldValueMap,
    FrameFieldType,
    PaymentMethodType,
    UnifiedFieldState,
    ValueFieldStatus,
    ValueFieldType,
    ValueFieldValidationOptions,
    ValueFieldValidator,
} from "./types";
import { getFieldValidation } from "./validation";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CARD_FRAME_FIELDS: FrameFieldType[] = ["cardNumber", "cardExpiry", "cardCvc"];
export const CARD_VALUE_FIELDS: ValueFieldType[] = ["country", "postalCode"];
export const BANK_FRAME_FIELDS: FrameFieldType[] = ["bankAccountNumber", "bankRoutingNumber"];
export const BANK_VALUE_FIELDS: ValueFieldType[] = ["name", "accountType", "country", "postalCode"];
const SUBMIT_DELAY = 200;

// ---------------------------------------------------------------------------
// Initial state factories
// ---------------------------------------------------------------------------

export function initialFrameField(): BiasFieldStatus {
    return {
        loading: true,
        focused: false,
        valid: false,
        error: null,
        cardBrand: null,
    };
}

export function initialValueField<T extends string>(
    value: T | "" = "" as T | "",
    valid = false,
): ValueFieldStatus<T> {
    return { value: value as T, focused: false, valid, error: null };
}

export function createInitialFieldState(): UnifiedFieldState {
    return {
        cardNumber: initialFrameField(),
        cardExpiry: initialFrameField(),
        cardCvc: initialFrameField(),
        bankAccountNumber: initialFrameField(),
        bankRoutingNumber: initialFrameField(),
        country: initialValueField("US", true),
        postalCode: initialValueField(),
        accountType: initialValueField<"checking" | "savings">("checking", true),
        name: initialValueField(),
    };
}

// ---------------------------------------------------------------------------
// BiasStore
// ---------------------------------------------------------------------------

export type EncryptedFieldMap = Partial<Record<FrameFieldType, string | null>>;

export type BiasStoreState = {
    fieldState: UnifiedFieldState;
    selectedPaymentMethod: PaymentMethodType;
    encryptedFields: EncryptedFieldMap;
    submitLoading: boolean;
    submitSuccess: boolean;
    paymentError: string | null;
};

export type BiasStoreMethods = {
    getState(): BiasStoreState;

    // Frame fields
    setFrameFieldState(type: FrameFieldType, nextState: Partial<BiasFieldStatus>): void;
    onEncryptedData(field: FrameFieldType, encryptedValue: string | null): void;

    // Value fields
    setFieldValue<K extends ValueFieldType>(type: K, value: FieldValueMap[K]): void;
    validateField<K extends ValueFieldType>(type: K): void;
    setValueFieldState<K extends ValueFieldType>(
        type: K,
        nextState: Partial<ValueFieldStatus<FieldValueMap[K]>>,
    ): void;

    // Validators
    registerFieldValidator<K extends ValueFieldType>(
        type: K,
        validator: ValueFieldValidator<K>,
    ): void;
    unregisterFieldValidator(type: ValueFieldType): void;

    // Payment method
    setSelectedPaymentMethod(method: PaymentMethodType): void;

    // Submission
    getRequiredFrameFields(): FrameFieldType[];
    getRequiredValueFields(): ValueFieldType[];
    isSubmittable(): boolean;
    attemptPayment(opts: { triggerFrameValidation(type: FrameFieldType): void }): void;

    // API config
    setApiBaseUrl(url: string): void;
};

export type BiasStoreOptions = {
    clientSecret: () => string;
    apiBaseUrl?: string;
    /** Called whenever any state changes. Framework wires reactivity here. */
    onChange(state: BiasStoreState): void;
    /** Called once when payment succeeds. */
    onComplete?(): void;
};

export function createBiasStore(options: BiasStoreOptions): BiasStoreMethods {
    // Plain mutable state — no reactive primitives
    let state: BiasStoreState = {
        fieldState: createInitialFieldState(),
        selectedPaymentMethod: "card",
        encryptedFields: {},
        submitLoading: false,
        submitSuccess: false,
        paymentError: null,
    };

    const fieldValidators: Partial<{
        [K in ValueFieldType]: ValueFieldValidator<K>;
    }> = {};
    let apiBaseUrl = options.apiBaseUrl;

    function notify() {
        options.onChange(state);
    }

    function setState(partial: Partial<BiasStoreState>) {
        state = { ...state, ...partial };
        notify();
    }

    function patchFieldState(
        type: keyof UnifiedFieldState,
        patch: Partial<UnifiedFieldState[typeof type]>,
    ) {
        setState({
            fieldState: {
                ...state.fieldState,
                [type]: { ...state.fieldState[type], ...patch },
            },
        });
    }

    function failSubmit(error?: string | null) {
        setState({
            submitLoading: false,
            submitSuccess: false,
            paymentError: error ?? null,
        });
    }

    function getFieldValidationResult<K extends ValueFieldType>(
        type: K,
        value: FieldValueMap[K],
        opts: ValueFieldValidationOptions,
    ) {
        return getFieldValidation(type, value, opts, fieldValidators);
    }

    function createSdk() {
        return new Bias(options.clientSecret(), { baseURL: apiBaseUrl });
    }

    async function createPayment() {
        const { fieldState, encryptedFields, selectedPaymentMethod: method } = state;

        if (method === "card") {
            const {
                cardNumber: encryptedNumber,
                cardExpiry: encryptedExpiry,
                cardCvc: encryptedCvc,
            } = encryptedFields;
            const { country, postalCode } = fieldState;

            if (!encryptedNumber || !encryptedExpiry || !encryptedCvc) {
                failSubmit("Missing payment method details.");
                return;
            }
            if (!country.value) {
                failSubmit("Missing billing country.");
                return;
            }
            if (!postalCode.value) {
                failSubmit("Missing billing postal code.");
                return;
            }

            const sdk = createSdk();
            const session = await sdk.checkout.sessions.get("current");
            if (session.object === "error") {
                failSubmit(session.error.message);
                return;
            }

            const payment = await sdk.payments.create({
                payment_method: {
                    card: {
                        encrypted_number: encryptedNumber,
                        encrypted_expiry: encryptedExpiry,
                        encrypted_cvc: encryptedCvc,
                    },
                    billing_details: {
                        address: {
                            country: country.value as CountryCode,
                            postal_code: postalCode.value,
                        },
                    },
                    setup_future_usage: session.mode === "setup" ? "off_session" : undefined,
                },
            });

            if (payment.object === "error") {
                failSubmit(payment.error.message);
                return;
            }

            setState({
                submitLoading: false,
                submitSuccess: true,
                paymentError: null,
            });
            setTimeout(() => options.onComplete?.(), SUBMIT_DELAY);
        } else if (method === "us_bank_account") {
            const { name, accountType, country, postalCode } = fieldState;
            const {
                bankAccountNumber: encryptedAccountNumber,
                bankRoutingNumber: encryptedRoutingNumber,
            } = encryptedFields;

            if (!encryptedAccountNumber || !encryptedRoutingNumber) {
                failSubmit("Missing bank account details.");
                return;
            }

            const sdk = createSdk();
            const session = await sdk.checkout.sessions.get("current");
            if (session.object === "error") {
                failSubmit(session.error.message);
                return;
            }

            const payment = await sdk.payments.create({
                payment_method: {
                    us_bank_account: {
                        encrypted_routing_number: encryptedRoutingNumber,
                        encrypted_account_number: encryptedAccountNumber,
                        account_type: accountType.value,
                    },
                    billing_details: {
                        name: name.value || undefined,
                        address: {
                            country: country.value ? (country.value as CountryCode) : undefined,
                            postal_code: postalCode.value || undefined,
                        },
                    },
                    setup_future_usage: session.mode === "setup" ? "off_session" : undefined,
                },
            });

            if (payment.object === "error") {
                failSubmit(payment.error.message);
                return;
            }

            setState({
                submitLoading: false,
                submitSuccess: true,
                paymentError: null,
            });
            setTimeout(() => options.onComplete?.(), SUBMIT_DELAY);
        }
    }

    return {
        getState: () => state,

        setFrameFieldState(type, nextState) {
            patchFieldState(type, nextState as Partial<BiasFieldStatus>);
        },

        onEncryptedData(field, encryptedValue) {
            setState({
                encryptedFields: { ...state.encryptedFields, [field]: encryptedValue },
                fieldState: {
                    ...state.fieldState,
                    [field]: { ...state.fieldState[field], valid: !!encryptedValue },
                },
            });
        },

        setFieldValue(type, value) {
            const next = getFieldValidationResult(type, value, {
                showRequired: false,
            });
            patchFieldState(type, { value, valid: next.valid, error: null } as any);
        },

        validateField(type) {
            const current = state.fieldState[type] as ValueFieldStatus;
            const next = getFieldValidationResult(
                type,
                current.value as FieldValueMap[typeof type],
                { showRequired: true },
            );
            patchFieldState(type, {
                value: current.value,
                valid: next.valid,
                error: next.error,
            } as any);
        },

        setValueFieldState(type, nextState) {
            patchFieldState(type, nextState as any);
        },

        registerFieldValidator(type, validator) {
            (fieldValidators as any)[type] = validator;
        },

        unregisterFieldValidator(type) {
            delete fieldValidators[type];
        },

        setSelectedPaymentMethod(method) {
            // Clear all field errors when switching methods
            const clearedFields = Object.fromEntries(
                Object.entries(state.fieldState).map(([key, val]) => [
                    key,
                    { ...val, error: null },
                ]),
            ) as UnifiedFieldState;

            setState({
                selectedPaymentMethod: method,
                paymentError: null,
                fieldState: clearedFields,
            });
        },

        getRequiredFrameFields() {
            if (state.selectedPaymentMethod === "card") return CARD_FRAME_FIELDS;
            if (state.selectedPaymentMethod === "us_bank_account") return BANK_FRAME_FIELDS;
            return [];
        },

        getRequiredValueFields() {
            if (state.selectedPaymentMethod === "card") return CARD_VALUE_FIELDS;
            if (state.selectedPaymentMethod === "us_bank_account") return BANK_VALUE_FIELDS;
            return [];
        },

        isSubmittable() {
            const frameFields =
                state.selectedPaymentMethod === "card"
                    ? CARD_FRAME_FIELDS
                    : state.selectedPaymentMethod === "us_bank_account"
                      ? BANK_FRAME_FIELDS
                      : [];
            const valueFields =
                state.selectedPaymentMethod === "card"
                    ? CARD_VALUE_FIELDS
                    : state.selectedPaymentMethod === "us_bank_account"
                      ? BANK_VALUE_FIELDS
                      : [];
            return (
                frameFields.every((f) => !!state.encryptedFields[f]) &&
                valueFields.every((f) => state.fieldState[f].valid)
            );
        },

        attemptPayment({ triggerFrameValidation }) {
            if (state.submitLoading || state.submitSuccess) return;

            setState({
                paymentError: null,
                submitLoading: true,
                submitSuccess: false,
            });

            const frameFields =
                state.selectedPaymentMethod === "card"
                    ? CARD_FRAME_FIELDS
                    : state.selectedPaymentMethod === "us_bank_account"
                      ? BANK_FRAME_FIELDS
                      : [];
            const valueFields =
                state.selectedPaymentMethod === "card"
                    ? CARD_VALUE_FIELDS
                    : state.selectedPaymentMethod === "us_bank_account"
                      ? BANK_VALUE_FIELDS
                      : ([] as ValueFieldType[]);

            for (const field of frameFields) {
                triggerFrameValidation(field);
            }

            // Validate value fields, writing errors into state
            let allValueFieldsValid = true;
            const nextFieldState = { ...state.fieldState };

            for (const field of valueFields) {
                const current = state.fieldState[field] as ValueFieldStatus;
                const result = getFieldValidationResult(
                    field,
                    current.value as FieldValueMap[typeof field],
                    { showRequired: true },
                );
                nextFieldState[field] = {
                    ...current,
                    valid: result.valid,
                    error: result.error,
                } as any;
                if (!result.valid) allValueFieldsValid = false;
            }

            setState({ fieldState: nextFieldState });

            if (frameFields.every((f) => !!state.encryptedFields[f]) && allValueFieldsValid) {
                void createPayment();
                return;
            }

            failSubmit();
        },

        setApiBaseUrl(url) {
            apiBaseUrl = url;
        },
    };
}
