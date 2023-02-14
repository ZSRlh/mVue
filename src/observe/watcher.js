import { popTarget, pushTarget } from "./dep";
import { isObject, nextTick, noop, parsePath } from "../utils";

let id  = 0;

class Watcher {
  constructor (vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm;
    if (isRenderWatcher) {
      vm._watcher = this;
    }

    this.id = id++;
    this.deps = [];
    this.depIds = new Set();

    // 调用这个函数会发生取值操作
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = noop;
      }
    }
    this.cb = cb;

    if (options) {
      this.lazy = options.lazy;
      this.user = options.user;  // 是否是用户自定义wather
      window.a = this;
    }

    this.dirty = this.lazy; // 缓存值

    this.value = this.lazy ? undefined : this.get();

  }
  get () {
    const vm = this.vm;
    pushTarget(this);
    const value = this.getter.call(vm, vm);
    popTarget();
    return value;
  }
  addDep (dep) {
    const id = dep.id;
    if (!this.depIds.has(id)) {
      this.deps.push(dep);
      this.depIds.add(id);
      dep.addSub(this);
    }
  }

  update () {
    if (this.lazy) {
      // 如果是计算属性，依赖的值变化了，就需要让dirty变为true，保证更新
      this.dirty = true;
    } else {
      queueWatcher(this);
    }
  }

  run () {
    const value = this.get();
    if (
      value !== this.value ||
      isObject(value) ||
      this.deep
    ) {
      if (this.user) {
        const oldValue = this.value;
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }

  evaluate () {
    // 获取get执行结果的返回值，取消脏值标记
    this.value = this.get();
    this.dirty = false;
  }

  depend () {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
}

let queue = [];
let has = {};
let watching = false;

function flushSchedulerQueue () {
  const flushQueue = queue.slice();
  queue = [];
  has = {};
  flushQueue.forEach(e => e.run());
  watching = false;
}

/**
 * 实现异步更新
 * - 多次修改变量合并为一次渲染(_update)，类似于react的事件合成机制
 * @param {Watcher} watcher 
 */
function queueWatcher (watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;

    if (!watching) {
      watching = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

export default Watcher;