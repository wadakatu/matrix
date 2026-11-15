import { defineConfig } from "@terrazzo/cli";
import matrix from "./scripts/terrazzo-matrix.mjs";

export default defineConfig({
  tokens: ["./tokens/matrix.resolver.json"],
  outDir: "./dist/",
  plugins: [matrix()],
});
