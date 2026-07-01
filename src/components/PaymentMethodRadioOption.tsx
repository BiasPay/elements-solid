import { BiasPaymentMethodRadioOption, type IconSource } from "@biaspay/web";
import type { JSX } from "solid-js";
import { createWrapper } from "../create-wrapper";

const BiasPaymentMethodRadioOptionElement = createWrapper({
    tagName: "bias-payment-method-radio-option",
    elementClass: BiasPaymentMethodRadioOption,
    events: {
        onSelect: "select-method",
    },
});

type PaymentMethodRadioOptionProps = {
    label: string;
    icon?: IconSource;
    selected: boolean;
    onSelect: () => void;
    children?: JSX.Element;
    class?: string;
    first?: boolean;
    last?: boolean;
};

export function PaymentMethodRadioOption(props: PaymentMethodRadioOptionProps) {
    return (
        <BiasPaymentMethodRadioOptionElement
            label={props.label}
            icon={props.icon}
            selected={props.selected}
            onSelect={props.onSelect}
            class={props.class}
            first={props.first}
            last={props.last}
        >
            <div slot="content">{props.children}</div>
        </BiasPaymentMethodRadioOptionElement>
    );
}
