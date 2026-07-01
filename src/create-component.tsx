import { createMemo, createRenderEffect, type Component, type JSX } from "solid-js";
import { Dynamic } from "@solidjs/web";

export type EventName<T extends Event = Event> = string & {
    __eventType: T;
};

type EventNames = Record<string, EventName | string>;

const reservedSolidProperties = new Set(["children", "ref", "style", "class", "classList"]);

const listenedEvents = new WeakMap<Element, Map<string, { handleEvent: (e: Event) => void }>>();

function addOrUpdateEventListener(
    node: Element,
    event: string,
    listener: ((e: Event) => void) | undefined,
) {
    let events = listenedEvents.get(node);
    if (events === undefined) {
        listenedEvents.set(node, (events = new Map()));
    }
    let handler = events.get(event);
    if (listener !== undefined) {
        if (handler === undefined) {
            events.set(event, (handler = { handleEvent: listener }));
            node.addEventListener(event, handler);
        } else {
            handler.handleEvent = listener;
        }
    } else if (handler !== undefined) {
        events.delete(event);
        node.removeEventListener(event, handler);
    }
}

function setProperty(
    node: HTMLElement,
    name: string,
    value: unknown,
    old: unknown,
    events?: EventNames,
) {
    const event = events?.[name];
    if (event !== undefined) {
        if (value !== old) {
            addOrUpdateEventListener(
                node,
                event,
                typeof value === "function" ? (value as (e: Event) => void) : undefined,
            );
        }
        return;
    }
    (node as unknown as Record<string, unknown>)[name] = value;
    if ((value === undefined || value === null) && name in HTMLElement.prototype) {
        node.removeAttribute(name);
    }
}

type Constructor<T> = {
    new (): T;
};

export interface CreateComponentOptions<
    I extends HTMLElement,
    E extends EventNames = Record<string, never>,
> {
    tagName: string;
    elementClass: Constructor<I>;
    events?: E;
    displayName?: string;
}

export function createComponent<
    I extends HTMLElement,
    E extends EventNames = Record<string, never>,
>(options: CreateComponentOptions<I, E>): Component<any> {
    const { tagName, elementClass, events } = options;
    const eventPropNames = new Set(Object.keys(events ?? {}));

    const WebComponent: Component<any> = (props) => {
        let element: I | undefined;
        let prevElementProps = new Map<string, unknown>();

        const getElementProperties = () => {
            const elementProps = new Map<string, unknown>();

            for (const [key, value] of Object.entries(props)) {
                if (reservedSolidProperties.has(key)) continue;
                if (eventPropNames.has(key) || key in elementClass.prototype) {
                    elementProps.set(key, value);
                }
            }

            return elementProps;
        };

        const syncElementProperties = (nextElementProps = getElementProperties()) => {
            const el = element;
            if (!el) return;

            for (const [key, value] of nextElementProps) {
                setProperty(el, key, value, prevElementProps.get(key), events);
                prevElementProps.delete(key);
            }

            for (const [key, value] of prevElementProps) {
                setProperty(el, key, undefined, value, events);
            }

            prevElementProps = nextElementProps;
        };

        createRenderEffect(
            () => getElementProperties(),
            (nextElementProps) => {
                syncElementProperties(nextElementProps);
            },
        );

        const attributeProps = createMemo(() => {
            const attrs: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(props)) {
                if (reservedSolidProperties.has(key)) {
                    if (key === "class" || key === "classList" || key === "style") {
                        attrs[key] = value;
                    }
                    continue;
                }
                if (eventPropNames.has(key) || key in elementClass.prototype) continue;
                attrs[key] = value;
            }
            return attrs;
        });

        return (
            <Dynamic
                component={tagName}
                {...attributeProps()}
                ref={(el: I) => {
                    if (element !== el) {
                        prevElementProps = new Map();
                    }
                    element = el;
                    syncElementProperties();
                    if (typeof props.ref === "function") {
                        (props.ref as (node: I) => void)(el);
                    }
                    el?.removeAttribute("defer-hydration");
                }}
            >
                {props.children as JSX.Element}
            </Dynamic>
        );
    };

    return WebComponent;
}
