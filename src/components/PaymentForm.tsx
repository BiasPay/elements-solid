import { BiasPaymentForm, type PaymentMethodListStyle, type ThemeVariables } from "@biaspay/web";
import type { Component } from "solid-js";
import { createWrapper } from "../create-wrapper";

const BiasPaymentFormElement = createWrapper({
    tagName: "bias-payment-form",
    elementClass: BiasPaymentForm,
}) as Component<{
    compact?: boolean;
    listStyle?: PaymentMethodListStyle;
    variables?: ThemeVariables;
}>;

type PaymentFormProps = {
    compact?: boolean;
    style?: PaymentMethodListStyle;
    variables?: ThemeVariables;
};

export function PaymentForm(props: PaymentFormProps) {
    return (
        <BiasPaymentFormElement
            compact={props.compact}
            listStyle={props.style}
            variables={props.variables}
        />
    );
}
