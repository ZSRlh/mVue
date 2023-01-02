import { observe } from "./observe/index";

function proxy (target, srcKey, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function proxyGetter () {
      return this[srcKey][key];
    },
    set: function proxySetter (newValue) {
      this[srcKey][key] = newValue;
    }
  })
}

export function initState (vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
}

function initData (vm) {
  let data = vm.$options.data;
  data = typeof data === 'function'
    ? data.call(vm)
    : data || {};
  vm._data = data;

  const keys = Object.keys(data);
  for (let i = 0; i < keys.length; i++) {
    // 将vm._data上的数据（即用户传入的data）代理到vm上
    proxy(vm, '_data', keys[i]);
  }

  observe(data);
}