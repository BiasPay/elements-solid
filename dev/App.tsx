import { createSignal, Show } from "solid-js";
import { BiasProvider, PaymentForm } from "src";
import styles from "./App.module.css";

export default function App() {
    const [clientSecret, setClientSecret] = createSignal("P0nmavJZIhCanabkM0zvluPnBeVwdy0D");

    return (
        <main class={styles.page}>
            <BiasProvider clientSecret={clientSecret}>
                <Show when={clientSecret()}>
                    <PaymentForm />
                </Show>
            </BiasProvider>
        </main>
    );
}
