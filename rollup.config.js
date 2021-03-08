import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";

export default {
  input: "src/index.js",
  output: {
    dir: "public/assets",
    format: "iife",
  },
  plugins: [
    postcss({ extract: true, minimize: true }),
    nodeResolve({
      // dedupe: ["regenerator-runtime"],
    }),
    commonjs(),
    babel({
      babelHelpers: "bundled",
    }),
    terser(),
  ],
};
