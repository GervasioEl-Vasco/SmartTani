import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
            // Pastikan hasil build masuk ke folder bernama 'build'
            buildDirectory: 'build', 
        }),
        react(),
    ],
    // Konfigurasi server ini aman dibiarkan untuk local development
    server: {
        cors: true,
        host: "0.0.0.0",
        port: 5173,
        hmr: {
            host: "192.168.1.103",
        },
    },
});