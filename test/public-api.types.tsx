import { BiasProvider } from "../src";

// @ts-expect-error API endpoint overrides are not provider props
<BiasProvider clientSecret="cs_test" apiBaseUrl="https://api.example"><div /></BiasProvider>;
// @ts-expect-error secure frame endpoint overrides are not provider props
<BiasProvider clientSecret="cs_test" frameUrl="https://field.example"><div /></BiasProvider>;
