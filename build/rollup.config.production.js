import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import progress from 'rollup-plugin-progress';
import cleanup from 'rollup-plugin-cleanup'; // production

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/scripts/bundle.js',
    format: 'cjs',
    sourceMap: false
  },
  plugins: [
    replace({
      ENVIRONMENT: JSON.stringify('production')
    }),
    cleanup(),
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    filesize(),
    progress()
  ]
};
