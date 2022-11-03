import polyfill from 'rollup-plugin-polyfill'
import typescript from 'rollup-plugin-typescript2'
import serve from 'rollup-plugin-serve'
import commonjs from 'rollup-plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
// import {liveServer} from 'rollup-plugin-live-server';

let defaults = { compilerOptions: { declaration: true } }
let override = { compilerOptions: { declaration: false } }

const plugins = [
  typescript({
    tsconfigDefaults: defaults,
    tsconfig: 'tsconfig.json',
    tsconfigOverride: override,
  }),
  commonjs(),
  livereload(),
  polyfill(['./index.ts']),
  serve({
    open: true,
  }),
]

export default {
  input: './src/index.ts',
  output: [
    {
      file: './build/index.es.js',
      format: 'es',
    },
    {
      file: './build/index.js',
      format: 'cjs',
    },
  ],
  plugins,
}
