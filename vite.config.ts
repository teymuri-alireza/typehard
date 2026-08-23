import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
    clearScreen: false,

    server: {
        port: 1420,
        strictPort: true,
        host: host || false,

        ...(host
            ? {
                hmr: {
                    protocol: "ws" as const,
                    host,
                    port: 1421,
                },
            }
            : {}),

        watch: {
            ignored: ["**/src-tauri/**"],
        },
    },
}));
