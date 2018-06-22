import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import progress from 'rollup-plugin-progress';
import replace from 'rollup-plugin-replace';

export default {
  input: 'src/scripts/index.js',
  output: {
    file: 'dist/scripts/bundle.js',
    format: 'cjs',
    sourceMap: true
  },
  plugins: [
    replace({
      ENVIRONMENT: JSON.stringify('development')
    }),
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    filesize(),
    progress()
  ]
};
