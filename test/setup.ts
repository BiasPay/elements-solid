import "@biaspay/web";
import { flush } from "solid-js";

export async function settleBiasElements(_container: HTMLElement) {
    flush();
    await Promise.resolve();
    flush();
}
