import type { Component } from "solid-js";

import type { ContactElementProps } from "../public-types";

export const ContactElement: Component<ContactElementProps> = (props) => (
    <bias-contact-element prop:appearance={props.appearance} />
);
export type { ContactElementProps } from "../public-types";
