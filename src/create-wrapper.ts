import { createComponent, type EventName } from "./create-component";

type CreateWrapperOptions<E extends Record<string, EventName | string> = Record<string, never>> = {
    tagName: string;
    // Lit element classes from @biaspay/web don't satisfy CustomElementConstructor in TS
    // because emitted declarations retain unresolved path aliases.
    elementClass: object;
    events?: E;
};

export function createWrapper<E extends Record<string, EventName | string> = Record<string, never>>(
    options: CreateWrapperOptions<E>,
) {
    return createComponent({
        tagName: options.tagName,
        elementClass: options.elementClass as unknown as CustomElementConstructor,
        events: options.events ?? {},
    });
}
