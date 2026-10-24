import type { Component } from "solid-js";

import type { ContactElementProps } from "../public-types";

export const ContactElement: Component<ContactElementProps> = (props) => (
    <bias-contact-element
        prop:appearance={props.appearance}
        prop:readOnly={props.readOnly}
        prop:collectEmail={props.collectEmail}
        prop:collectPhone={props.collectPhone}
    />
);
export type { ContactElementProps } from "../public-types";
