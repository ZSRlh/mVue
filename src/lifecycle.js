import { createElementVNode, createTextVNode } from "./vdom"

export function initLifeCycle (mVue) {
  mVue.prototype._update = function () {

  }

  mVue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  }

  mVue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  }

  mVue.prototype._s = function (text) {
    return JSON.stringify(text);
  }


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