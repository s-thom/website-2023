import { defineConfig } from "astro/config";
import sthomExternalImages from "./src/components/ExternalImage/integration";

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD ? "https://sthom.kiwi" : "http://localhost:4321",
  integrations: [sthomExternalImages()],
});
