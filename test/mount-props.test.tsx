import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { SubmitButton } from "../src";
import { renderWithProvider } from "./helpers";

describe("reactive renderer props", () => {
    it("updates renamed label and native disabled props without remounting", async () => {
        const [label, setLabel] = createSignal("Pay now");
        const [disabled, setDisabled] = createSignal(false);
        const { container, dispose } = await renderWithProvider(() => (
            <SubmitButton label={label()} disabled={disabled()} />
        ));
        const button = container.querySelector<HTMLButtonElement>("button[type=submit]")!;
        expect(button.textContent).toContain("Pay now");

        setLabel("Confirm");
        setDisabled(true);
            await Promise.resolve();
        expect(button.textContent).toContain("Confirm");
        expect(button.disabled).toBe(true);
        dispose();
    });

    it("reactively updates provider appearance variables", async () => {
        const [color, setColor] = createSignal("red");
        const { container, dispose } = await renderWithProvider(() => <div />, {
            appearance: () => ({ variables: { colorPrimary: color() } }),
        });
        const provider = container.querySelector<HTMLElement>(".bias-provider")!;
        expect(provider.style.getPropertyValue("--bias-color-primary")).toBe("red");
        setColor("blue");
            expect(provider.style.getPropertyValue("--bias-color-primary")).toBe("blue");
        dispose();
    });
});
