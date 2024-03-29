import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher from "./observe/watcher";
import { isPlainObject, noop } from "./utils";

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
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
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

function initComputed (vm) {
  const computed = vm.$options.computed;

  // 记录属性和watcher的对应关系
  const watchers = vm._computedWatchers = Object.create(null);

  for (let key in computed) {
    const userDef = computed[key];
    const getter = typeof userDef === 'function' ? userDef : userDef.get;

    // 监控计算属性中get的变化，进行依赖收集，懒watcher，取值的时候再执行
    watchers[key] = new Watcher(vm, getter, noop, { lazy: true });
    
    defineComputed(vm, key, userDef);
    
  }
}

function defineComputed (target, key, userDef) {

  const setter = typeof userDef === 'function' ? userDef : userDef.set;

  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  })
}

// 计算属性本身不会收集依赖，而是让自己依赖的属性去收集依赖
function createComputedGetter (key) {
  // 脏值检测，判断是否执行这个getter
  // 检测需要用到watcher，所以上面通过_computedWatchers将watchers放到vm上
  return function computedGetter () {
    // 获取属性对应的wather
    const watcher = this._computedWatchers[key];
    if (watcher.dirty) {
      // 脏值，需要更新
      watcher.evaluate();
    }
    if (Dep.target) {
      // 计算属性watcher出栈后 还有渲染watcher，计算属性的依赖也应该收集渲染watcher
      watcher.depend();
    }
    return watcher.value;
  }
}

function initWatch (vm) {
  const watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key]; // watch可以是字符串方法名、数组、函数或对象
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher (vm, expOrFn, handler, options) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options);
}

export function stateMixin (mVue) {
  mVue.prototype.$watch = function (expOrFn, cb, options) {
    const vm = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options);
    }
    options = options || {};
    options.user = true;  // 表示是用户自己定义的watcher
    const watcher = new Watcher(vm, expOrFn, cb, options, false);
  }
}