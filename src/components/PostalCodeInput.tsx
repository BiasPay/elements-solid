import { BiasPostalCodeInput } from "@biaspay/web";
import { createWrapper } from "../create-wrapper";

export type PostalCodeInputProps = {
    placeholder?: string;
};

export const PostalCodeInput = createWrapper({
    tagName: "bias-postal-code-input",
    elementClass: BiasPostalCodeInput,
});
