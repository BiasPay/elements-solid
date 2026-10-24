import type { Accessor, Component, JSX } from "solid-js";
import type {
    AddressElementProps,
    AddressMetadataState,
    USBankAccountElementProps,
    BiasFieldName,
    BiasFieldState,
    BiasFieldValidator,
    BiasFieldValueMap,
    BiasProviderProps,
    CardElementProps,
    ContactElementProps,
    DiscountCodeElementProps,
    ExpressCheckoutElementProps,
    PaymentElementProps,
    RememberDetailsCheckboxProps,
    SubmitButtonProps,
    UseBiasResult,
} from "./public-types";

// The Node export is deliberately inert. The browser implementation uses
// custom elements, which must never be evaluated during SSR.
const EmptyComponent: Component<Record<string, unknown>> = () => undefined;

export const BiasProvider = ((_props: BiasProviderProps): JSX.Element =>
    undefined) as Component<BiasProviderProps>;
export const PaymentElement = EmptyComponent as Component<PaymentElementProps>;
export const ExpressCheckoutElement = EmptyComponent as Component<ExpressCheckoutElementProps>;
export const RememberDetailsCheckbox = EmptyComponent as Component<RememberDetailsCheckboxProps>;
export const CardElement = EmptyComponent as Component<CardElementProps>;
export const USBankAccountElement = EmptyComponent as Component<USBankAccountElementProps>;
export const AddressElement = EmptyComponent as Component<AddressElementProps>;
export const ContactElement = EmptyComponent as Component<ContactElementProps>;
export const DiscountCodeElement = EmptyComponent as Component<DiscountCodeElementProps>;
export const SubmitButton = EmptyComponent as Component<SubmitButtonProps>;

function clientOnly(): never {
    throw new Error("Bias hooks are only available in the browser");
}

export function useBias(): UseBiasResult {
    return clientOnly();
}

export function useBiasField<K extends BiasFieldName>(
    _name: K,
    _options?: { validate?: BiasFieldValidator<K> },
): {
    state: Accessor<BiasFieldState<BiasFieldValueMap[K]>>;
    setValue(value: BiasFieldValueMap[K]): void;
    validate(): void;
    onFocus(): void;
    onBlur(): void;
} {
    return clientOnly();
}

export type {
    AddressElementProps,
    AddressMetadata,
    AddressMetadataState,
    AddressScope,
    Appearance,
    USBankAccountElementProps,
    BiasElementsError,
    BiasElementsErrorCode,
    BiasFieldName,
    BiasFieldState,
    BiasFieldValidator,
    BiasFieldValueMap,
    BiasProviderProps,
    CardElementProps,
    ContactElementProps,
    DiscountCodeAction,
    DiscountCodeElementProps,
    DiscountCodeState,
    ExpressCheckoutElementProps,
    PaymentElementProps,
    PaymentMethod,
    SessionState,
    SubmissionStatus,
    SubmitButtonProps,
    ThemeVariables,
    UseBiasResult,
} from "./public-types";
