import polyfill from 'rollup-plugin-polyfill'
import typescript from 'rollup-plugin-typescript2';
import serve from 'rollup-plugin-serve'

let defaults = { compilerOptions: { declaration: true } };
 let override = { compilerOptions: { declaration: false } };

const plugins = [
  typescript({
    tsconfigDefaults: defaults,
    tsconfig: "tsconfig.json",
    tsconfigOverride: override
  }),
  // commonjs(),
  polyfill(['./colorUtils.ts']),
  serve({
    open: true
  })
]

export default {
  input: './src/colorUtils.ts',
  output: {
    file: './src/bundle.js',
    format: 'es',
    name: 'example'
  },
  plugins
}