# Bias Elements for Solid

Pre-built components for building PCI-compliant checkout and payment forms.

## Installation

```sh
npm install @biaspay/solid
```

## Usage

Wrap your payment page in `BiasProvider` and drop in a pre-built form:

```tsx
import { BiasProvider, PaymentForm } from "@biaspay/solid";

function CheckoutPage(props: { clientSecret: string }) {
    return (
        <BiasProvider clientSecret={props.clientSecret} onComplete={() => { /* ... */ }}>
            <PaymentForm />
        </BiasProvider>
    );
}
```

## Documentation

Full reference at [biaspay.com/docs/sdks/solid](https://biaspay.com/docs/sdks/solid).
