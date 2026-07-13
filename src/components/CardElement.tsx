import type { Component } from "solid-js";

import type { CardElementProps } from "../public-types";

export const CardElement: Component<CardElementProps> = (props) => (
    <bias-card-element prop:appearance={props.appearance} />
);
export type { CardElementProps } from "../public-types";
