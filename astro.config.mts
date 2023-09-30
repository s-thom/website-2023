import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD ? "https://sthom.kiwi" : "http://localhost:4321",
});
