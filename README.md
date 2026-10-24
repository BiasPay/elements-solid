# Bias Elements for Solid

Solid components and reactive hooks for embedded Bias checkout forms. Sensitive card and bank account values stay inside Bias-hosted iframes.

## Installation

```sh
npm install @biaspay/solid
```

`@biaspay/elements` and `@biaspay/sdk` are installed as runtime dependencies. Solid is a peer dependency.

## Usage

```tsx
import {
    BiasProvider,
    ContactElement,
    DiscountCodeElement,
    ExpressCheckoutElement,
    PaymentElement,
    SubmitButton,
} from "@biaspay/solid";

export function Checkout(props: { clientSecret: string }) {
    return (
        <BiasProvider
            clientSecret={props.clientSecret}
            onComplete={() => window.location.assign("/order-confirmed")}
        >
            <ExpressCheckoutElement showSeparator />
            <ContactElement />
            <DiscountCodeElement />
            <PaymentElement paymentMethodLayout="tabs" />
            <SubmitButton label="Pay now" />
        </BiasProvider>
    );
}
```

Pass `clientSecret` as a string expression; do not wrap it in an accessor. `ExpressCheckoutElement` renders Apple Pay when the session and browser support it on Bias Checkout. Apple Pay is not currently available for direct Elements embeds or custom checkout domains. Mount the element before contact and shipping fields for express checkout. It is complementary to the ordinary payment form: use exactly one of `PaymentElement`, `CardElement`, or `USBankAccountElement` for card and bank payments. `AddressElement` and `ContactElement` may be added alongside them.

`BiasProvider` also accepts `checkoutSessionExpand`, `defaultValues`, and `appearance`. Elements owns the canonical checkout session and applies the configured expansion to every fetch and mutation.

The public hooks are `useBias` and `useBiasField`. Reactive hook values are Solid accessors. A field binding coordinates with provider state but does not register a contact or address field for collection; keep the matching element mounted when the field must be required and submitted. During server rendering and the initial hydration pass, the provider emits no Elements UI.

## Your own submit button

`SubmitButton` shows a session's renewal terms (`subscription_terms`) under itself, and paying through the session records the customer's agreement to them. With your own button, show `subscription_terms` next to it. The bank account form shows the debit authorization (`mandate_text`, or `company_mandate_text` for a business account) whenever the payment saves the account; keep it visible.

## Documentation

See the [Solid reference](https://biaspay.com/docs/sdks/solid) and [Elements quickstart](https://biaspay.com/docs/guides/checkout-elements/quickstart).
