import { BiasController as CoreBiasController, type ElementsController } from "@biaspay/elements";
import {
    createContext,
    createEffect,
    createMemo,
    createSignal,
    onCleanup,
    onMount,
    Show,
    untrack,
    useContext,
    type Accessor,
} from "solid-js";
import type {
    Appearance,
    BiasFieldName,
    BiasFieldState,
    BiasFieldValidator,
    BiasFieldValueMap,
    BiasProviderProps,
    UseBiasResult,
} from "./public-types";

class SolidBiasController {
    readonly core: ElementsController;
    private readonly track: Accessor<number>;
    readonly appearance: Accessor<Appearance | undefined>;
    constructor(
        config: ConstructorParameters<typeof CoreBiasController>[0],
        appearance: Accessor<Appearance | undefined>,
    ) {
        this.core = new CoreBiasController(config);
        this.appearance = appearance;
        const [track, dirty] = createSignal(0, { equals: false });
        this.track = track;
        this.core.subscribe(() => dirty((value) => value + 1));
    }
    state() {
        this.track();
        return this.core.getPublicState();
    }
}

const BiasContext = createContext<SolidBiasController>();

export function BiasProvider(props: BiasProviderProps) {
    const controller = untrack(
        () =>
            new SolidBiasController(
                {
                    clientSecret: props.clientSecret,
                    initialCheckoutSession: props.initialCheckoutSession,
                    appearance: props.appearance,
                    onComplete: props.onComplete,
                },
                () => props.appearance,
            ),
    );
    const [mounted, setMounted] = createSignal(false);

    onMount(() => {
        controller.core.activate();
        setMounted(true);
    });
    onCleanup(() => controller.core.deactivate());

    let initial = true;
    createEffect(() => {
        const config = {
            clientSecret: props.clientSecret,
            initialCheckoutSession: props.initialCheckoutSession,
            appearance: props.appearance,
            onComplete: props.onComplete,
        };
        if (initial) {
            initial = false;
            return;
        }
        controller.core.updateConfig(config);
    });

    const terminalError = createMemo(() => {
        const state = controller.state().sessionState;
        return state.status === "error" && !state.session ? state.error : undefined;
    });
    createEffect(() => {
        const error = terminalError();
        if (error) throw error;
    });
    const visible = () => {
        if (!mounted()) return false;
        const state = controller.state().sessionState;
        return (state.status !== "idle" && state.status !== "loading") || "session" in state;
    };

    return (
        <BiasContext.Provider value={controller}>
            <Show when={visible()}>
                <bias-provider prop:controller={controller.core} prop:appearance={props.appearance}>
                    {props.children}
                </bias-provider>
            </Show>
        </BiasContext.Provider>
    );
}

function useBiasController(): SolidBiasController {
    const controller = useContext(BiasContext);
    if (!controller) throw new Error("Bias components must be used within <BiasProvider />");
    return controller;
}

export function useBias(): UseBiasResult {
    const controller = useBiasController();
    return {
        sessionState: () => controller.state().sessionState,
        paymentMethod: () => controller.state().paymentMethod,
        setPaymentMethod: (method) => controller.core.setPaymentMethod(method),
        status: () => controller.state().status,
        canSubmit: () => controller.state().canSubmit,
        submissionError: () => controller.state().submissionError,
        submit: () => controller.core.submit(),
        refreshSession: () => controller.core.refreshSession(),
    };
}

export function useBiasField<K extends BiasFieldName>(
    name: K,
    options?: { validate?: BiasFieldValidator<K> },
): {
    state: Accessor<BiasFieldState<BiasFieldValueMap[K]>>;
    setValue(value: BiasFieldValueMap[K]): void;
    validate(): void;
    onFocus(): void;
    onBlur(): void;
} {
    const controller = useBiasController();
    const binding = controller.core.getField(name) as ReturnType<ElementsController["getField"]>;
    createEffect(() => {
        const validator = options?.validate;
        if (!validator) return;
        onCleanup(binding.setValidator(validator as never));
    });
    return {
        state: () => {
            controller.state();
            return binding.state as BiasFieldState<BiasFieldValueMap[K]>;
        },
        setValue: (value) => binding.setValue(value as never),
        validate: binding.validate,
        onFocus: binding.onFocus,
        onBlur: binding.onBlur,
    };
}
