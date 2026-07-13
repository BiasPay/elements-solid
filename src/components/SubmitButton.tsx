import type { Component } from "solid-js";

import type { SubmitButtonProps } from "../public-types";

export const SubmitButton: Component<SubmitButtonProps> = (props) => (
    <bias-submit-button prop:disabled={props.disabled} prop:label={props.label} />
);
export type { SubmitButtonProps } from "../public-types";
