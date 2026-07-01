import { Store, $PROXY } from "solid-js";

export function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(" ");
}

export function trackDeep<T extends Store<object>>(store: T): T {
    traverse(store, new Set());
    return store;
}

function traverse<T>(value: Store<T>, seen: Set<unknown>): void {
    let isArray: boolean;
    let proto;
    // check the same conditions as in `isWrappable` from `/packages/solid/store/src/store.ts`
    if (
        value != null &&
        typeof value === "object" &&
        !seen.has(value) &&
        ((isArray = Array.isArray(value)) ||
            (value as any)[$PROXY] ||
            !(proto = Object.getPrototypeOf(value)) ||
            proto === Object.prototype)
    ) {
        seen.add(value);
        for (const child of isArray ? (value as unknown as any[]) : Object.values(value))
            traverse(child, seen);
    }
}
