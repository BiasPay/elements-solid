import assert from "node:assert/strict";
import { renderToString } from "solid-js/web";
import {
    AddressElement,
    USBankAccountElement,
    BiasProvider,
    CardElement,
    ContactElement,
    DiscountCodeElement,
    ExpressCheckoutElement,
    PaymentElement,
    RememberDetailsCheckbox,
    SubmitButton,
} from "@biaspay/solid";

for (const Component of [
    AddressElement,
    USBankAccountElement,
    CardElement,
    ContactElement,
    DiscountCodeElement,
    ExpressCheckoutElement,
    PaymentElement,
    RememberDetailsCheckbox,
    SubmitButton,
]) {
    assert.equal(
        renderToString(() => Component({})),
        "",
    );
}

assert.equal(
    renderToString(() =>
        BiasProvider({
            clientSecret: "cs_test",
            get children() {
                throw new Error("SSR must not evaluate provider children");
            },
        }),
    ),
    "",
);
