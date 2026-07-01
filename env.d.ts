/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

declare module "*.css" {
    const styles: string;
    export default styles;
}

declare module "*.module.css" {
    const classes: Record<string, string>;
    export default classes;
}
