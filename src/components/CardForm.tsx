import { BiasCardForm } from "@biaspay/web";
import type { Component } from "solid-js";
import { createWrapper } from "../create-wrapper";

export const CardForm = createWrapper({
    tagName: "bias-card-form",
    elementClass: BiasCardForm,
}) as Component<{ compact?: boolean }>;
