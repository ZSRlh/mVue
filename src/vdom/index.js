import { isReservedTag } from "./utils";

function vnode (vm, tag, key, data, children, text, componentOptions) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions
  }
}

function createComponentVnode (vm, tag, key, data, children, Ctor) {
  if (typeof Ctor === 'object') {
    Ctor = vm.$options._base.extend(Ctor);
  }
  installComponentHooks(data);
  return vnode(vm, tag, key, data, children, undefined, { Ctor });
}

// h() | _c()
export function createElementVNode (vm, tag, data = {}, ...children) {
  let key = data.key;
  // TODO: 直接操作原始数据是否不妥
  delete data.key;

  if (isReservedTag(tag)) {
    // 原始标签
    return vnode(vm, tag, key, data, children);
  } else {
    // 自定义组件
    const Ctor = vm.$options.components[tag];
    return createComponentVnode(vm, tag, key, data, children, Ctor);
  }
}

// _v()
export function createTextVNode (vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

export function sameVnode (a, b) {
  return a.tag === b.tag && a.key === b.key;
}

function installComponentHooks (data) {
  data.hook = {
    // 创建真实节点时的hook
    init (vnode) {
      // 在虚拟节点上保存实例
      const instance = vnode.componentInstance = new vnode.componentOptions.Ctor();
      instance.$mount();
    }
  }
}