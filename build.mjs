import { build } from "esbuild";
import { rimraf } from "rimraf";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2), {
  boolean: ["minify", "sourcemap"],
});

await rimraf("scripts");
await build({
  bundle: true,
  platform: "node",
  entryPoints: ["src/main.ts"],
  outfile: "dist/main.js",
  external: ["@minecraft/*"],
  minify: argv.minify,
  sourcemap: argv.sourcemap,
});
