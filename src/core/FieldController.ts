import type { BiasFieldStatus, FrameFieldType, FrameMessage } from "./types";

export type FieldControllerOptions = {
    type: FrameFieldType;
    clientSecret: string;
    frameUrl: string;
    onStateChange(nextState: Partial<BiasFieldStatus>): void;
    onEncryptedData?(field: FrameFieldType, encryptedValue: string | null): void;
};

export type FieldController = {
    readonly iframeSrc: string;
    setIframe(element: HTMLIFrameElement | undefined): void;
    send(message: unknown): void;
    setStyle(css: string): void;
    handleIframeLoad(): void;
    /** Call on teardown (replaces framework onCleanup). */
    destroy(): void;
};

function createFieldUrl(frameUrl: string, type: FrameFieldType, clientSecret: string): string {
    const baseHref = typeof window === "undefined" ? "http://localhost" : window.location.href;
    const url = new URL(frameUrl, baseHref);
    url.searchParams.set("type", type);
    url.searchParams.set("client_secret", clientSecret);
    return url.toString();
}

function getOrigin(iframeSrc: string): string {
    try {
        return new URL(iframeSrc).origin;
    } catch {
        return "";
    }
}

export function createFieldController(options: FieldControllerOptions): FieldController {
    let iframe: HTMLIFrameElement | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let frameReady = false;
    let messageQueue: unknown[] = [];

    const iframeSrc = createFieldUrl(options.frameUrl, options.type, options.clientSecret);
    const origin = getOrigin(iframeSrc);

    function send(message: unknown) {
        if (!frameReady) {
            messageQueue.push(message);
            return;
        }
        iframe?.contentWindow?.postMessage(message, origin);
    }

    function observeWrapper() {
        const wrapper = iframe?.parentElement;
        if (!wrapper || typeof ResizeObserver === "undefined") return;

        resizeObserver?.disconnect();
        resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            const size = Array.isArray(entry.borderBoxSize)
                ? entry.borderBoxSize[0]
                : entry.borderBoxSize;

            const width = size?.inlineSize ?? entry.contentRect.width;
            const height = size?.blockSize ?? entry.contentRect.height;

            send({ type: "resize", width, height });
        });

        resizeObserver.observe(wrapper);
    }

    function handleMessage(event: MessageEvent<unknown>) {
        if (!iframe || event.source !== iframe.contentWindow) return;
        if (typeof event.data !== "object" || event.data === null) return;
        if (!("type" in event.data) || typeof (event.data as any).type !== "string") return;

        const message = event.data as FrameMessage;

        if (message.type === "ready") {
            frameReady = true;
            for (const queued of messageQueue) {
                iframe?.contentWindow?.postMessage(queued, origin);
            }
            messageQueue = [];
            options.onStateChange({ loading: false });
        } else if (message.type === "validity") {
            options.onStateChange({ valid: message.valid });
        } else if (message.type === "error") {
            options.onStateChange({ error: message.error ?? "" });
        } else if (message.type === "focus") {
            options.onStateChange({ focused: true });
        } else if (message.type === "blur") {
            options.onStateChange({ focused: false });
        } else if (message.type === "cardBrand") {
            options.onStateChange({
                cardBrand: (message.brand as BiasFieldStatus["cardBrand"]) ?? null,
            });
        } else if (message.type === "encryptedData") {
            options.onEncryptedData?.(message.field, message.encryptedValue);
        }
    }

    if (typeof window !== "undefined") {
        window.addEventListener("message", handleMessage);
    }

    return {
        get iframeSrc() {
            return iframeSrc;
        },
        setIframe(element) {
            iframe = element;
        },
        send,
        setStyle(css: string) {
            send({ type: "style", style: css });
        },
        handleIframeLoad() {
            observeWrapper();
        },
        destroy() {
            if (typeof window !== "undefined") {
                window.removeEventListener("message", handleMessage);
            }
            resizeObserver?.disconnect();
        },
    };
}
