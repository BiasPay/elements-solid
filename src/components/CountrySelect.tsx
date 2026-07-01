import { BiasCountrySelect } from "@biaspay/web";
import { createWrapper } from "../create-wrapper";

export type CountrySelectProps = {
    value?: string;
    onChange?: (value: string) => void;
};

export const CountrySelect = createWrapper({
    tagName: "bias-country-select",
    elementClass: BiasCountrySelect,
});
