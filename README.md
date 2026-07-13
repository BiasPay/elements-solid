# Bias Elements for Solid

Solid components and reactive hooks for embedded Bias checkout forms. Sensitive card and bank account values stay inside Bias-hosted iframes.

## Installation

```sh
npm install @biaspay/solid
```

`@biaspay/elements` and `@biaspay/sdk` are installed as runtime dependencies. Solid is a peer dependency.

## Usage

```tsx
import { BiasProvider, PaymentElement, SubmitButton } from "@biaspay/solid";

export function Checkout(props: { clientSecret: string }) {
    return (
        <BiasProvider
            clientSecret={props.clientSecret}
            onComplete={() => window.location.assign("/order-confirmed")}
        >
            <PaymentElement paymentMethodLayout="tabs" />
            <SubmitButton label="Pay now" />
        </BiasProvider>
    );
}
```

Pass `clientSecret` as a string expression; do not wrap it in an accessor. Use exactly one payment surface—`PaymentElement`, `CardElement`, or `USBankAccountElement`—under each provider. `AddressElement` and `ContactElement` may be added alongside it.

`BiasProvider` also accepts `initialCheckoutSession` and `appearance`. A matching `initialCheckoutSession` provides immediate client-side hydration and is refreshed after activation.

The public hooks are `useBias` and `useBiasField`. Reactive hook values are Solid accessors. A field binding coordinates with provider state but does not register a contact or address field for collection; keep the matching element mounted when the field must be required and submitted. During server rendering and the initial hydration pass, the provider emits no Elements UI.

## Documentation

See the [Solid reference](https://biaspay.com/docs/sdks/solid) and [Elements quickstart](https://biaspay.com/docs/guides/checkout-elements/quickstart).
