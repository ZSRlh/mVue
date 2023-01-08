import babel from 'rollup-plugin-babel';
import alias from 'rollup-plugin-alias';
import nodeResolve from '@rollup/plugin-node-resolve';

const path = require('path');

export default {
  input: './src/index.js',
  output: {
    file: './dist/mVue.js',
    name: 'mVue',
    // 打包格式：esm | es6 | commonjs | iife(自执行函数) | umd
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 排除node_modules中的所有文件
    }),
    nodeResolve(),
    // TODO: rollup-plugin-alias 和 rollup-plugin-node-resolve 貌似不能同时用,
    alias({
      "@": path.resolve('src')
    }),
  ]
}