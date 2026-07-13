import type { CheckoutSession } from "@biaspay/sdk";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { createEffect, type Accessor, type Setter } from "solid-js";
import { createMutable } from "solid-js/store";
import {
    Tweakpane,
    TWPBindGroup,
    TWPFolder,
    TWPInput,
    TWPMonitor,
    TWPSeparator,
} from "solid-tweakpane";
import { Pane } from "tweakpane";
import type { Appearance } from "src";
import type { SessionPreset } from "./create-session";

export type DevView = "payment-form" | "card-form" | "bank-account-form" | "address-form";
export type PaymentMethodListStyle = "radio" | "tabs";
type LabelStyle = NonNullable<Appearance["labelStyle"]>;

const VIEW_OPTIONS = [
    "payment-form",
    "card-form",
    "bank-account-form",
    "address-form",
] as const satisfies readonly DevView[];

// solid-tweakpane doesn't expose Pane#registerPlugin; register essentials on
// the first rack mutation so radiogrid is available before any binding is added.
type EssentialsPane = Pane & { __biasEssentials?: boolean };
for (const method of ["addMonitor", "addInput", "addFolder"] as const) {
    const original = Pane.prototype[method] as (this: Pane, ...args: never[]) => unknown;
    Object.defineProperty(Pane.prototype, method, {
        configurable: true,
        value(this: EssentialsPane, ...args: never[]) {
            if (!this.__biasEssentials) {
                this.registerPlugin(EssentialsPlugin);
                this.__biasEssentials = true;
            }
            return original.apply(this, args);
        },
    });
}

type Props = {
    view: Accessor<DevView>;
    setView: Setter<DevView>;
    labelStyle: Accessor<LabelStyle | undefined>;
    setLabelStyle: Setter<LabelStyle | undefined>;
    listStyle: Accessor<PaymentMethodListStyle>;
    setListStyle: Setter<PaymentMethodListStyle>;
    cardEnabled: Accessor<boolean>;
    setCardEnabled: Setter<boolean>;
    bankEnabled: Accessor<boolean>;
    setBankEnabled: Setter<boolean>;
    addressEnabled: Accessor<boolean>;
    setAddressEnabled: Setter<boolean>;
    shippingEnabled: Accessor<boolean>;
    setShippingEnabled: Setter<boolean>;
    collectPhone: Accessor<boolean>;
    setCollectPhone: Setter<boolean>;
    sessionPreset: Accessor<SessionPreset>;
    setSessionPreset: Setter<SessionPreset>;
    submitLabel: Accessor<NonNullable<CheckoutSession["submit_label"]>>;
    setSubmitLabel: Setter<NonNullable<CheckoutSession["submit_label"]>>;
    useMockSession: boolean;
    sessionLoading: Accessor<boolean>;
    sessionError: Accessor<string | undefined>;
};

export function DevControls(props: Props) {
    const params = createMutable({
        sessionStatus: "…",
        view: props.view() as DevView,
        labelStyleValue: (props.labelStyle() ?? "static") as LabelStyle,
        addressEnabled: props.addressEnabled(),
        shippingEnabled: props.shippingEnabled(),
        collectPhone: props.collectPhone(),
        cardEnabled: props.cardEnabled(),
        bankEnabled: props.bankEnabled(),
        listStyle: props.listStyle() as PaymentMethodListStyle,
        sessionPreset: props.sessionPreset() as SessionPreset,
        submitLabel: props.submitLabel() as NonNullable<CheckoutSession["submit_label"]>,
        submitLabelMonitor: "auto (fixed by setup mode)",
    });

    // Keep pane bindings in sync when App state changes (e.g. localStorage restore).
    createEffect(() => {
        params.view = props.view();
        params.labelStyleValue = props.labelStyle() ?? "static";
        params.addressEnabled = props.addressEnabled();
        params.shippingEnabled = props.shippingEnabled();
        params.collectPhone = props.collectPhone();
        params.cardEnabled = props.cardEnabled();
        params.bankEnabled = props.bankEnabled();
        params.listStyle = props.listStyle();
        params.sessionPreset = props.sessionPreset();
        params.submitLabel = props.submitLabel();
        params.sessionStatus = props.useMockSession
            ? "Mock (set VITE_BIAS_API_KEY for live)"
            : props.sessionError()
              ? props.sessionError()!
              : props.sessionLoading()
                ? "Refreshing…"
                : "Live";
    });

    const showPaymentMethodControls = () => props.view() === "payment-form";
    const paymentMethodCount = () =>
        (props.cardEnabled() ? 1 : 0) + (props.bankEnabled() ? 1 : 0);
    const showListStyle = () => showPaymentMethodControls() && paymentMethodCount() > 1;
    const isAddressView = () => props.view() === "address-form";
    const showPhone = () => isAddressView() || props.addressEnabled();
    const isSetup = () => props.sessionPreset() === "setup";

    return (
        <div class="dev-tweakpane-host">
            <Tweakpane title="Bias Elements (Solid)" position="fixed">
                <TWPBindGroup target={params}>
                    <TWPMonitor key="sessionStatus" params={{ label: "Session" }} />

                    <TWPFolder title="Component" expanded>
                        <TWPInput
                            key="view"
                            params={{
                                view: "radiogrid",
                                groupName: "view",
                                size: [2, 2],
                                cells: (x: number, y: number) => {
                                    const value = VIEW_OPTIONS[y * 2 + x]!;
                                    return { title: value, value };
                                },
                            }}
                            onChange={(e) => props.setView(e.value as DevView)}
                        />
                    </TWPFolder>

                    <TWPFolder title="Label style">
                        <TWPInput
                            key="labelStyleValue"
                            params={{
                                label: "",
                                options: {
                                    Static: "static",
                                    Floating: "floating",
                                    Placeholder: "placeholder",
                                },
                            }}
                            onChange={(e) => {
                                const v = e.value as LabelStyle;
                                props.setLabelStyle(v === "static" ? undefined : v);
                            }}
                        />
                    </TWPFolder>

                    <TWPFolder title="Address element">
                        {!isAddressView() && (
                            <>
                                <TWPInput
                                    key="addressEnabled"
                                    params={{ label: "Billing address" }}
                                    onChange={(e) => props.setAddressEnabled(!!e.value)}
                                />
                                <TWPInput
                                    key="shippingEnabled"
                                    params={{ label: "Shipping address" }}
                                    onChange={(e) => props.setShippingEnabled(!!e.value)}
                                />
                            </>
                        )}
                        {showPhone() && (
                            <TWPInput
                                key="collectPhone"
                                params={{ label: "Collect phone" }}
                                onChange={(e) => props.setCollectPhone(!!e.value)}
                            />
                        )}
                    </TWPFolder>

                    {showPaymentMethodControls() && (
                        <TWPFolder title="Payment methods">
                            <TWPInput
                                key="cardEnabled"
                                params={{ label: "Card" }}
                                onChange={(e) => {
                                    const next = !!e.value;
                                    if (!next && !params.bankEnabled) {
                                        params.cardEnabled = true;
                                        return;
                                    }
                                    props.setCardEnabled(next);
                                }}
                            />
                            <TWPInput
                                key="bankEnabled"
                                params={{ label: "US bank account" }}
                                onChange={(e) => {
                                    const next = !!e.value;
                                    if (!next && !params.cardEnabled) {
                                        params.bankEnabled = true;
                                        return;
                                    }
                                    props.setBankEnabled(next);
                                }}
                            />
                        </TWPFolder>
                    )}

                    {showListStyle() && (
                        <TWPFolder title="Method picker">
                            <TWPInput
                                key="listStyle"
                                params={{
                                    label: "",
                                    options: { Tabs: "tabs", Radio: "radio" },
                                }}
                                onChange={(e) =>
                                    props.setListStyle(e.value as PaymentMethodListStyle)
                                }
                            />
                        </TWPFolder>
                    )}

                    <TWPFolder title="Session" expanded>
                        <TWPInput
                            key="sessionPreset"
                            params={{
                                label: "Preset",
                                options: {
                                    Default: "default",
                                    Dual: "dual-pricing",
                                    Setup: "setup",
                                },
                            }}
                            onChange={(e) => props.setSessionPreset(e.value as SessionPreset)}
                        />
                        {isSetup() ? (
                            <>
                                <TWPSeparator />
                                <TWPMonitor
                                    key="submitLabelMonitor"
                                    params={{ label: "Submit label" }}
                                />
                            </>
                        ) : (
                            <TWPInput
                                key="submitLabel"
                                params={{
                                    label: "Submit label",
                                    options: {
                                        pay: "pay",
                                        donate: "donate",
                                        book: "book",
                                        subscribe: "subscribe",
                                        auto: "auto",
                                    },
                                }}
                                onChange={(e) =>
                                    props.setSubmitLabel(
                                        e.value as NonNullable<CheckoutSession["submit_label"]>,
                                    )
                                }
                            />
                        )}
                    </TWPFolder>
                </TWPBindGroup>
            </Tweakpane>
        </div>
    );
}
