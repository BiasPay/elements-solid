import type { Component } from "solid-js";

import type { AddressElementProps } from "../public-types";

export const AddressElement: Component<AddressElementProps> = (props) => (
    <bias-address-element
        prop:scope={props.scope}
        prop:collectPhone={props.collectPhone}
        prop:appearance={props.appearance}
    />
);
export type { AddressElementProps } from "../public-types";
