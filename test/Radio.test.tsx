import { describe, expect, it } from "vitest";
import { Radio, SubmitButton } from "../src";
import { renderWithProvider } from "./helpers";
import { createMockSession } from "../../test-shared/mocks";

describe("Radio", () => {
    it("renders a bias-radio custom element", async () => {
        const { container, dispose } = await renderWithProvider(() => <Radio selected={false} />);
        expect(container.querySelector("bias-radio")).not.toBeNull();
        dispose();
    });
});

describe("SubmitButton", () => {
    it("renders a bias-submit-button custom element", async () => {
        const { container, dispose } = await renderWithProvider(() => <SubmitButton />, {
            session: createMockSession(),
        });
        expect(container.querySelector("bias-submit-button")).not.toBeNull();
        dispose();
    });
});
