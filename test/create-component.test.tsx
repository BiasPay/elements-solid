import { render } from "@solidjs/web";
import { createSignal, flush, type Component } from "solid-js";
import { describe, expect, it } from "vitest";
import { createComponent } from "../src/create-component";

type Variables = {
    colorPrimary: string;
};

class BiasSolidPropTestElement extends HTMLElement {
    private _variables?: Variables;
    private _listStyle?: string;

    get variables() {
        return this._variables;
    }

    set variables(value: Variables | undefined) {
        this._variables = value;
    }

    get listStyle() {
        return this._listStyle;
    }

    set listStyle(value: string | undefined) {
        this._listStyle = value;
    }
}

if (!customElements.get("bias-solid-prop-test")) {
    customElements.define("bias-solid-prop-test", BiasSolidPropTestElement);
}

describe("createComponent", () => {
    it("updates object properties after the element ref is assigned", () => {
        const Wrapped = createComponent({
            tagName: "bias-solid-prop-test",
            elementClass: BiasSolidPropTestElement,
        }) as Component<{ variables?: Variables }>;

        const container = document.createElement("div");
        const [color, setColor] = createSignal("#192d58");

        const dispose = render(() => <Wrapped variables={{ colorPrimary: color() }} />, container);
        flush();

        const element = container.querySelector("bias-solid-prop-test");
        expect(element).toBeInstanceOf(BiasSolidPropTestElement);
        expect((element as BiasSolidPropTestElement).variables).toEqual({
            colorPrimary: "#192d58",
        });

        setColor("#2734ec");
        flush();

        expect((element as BiasSolidPropTestElement).variables).toEqual({
            colorPrimary: "#2734ec",
        });

        dispose();
    });

    it("updates object properties forwarded through a wrapper spread", () => {
        const Wrapped = createComponent({
            tagName: "bias-solid-prop-test",
            elementClass: BiasSolidPropTestElement,
        }) as Component<{ variables?: Variables }>;
        const ForwardingWrapper: Component<{ variables?: Variables }> = (props) => (
            <Wrapped {...props} />
        );

        const container = document.createElement("div");
        const [color, setColor] = createSignal("#192d58");

        const dispose = render(
            () => <ForwardingWrapper variables={{ colorPrimary: color() }} />,
            container,
        );
        flush();

        const element = container.querySelector("bias-solid-prop-test");
        expect(element).toBeInstanceOf(BiasSolidPropTestElement);
        expect((element as BiasSolidPropTestElement).variables).toEqual({
            colorPrimary: "#192d58",
        });

        setColor("#2734ec");
        flush();

        expect((element as BiasSolidPropTestElement).variables).toEqual({
            colorPrimary: "#2734ec",
        });

        dispose();
    });

    it("updates object properties forwarded through merged explicit props and spread", () => {
        const Wrapped = createComponent({
            tagName: "bias-solid-prop-test",
            elementClass: BiasSolidPropTestElement,
        }) as Component<{ listStyle?: string; variables?: Variables }>;
        const ForwardingWrapper: Component<{ style?: string; variables?: Variables }> = (props) => (
            <Wrapped listStyle={props.style} {...props} />
        );

        const container = document.createElement("div");
        const [color, setColor] = createSignal("#192d58");

        const dispose = render(
            () => <ForwardingWrapper variables={{ colorPrimary: color() }} />,
            container,
        );
        flush();

        const element = container.querySelector("bias-solid-prop-test");
        expect(element).toBeInstanceOf(BiasSolidPropTestElement);
        expect((element as BiasSolidPropTestElement).variables).toEqual({
            colorPrimary: "#192d58",
        });

        setColor("#2734ec");
        flush();

        expect((element as BiasSolidPropTestElement).variables).toEqual({
            colorPrimary: "#2734ec",
        });

        dispose();
    });
});
