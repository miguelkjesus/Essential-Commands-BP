import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/main.ts",
  output: {
    file: "scripts/main.js",
    format: "es",
  },
  plugins: [nodeResolve(), typescript()],
};
