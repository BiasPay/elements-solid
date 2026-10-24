import type { Component } from "solid-js";
import type { DiscountCodeElementProps } from "../public-types";

export const DiscountCodeElement: Component<DiscountCodeElementProps> = (props) => (
    <bias-discount-code-element
        prop:appearance={props.appearance}
        prop:onDiscountCodeChange={props.onChange}
    />
);
export type { DiscountCodeElementProps } from "../public-types";
