import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  base: "/~jass01/sp2/",
  build: {
    assetsInlineLimit: 0,
  },
});
