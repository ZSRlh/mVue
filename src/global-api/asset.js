export function initAssetRegisters (mVue) {
  // 全局指令，在Vue上维护所有的全局组件
  mVue.options.components = {};
  mVue.component = function (id, definition) {
    definition = typeof definition === 'function' ? definition : mVue.extend(definition);
    mVue.options.components[id] = definition;
    return definition;
  }
}