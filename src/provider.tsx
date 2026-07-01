import {
    BiasProvider as LitBiasProvider,
    type BiasContextValue,
    type BiasStoreSnapshot,
    type CheckoutSession,
    type FieldValueMap,
    type FrameFieldType,
    type PaymentMethodType,
    type UnifiedFieldState,
    type ValueFieldStatus,
    type ValueFieldType,
    type ValueFieldValidator,
} from "@biaspay/web";
import {
    createContext,
    createEffect,
    createMemo,
    createSignal,
    onCleanup,
    Show,
    useContext,
    type Accessor,
    type JSX,
    type ParentProps,
} from "solid-js";
import { createWrapper } from "./create-wrapper";

export type {
    BiasContextValue,
    BiasStoreSnapshot,
    CheckoutSession,
    FieldValueMap,
    FrameFieldType,
    PaymentMethodType,
    UnifiedFieldState,
    ValueFieldStatus,
    ValueFieldType,
    ValueFieldValidator,
};

const BiasProviderElement = createWrapper({
    tagName: "bias-provider",
    elementClass: LitBiasProvider,
    events: {
        onComplete: "complete",
    },
}) as (props: {
    ref?: (element: LitBiasProvider | null) => void;
    children?: JSX.Element;
    clientSecret: string;
    previewSession?: CheckoutSession;
    apiBaseUrl?: string;
    frameUrl?: string;
    onComplete?: () => void;
}) => JSX.Element;

type BiasContextAccessor = () => BiasContextValue;

const BiasContext = createContext<BiasContextAccessor>();

type BiasProviderProps = ParentProps & {
    clientSecret: string | Accessor<string>;
    _previewSession?: CheckoutSession;
    apiBaseUrl?: string;
    frameUrl?: string;
    onComplete?: () => void;
};

function resolveClientSecret(clientSecret: string | Accessor<string>): string {
    return typeof clientSecret === "function" ? clientSecret() : clientSecret;
}

export function BiasProvider(props: BiasProviderProps) {
    const [ready, setReady] = createSignal(false);
    const clientSecret = createMemo(() => resolveClientSecret(props.clientSecret));
    let unsubscribe: (() => void) | undefined;
    let currentContext: BiasContextValue | undefined;
    let disposed = false;

    const getCurrentContext: BiasContextAccessor = () => {
        if (!currentContext) {
            throw new Error("Bias components must be used within <BiasProvider />");
        }
        return currentContext;
    };

    const updateReady = (value: boolean) => {
        queueMicrotask(() => {
            if (!disposed) setReady(value);
        });
    };

    onCleanup(() => {
        disposed = true;
        unsubscribe?.();
    });

    const onProviderRef = (element: LitBiasProvider | null | undefined) => {
        unsubscribe?.();
        unsubscribe = undefined;

        if (!element) {
            currentContext = undefined;
            updateReady(false);
            return;
        }

        const refresh = () => {
            currentContext = element.getContextValue();
            updateReady(true);
        };
        refresh();
        unsubscribe = element.getContextValue().subscribe(refresh);
    };

    return (
        <BiasContext value={getCurrentContext}>
            <BiasProviderElement
                ref={onProviderRef}
                clientSecret={clientSecret()}
                previewSession={props._previewSession}
                apiBaseUrl={props.apiBaseUrl}
                frameUrl={props.frameUrl}
                onComplete={props.onComplete}
            >
                <Show when={ready()}>{props.children}</Show>
            </BiasProviderElement>
        </BiasContext>
    );
}

export function useBiasContext(): BiasContextValue {
    const getContext = useContext(BiasContext);
    if (!getContext) {
        throw new Error("Bias components must be used within <BiasProvider />");
    }
    return getContext();
}

function useBiasSnapshot(): Accessor<BiasStoreSnapshot> {
    const ctx = useBiasContext();
    const [snapshot, setSnapshot] = createSignal(ctx.getSnapshot());

    createEffect(
        () => ctx,
        (value) => {
            setSnapshot(value.getSnapshot());
            return value.subscribe(() => setSnapshot(value.getSnapshot()));
        },
    );

    return snapshot;
}

export function useFieldState(): Accessor<UnifiedFieldState> {
    const snapshot = useBiasSnapshot();
    return () => snapshot().fieldState;
}

export function useField<K extends ValueFieldType>(
    type: K,
    options?: { validate?: ValueFieldValidator<K> },
) {
    const ctx = useBiasContext();
    const snapshot = useBiasSnapshot();

    createEffect(
        () => options?.validate,
        (validator) => {
            if (!validator) return;
            ctx.store.registerFieldValidator(type, validator);
            return () => ctx.store.unregisterFieldValidator(type);
        },
    );

    return {
        state: () => snapshot().fieldState[type],
        value: () => snapshot().fieldState[type].value,
        setValue: (value: FieldValueMap[K]) => ctx.store.setFieldValue(type, value),
        validate: () => ctx.store.validateField(type),
        setState: (nextState: Partial<ValueFieldStatus<FieldValueMap[K]>>) =>
            ctx.store.setValueFieldState(type, nextState),
    };
}

export function useAttemptPayment() {
    const ctx = useBiasContext();
    return () => {
        ctx.store.attemptPayment({
            triggerFrameValidation: (type) => ctx.attemptPayments[type]?.(),
        });
    };
}

export function useIsSubmittable(): Accessor<boolean> {
    const snapshot = useBiasSnapshot();
    const ctx = useBiasContext();
    return () => {
        const current = snapshot();
        return (
            !!current.selectedPaymentMethod &&
            ctx.store.getRequiredFrameFields().every((f) => !!current.encryptedFields[f]) &&
            ctx.store.getRequiredValueFields().every((f) => current.fieldState[f].valid)
        );
    };
}

export function useSubmitState() {
    const snapshot = useBiasSnapshot();
    return {
        loading: () => snapshot().submitLoading,
        success: () => snapshot().submitSuccess,
    };
}

export function usePaymentError(): Accessor<string | null> {
    const snapshot = useBiasSnapshot();
    return () => snapshot().paymentError;
}

export function useSelectedPaymentMethod(): Accessor<PaymentMethodType> {
    const snapshot = useBiasSnapshot();
    return () => snapshot().selectedPaymentMethod;
}

export function useSetSelectedPaymentMethod() {
    const ctx = useBiasContext();
    return ctx.store.setSelectedPaymentMethod;
}

export function useClientSecret(): Accessor<string> {
    const ctx = useBiasContext();
    return () => ctx.clientSecret;
}

export function useOnComplete(callback: () => void) {
    const ctx = useBiasContext();
    createEffect(
        () => callback,
        (listener) => {
            ctx.completeListeners.add(listener);
            onCleanup(() => ctx.completeListeners.delete(listener));
        },
    );
}

export function useCheckoutSession(): Accessor<CheckoutSession | undefined> {
    const ctx = useBiasContext();
    return () => ctx.checkoutSession;
}

export { themeVariableStyle as useThemeVariables, type ThemeVariables } from "@biaspay/web";
