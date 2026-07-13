import type { Component } from "solid-js";
import type { PaymentElementProps } from "../public-types";

export const PaymentElement: Component<PaymentElementProps> = (props) => (
    <bias-payment-element
        prop:paymentMethodLayout={props.paymentMethodLayout}
        prop:appearance={props.appearance}
    />
);
export type { PaymentElementProps } from "../public-types";
