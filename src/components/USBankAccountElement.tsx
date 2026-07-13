import type { Component } from "solid-js";

import type { USBankAccountElementProps } from "../public-types";

export const USBankAccountElement: Component<USBankAccountElementProps> = (props) => (
    <bias-us-bank-account-element prop:appearance={props.appearance} />
);
export type { USBankAccountElementProps } from "../public-types";
