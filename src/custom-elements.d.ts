import type { CountryCode } from "@biaspay/sdk";
import type { Appearance, AddressScope, ElementsController } from "@biaspay/elements";
import type { JSX } from "solid-js";

type BiasHostAttributes = JSX.HTMLAttributes<HTMLElement>;

declare module "solid-js" {
    namespace JSX {
        interface ExplicitProperties {
            appearance: Appearance | undefined;
            controller: ElementsController;
            paymentMethodLayout: "tabs" | "radio" | undefined;
            savedPaymentMethodEmail: string | undefined;
            collectBillingName: boolean | undefined;
            collectBillingAddress: boolean | undefined;
            showSeparator: boolean | undefined;
            scope: AddressScope | undefined;
            collectEmail: boolean | undefined;
            collectPhone: boolean | undefined;
            allowedCountries: CountryCode[] | undefined;
            disabled: boolean | undefined;
            readOnly: boolean | undefined;
            label: string | undefined;
            checked: boolean | undefined;
            onRememberDetailsChange: ((checked: boolean) => void) | undefined;
            onDiscountCodeChange:
                | ((session: import("@biaspay/sdk").CheckoutSession) => void | Promise<void>)
                | undefined;
        }

        interface IntrinsicElements {
            "bias-provider": BiasHostAttributes;
            "bias-payment-element": BiasHostAttributes;
            "bias-express-checkout-element": BiasHostAttributes;
            "bias-card-element": BiasHostAttributes;
            "bias-us-bank-account-element": BiasHostAttributes;
            "bias-address-element": BiasHostAttributes;
            "bias-contact-element": BiasHostAttributes;
            "bias-discount-code-element": BiasHostAttributes;
            "bias-submit-button": BiasHostAttributes;
            "bias-remember-details-checkbox": BiasHostAttributes;
        }
    }
}
