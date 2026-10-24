import type { Component } from "solid-js";
import type { ExpressCheckoutElementProps } from "../public-types";

export const ExpressCheckoutElement: Component<ExpressCheckoutElementProps> = (props) => (
    <bias-express-checkout-element
        prop:disabled={props.disabled}
        prop:showSeparator={props.showSeparator}
        prop:appearance={props.appearance}
    />
);
export type { ExpressCheckoutElementProps } from "../public-types";
