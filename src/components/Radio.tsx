import { BiasRadio } from "@biaspay/web";
import { createWrapper } from "../create-wrapper";

export const Radio = createWrapper({
    tagName: "bias-radio",
    elementClass: BiasRadio,
    events: {
        onSelect: "bias-select",
    },
});
