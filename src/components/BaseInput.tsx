import { BiasBaseInput, type FrameFieldType } from "@biaspay/web";
import type { Component } from "solid-js";
import { createWrapper } from "../create-wrapper";

const BiasBaseInputElement = createWrapper({
    tagName: "bias-base-input",
    elementClass: BiasBaseInput,
}) as Component<{ fieldType: FrameFieldType }>;

export type BaseInputProps = {
    type: FrameFieldType;
};

export type InputProps = Omit<BaseInputProps, "type">;

export function BaseInput(props: BaseInputProps) {
    return <BiasBaseInputElement fieldType={props.type} />;
}
