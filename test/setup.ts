export async function settleBiasElements(_container: HTMLElement) {
    // Svelte custom elements create their inner component on the tick after
    // connectedCallback; allow the provider and leaf upgrade queues to drain.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
}
