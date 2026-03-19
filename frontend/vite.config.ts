import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-192x192.png", "pwa-512x512.png"],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}"],
        runtimeCaching: [
          {
            // Cache First for static assets (fonts, images)
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2?|ttf|eot)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "surepay-static-assets",
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            // Stale-While-Revalidate for API data (wallet, transactions)
            urlPattern: /\/api\/(wallets|transactions|profile)/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "surepay-api-data",
              expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            // Network First for transaction submissions
            urlPattern: /\/api\/transactions\/submit/,
            handler: "NetworkFirst",
            options: {
              cacheName: "surepay-tx-submit",
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Stale-While-Revalidate for Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
      manifest: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
