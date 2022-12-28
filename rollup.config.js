import babel from 'rollup-plugin-babel';

export default {
  input: './src/index.js',
  output: {
    file: './dist/vue.js',
    name: 'Vue',
    // 打包格式：esm | es6 | commonjs | iife(自执行函数) | umd
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 排除node_modules中的所有文件
    })
  ]
}