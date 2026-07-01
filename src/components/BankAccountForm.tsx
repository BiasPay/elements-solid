import { BiasBankAccountForm } from "@biaspay/web";
import type { Component } from "solid-js";
import { createWrapper } from "../create-wrapper";

export const BankAccountForm = createWrapper({
    tagName: "bias-bank-account-form",
    elementClass: BiasBankAccountForm,
}) as Component<{ compact?: boolean }>;
