import { isServer } from "@solidjs/web";
import { onCleanup } from "solid-js";
import { createFieldController, type FieldControllerOptions } from "./core/FieldController";
import type { BiasFieldStatus, FrameFieldType } from "./core/types";

// Re-export core types consumed by Solid components
export type { BiasFieldStatus, FrameFieldType };

const FIELD_FRAME_URL = import.meta.env.VITE_FIELD_FRAME_URL || "https://field.biaspay.com";

export type UseFrameFieldOptions = {
    type: FrameFieldType;
    clientSecret: string;
    frameUrl?: string;
    setFieldState(type: FrameFieldType, nextState: Partial<BiasFieldStatus>): void;
    registerAttemptPayment(type: FrameFieldType, attemptPayment: () => void): void;
    unregisterAttemptPayment(type: FrameFieldType): void;
    onEncryptedData?(field: FrameFieldType, encryptedValue: string | null): void;
};

export type UseBiasFieldResult = {
    readonly iframeSrc: string;
    getIframe(): HTMLIFrameElement | undefined;
    send(message: unknown): void;
    setStyle(style: string): void;
    setIframe(element: HTMLIFrameElement): void;
    handleIframeLoad(event: Event & { currentTarget: HTMLIFrameElement; target: Element }): void;
};

export function useBiasField(options: UseFrameFieldOptions): UseBiasFieldResult {
    let iframeRef: HTMLIFrameElement | undefined;

    const controllerOptions: FieldControllerOptions = {
        type: options.type,
        clientSecret: options.clientSecret,
        frameUrl: isServer ? "http://localhost" : (options.frameUrl ?? FIELD_FRAME_URL),
        onStateChange: (nextState) => options.setFieldState(options.type, nextState),
        onEncryptedData: options.onEncryptedData,
    };

    const controller = createFieldController(controllerOptions);

    options.registerAttemptPayment(options.type, () => {
        controller.send({ type: "validateFields" });
    });

    onCleanup(() => {
        controller.destroy();
        options.unregisterAttemptPayment(options.type);
    });

    return {
        get iframeSrc() {
            return controller.iframeSrc;
        },
        getIframe: () => iframeRef,
        send: controller.send,
        setStyle: controller.setStyle,
        setIframe(element) {
            iframeRef = element;
            controller.setIframe(element);
        },
        handleIframeLoad() {
            controller.handleIframeLoad();
        },
    };
}
