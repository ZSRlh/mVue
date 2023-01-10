
function vnode (vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text
  }
}

// h() | _c()
export function createElementVNode (vm, tag, data = {}, ...children) {
  let key = data.key;
  // TODO: 直接操作原始数据是否不妥
  delete data.key;
  return vnode(vm, tag, key, data, children);
}

// _v()
export function createTextVNode (vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}