import type { Component } from "solid-js";
import type { PaymentElementProps } from "../public-types";

export const PaymentElement: Component<PaymentElementProps> = (props) => (
    <bias-payment-element
        prop:paymentMethodLayout={props.paymentMethodLayout}
        prop:savedPaymentMethodEmail={props.savedPaymentMethodEmail}
        prop:collectBillingName={props.collectBillingName}
        prop:collectBillingAddress={props.collectBillingAddress}
        prop:appearance={props.appearance}
    />
);
export type { PaymentElementProps } from "../public-types";
