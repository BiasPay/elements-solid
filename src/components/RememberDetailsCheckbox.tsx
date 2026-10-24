import type { Component } from "solid-js";
import type { RememberDetailsCheckboxProps } from "../public-types";

export const RememberDetailsCheckbox: Component<RememberDetailsCheckboxProps> = (props) => (
    <bias-remember-details-checkbox
        prop:checked={props.checked}
        prop:disabled={props.disabled}
        prop:onRememberDetailsChange={props.onChange}
    />
);
export type { RememberDetailsCheckboxProps } from "../public-types";
