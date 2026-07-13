import type { Appearance, AddressScope, ElementsController } from "@biaspay/elements";
import type { JSX } from "solid-js";

type BiasHostAttributes = JSX.HTMLAttributes<HTMLElement>;

declare module "solid-js" {
    namespace JSX {
        interface ExplicitProperties {
            appearance: Appearance | undefined;
            controller: ElementsController;
            paymentMethodLayout: "tabs" | "radio" | undefined;
            scope: AddressScope | undefined;
            collectPhone: boolean | undefined;
            disabled: boolean | undefined;
            label: string | undefined;
        }

        interface IntrinsicElements {
            "bias-provider": BiasHostAttributes;
            "bias-payment-element": BiasHostAttributes;
            "bias-card-element": BiasHostAttributes;
            "bias-us-bank-account-element": BiasHostAttributes;
            "bias-address-element": BiasHostAttributes;
            "bias-contact-element": BiasHostAttributes;
            "bias-submit-button": BiasHostAttributes;
        }
    }
}
