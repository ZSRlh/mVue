import { popTarget, pushTarget } from "./dep";
import { nextTick } from "../utils";

let id  = 0;

class Watcher {
  constructor (vm, fn, option, isRenderWatcher) {
    this.id = id++;
    this.deps = [];
    this.depIds = new Set();


    this.getter = fn;
    this.get();
  }
  get () {
    pushTarget(this);
    this.getter();
    popTarget();
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
    console.log('watcher update')
    queueWatcher(this);
  }

  run () {
    console.log('update')
    this.get();
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