import {
    BiasProvider,
    DiscountCodeElement,
    ExpressCheckoutElement,
    PaymentElement,
    RememberDetailsCheckbox,
    useBias,
    type ConventionalPaymentMethod,
    type SavedPaymentMethod,
    type SessionPaymentMethod,
    type WalletAvailability,
    type WalletAvailabilityStatus,
    type WalletPaymentMethod,
} from "../src";

<DiscountCodeElement onChange={async (_session) => {}} />;
<ExpressCheckoutElement disabled showSeparator />;
<PaymentElement />;

const savedPaymentMethods = [] as SavedPaymentMethod[];

<BiasProvider
    clientSecret="cs_test"
    apiBaseUrl="https://api.example"
    rememberDetails
    savedPaymentMethods={savedPaymentMethods}
>
    <RememberDetailsCheckbox checked onChange={(_checked) => {}} />
</BiasProvider>;

function PublicHookContract() {
    const bias = useBias();
    bias.setSavedPaymentMethod("pm_saved");
    bias.clearRememberedDetails();
    bias.walletAvailability();
    bias.savedPaymentMethods();
    bias.savedPaymentMethod();
    return <button type="button" onClick={bias.submit} />;
}

void PublicHookContract;
void (null as
    | ConventionalPaymentMethod
    | SessionPaymentMethod
    | WalletAvailability
    | WalletAvailabilityStatus
    | WalletPaymentMethod
    | null);
// @ts-expect-error secure frame endpoint overrides are not provider props
<BiasProvider clientSecret="cs_test" frameUrl="https://field.example">
    <div />
</BiasProvider>;
