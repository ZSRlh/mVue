/**
 * 把事件收集起来，放到数组中，最后统一更新，可以保证顺序
 * 源码中很多地方都用到这种方法，除了nextTick，异步更新也是这么做的
 * 这个思想类似于防抖，也类似react的事件合成机制
 * 
 * nextTick不是创建了异步任务，而是将任务收集到队列中，统一执行
 */
let callbacks = []; // nextTick callbacks队列
let pending = false;

function flushCallbacks () {
  let cbs = callbacks.slice();
  callbacks = [];
  cbs.forEach(cb => cb());
  pending = false;
}

/**
 * nextTick 优雅降级
 * promise -> MutataionObserver -> setImmediate -> setTimeout
 */
let timeFunc = () => {};

if (Promise) {
  timeFunc = () => {
    Promise.resolve().then(flushCallbacks);
  }
} else if (MutationObserver) {
  let counter = 1;
  let observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timeFunc = () => {
    counter = (counter + 1) % 2;  // 在 0 1 之间切换
    textNode.textContent = String(counter);
  }
} else if (setImmediate) {
  timeFunc = () => {
    setImmediate(flushCallbacks);
  }
} else {
  timeFunc = () => {
    setTimeout(flushCallbacks);
  }
}




export function nextTick (cb) {
  callbacks.push(cb);
  if (!pending) {
    pending = true;
    timeFunc();
    // setTimeout(() => {
    //   flushCallbacks();
    // }, 0);
  }
}