/**
 * Vue 的核心流程：
 * 1. 创造响应式数据
 * 2. 解析模版转换成ast语法树
 * 3. 将ast语法树转换成render函数，后续只需要执行render函数，无需执行ast转化过程
 * 
 * render会产生虚拟节点（使用响应式数据）
 * 根据生成的虚拟节点创造真实DOM
 */

import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";

function mVue (option) {
  this._init(option);
}

initMixin(mVue);
initLifeCycle(mVue);

export default mVue;