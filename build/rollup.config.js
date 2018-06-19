import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import progress from 'rollup-plugin-progress';

export default {
  input: 'scripts/app.js',
  output: {
    file: 'static/scripts/bundle.js',
    format: 'cjs',
    sourceMap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    filesize(),
    progress()
  ]
};
