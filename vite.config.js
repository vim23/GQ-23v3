import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

/** @type {import('vite').UserConfig} */
const config = {
    logLevel: "info",
    build: {
        minify: false,
    },
    define: {
        __DATE__: `'${new Date().toISOString()}'`,
        __RELOAD_SW__: false,
    },
    plugins: [
        sveltekit(),
        SvelteKitPWA({
            srcDir: "./src",
            mode: "production",
            strategies: "injectManifest",
            injectRegister: "auto",
            filename: "prompt-sw.ts",
            scope: "/",
            base: "/",
            manifest: {
                short_name: "GTPS",
                name: "Get the Picture Surveys",
                scope: "/",
                start_url: "/",
                display: "standalone",
                theme_color: "#1ECBE1",
                background_color: "#95DFE9",
                orientation: "any",
                description: "A powerful crowdsourcing app driven by community members like you, so that we build a better society together.",
                id: "manifest.webmanifest",
                lang: "en",
                icons: [
                    {
                        src: "/assets/icons/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/assets/icons/icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
            injectManifest: {
                globPatterns: ["client/**/*.{js,css,ico,png,svg,webp,woff,woff2}"],
            },
            devOptions: {
                enabled: true,
                type: "module",
                navigateFallback: "/",
            },
            // if you have shared info in svelte config file put in a separate module and use it also herenr lint
            kit: {},
        }),
    ],
};

export default config;
