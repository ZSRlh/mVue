import { createElementVNode, createTextVNode } from "./vdom"

export function initLifeCycle (mVue) {
  /**
   * 将虚拟DOM转换成真实DOM
   * @param {Object} vnode 虚拟DOM
   */
  mVue.prototype._update = function (vnode) {

  }

  // _c(tag, props, children)
  mVue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  }

  // _v(text)
  mVue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  }

  // _s(variable name)
  mVue.prototype._s = function (text) {
    return JSON.stringify(text);
  }

  /**
   * 将render函数转化成虚拟DOM
   * @returns Virtual DOM
   */
  mVue.prototype._render = function () {
    const vm = this;
    return vm.$options.render.call(vm);
  }
}

export function mountComponent (vm, el) {
  vm.$el = el;
  /**
   * 1. 调用render方法产生虚拟节点，虚拟DOM vm._render
   * 2. 根据虚拟DOM产生真实DOM vm._update
   * 3. 插入el元素
   */
  vm._update(vm._render());

} 