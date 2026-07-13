import type { CheckoutSession } from "@biaspay/sdk";
import {
    AddressElement,
    USBankAccountElement,
    BiasProvider,
    CardElement,
    ContactElement,
    PaymentElement,
    SubmitButton,
    type Appearance,
} from "src";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { createDevCheckoutSession, type SessionPreset } from "./create-session";
import { DevControls, type DevView, type PaymentMethodListStyle } from "./DevControls";
import { createMockSession } from "./mocks";
import { persistOnChange, readPersisted } from "./persisted-state";

const useMockSession = !import.meta.env.VITE_BIAS_API_KEY;

export default function App() {
    const [view, setView] = createSignal(readPersisted<DevView>("view", "payment-form"));
    const [labelStyle, setLabelStyle] = createSignal(
        readPersisted<Appearance["labelStyle"]>("labelStyle", undefined),
    );
    const [addressEnabled, setAddressEnabled] = createSignal(
        readPersisted("addressEnabled", false),
    );
    const [shippingEnabled, setShippingEnabled] = createSignal(
        readPersisted("shippingEnabled", false),
    );
    const [collectPhone, setCollectPhone] = createSignal(readPersisted("collectPhone", false));
    const [listStyle, setListStyle] = createSignal(
        readPersisted<PaymentMethodListStyle>("listStyle", "tabs"),
    );
    const [cardEnabled, setCardEnabled] = createSignal(readPersisted("cardEnabled", true));
    const [bankEnabled, setBankEnabled] = createSignal(readPersisted("bankEnabled", true));
    const [sessionPreset, setSessionPreset] = createSignal(
        readPersisted<SessionPreset>("sessionPreset", "default"),
    );
    const [submitLabel, setSubmitLabel] = createSignal(
        readPersisted<NonNullable<CheckoutSession["submit_label"]>>("submitLabel", "pay"),
    );

    persistOnChange("view", view);
    persistOnChange("labelStyle", labelStyle);
    persistOnChange("addressEnabled", addressEnabled);
    persistOnChange("shippingEnabled", shippingEnabled);
    persistOnChange("collectPhone", collectPhone);
    persistOnChange("listStyle", listStyle);
    persistOnChange("cardEnabled", cardEnabled);
    persistOnChange("bankEnabled", bankEnabled);
    persistOnChange("sessionPreset", sessionPreset);
    persistOnChange("submitLabel", submitLabel);

    const [clientSecret, setClientSecret] = createSignal<string | undefined>(undefined);
    const [sessionLoading, setSessionLoading] = createSignal(false);
    const [sessionError, setSessionError] = createSignal<string | undefined>(undefined);

    let sessionRequestId = 0;

    const paymentMethods = createMemo((): ("card" | "us_bank_account")[] => {
        const methods: ("card" | "us_bank_account")[] = [];
        if (cardEnabled()) methods.push("card");
        if (bankEnabled()) methods.push("us_bank_account");
        return methods.length > 0 ? methods : ["card"];
    });

    const previewSession = createMemo((): CheckoutSession => {
        const base = createMockSession({
            payment_method_types: paymentMethods(),
            submit_label: submitLabel(),
        });

        if (sessionPreset() === "dual-pricing") {
            return createMockSession({
                ...base,
                amount: 10_000,
                dual_pricing: { rate: 3 },
            });
        }

        if (sessionPreset() === "setup") {
            return createMockSession({
                ...base,
                mode: "setup",
                amount: 0,
                submit_label: "auto",
            });
        }

        return base;
    });

    async function refreshSession() {
        if (useMockSession) {
            setClientSecret(previewSession().client_secret);
            setSessionError(undefined);
            setSessionLoading(false);
            return;
        }

        setSessionLoading(true);
        setSessionError(undefined);
        const requestId = ++sessionRequestId;

        try {
            const secret = await createDevCheckoutSession({
                preset: sessionPreset(),
                paymentMethodTypes: paymentMethods(),
                submitLabel: submitLabel(),
            });
            if (requestId !== sessionRequestId) return;
            setClientSecret(secret);
        } catch (error) {
            if (requestId !== sessionRequestId) return;
            setClientSecret(undefined);
            setSessionError(error instanceof Error ? error.message : "Failed to create checkout session");
        } finally {
            if (requestId === sessionRequestId) {
                setSessionLoading(false);
            }
        }
    }

    createEffect(() => {
        void cardEnabled();
        void bankEnabled();
        void sessionPreset();
        void submitLabel();
        void refreshSession();
    });

    const appearance = createMemo(() => ({ labelStyle: labelStyle() }));

    return (
        <>
            <DevControls
                view={view}
                setView={setView}
                labelStyle={labelStyle}
                setLabelStyle={setLabelStyle}
                listStyle={listStyle}
                setListStyle={setListStyle}
                cardEnabled={cardEnabled}
                setCardEnabled={setCardEnabled}
                bankEnabled={bankEnabled}
                setBankEnabled={setBankEnabled}
                addressEnabled={addressEnabled}
                setAddressEnabled={setAddressEnabled}
                shippingEnabled={shippingEnabled}
                setShippingEnabled={setShippingEnabled}
                collectPhone={collectPhone}
                setCollectPhone={setCollectPhone}
                sessionPreset={sessionPreset}
                setSessionPreset={setSessionPreset}
                submitLabel={submitLabel}
                setSubmitLabel={setSubmitLabel}
                useMockSession={useMockSession}
                sessionLoading={sessionLoading}
                sessionError={sessionError}
            />

            <main class="page">
                <div class="preview">
                    <Show when={sessionLoading() && !clientSecret()}>
                        <p class="status">Creating checkout session…</p>
                    </Show>
                    <Show when={sessionError() && !clientSecret()}>
                        <p class="error">{sessionError()}</p>
                    </Show>
                    <Show when={clientSecret()}>
                        {(secret) => (
                            <BiasProvider
                                clientSecret={secret()}
                                initialCheckoutSession={useMockSession ? previewSession() : undefined}
                            >
                                <div class="form-stack">
                                    <Show
                                        when={view() === "address-form"}
                                        fallback={
                                            <>
                                                <ContactElement appearance={appearance()} />
                                                <Show when={shippingEnabled()}>
                                                    <h2 class="section-heading">Shipping address</h2>
                                                    <AddressElement
                                                        scope="shipping"
                                                        appearance={appearance()}
                                                    />
                                                </Show>
                                                <Show when={addressEnabled()}>
                                                    <h2 class="section-heading">Billing address</h2>
                                                    <AddressElement appearance={appearance()} />
                                                </Show>

                                                <Show when={view() === "card-form"}>
                                                    <CardElement appearance={appearance()} />
                                                </Show>
                                                <Show when={view() === "bank-account-form"}>
                                                    <USBankAccountElement appearance={appearance()} />
                                                </Show>
                                                <Show when={view() === "payment-form"}>
                                                    <PaymentElement
                                                        paymentMethodLayout={listStyle()}
                                                        appearance={appearance()}
                                                    />
                                                </Show>

                                                <SubmitButton />
                                            </>
                                        }
                                    >
                                        <AddressElement
                                            collectPhone={collectPhone()}
                                            appearance={appearance()}
                                        />
                                    </Show>
                                </div>
                            </BiasProvider>
                        )}
                    </Show>
                </div>
            </main>
        </>
    );
}
