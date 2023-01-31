import { def, hasOwn } from '../utils';
import { arrayMethod } from './array';
import Dep from './dep';

function protoAugment (target, proto) {
  target.__proto__ = proto;
}

function defineReactive(target, key) {
  let value = target[key];
  const dep = new Dep();

  let childObj = observe(value);

  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get () {
      if (Dep.target) {
        // 依赖收集
        dep.depend(); // 属性的dep依赖收集器)记住这个watcher(组件对应watcher)
        if (childObj) {
          // 让对象和数组本身也实现依赖收集
          childObj.dep.depend();
          // 对数组中的数组再进行依赖收集，解决多个数组嵌套 内层数据依赖收集的问题
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
        // 这样实现依赖收集不能监控到新增的属性（需要用$set实现），之前偶尔可以实现是因为
        // 不小心把新增属性和其他能够触发依赖收集的操作写到了一起（如数组push）
        // 而当时实现的update方法也是整个刷新的没有diff，所以整个虚拟DOM全部刷新了，纯属笔误，记录一下
      }
      return value;
    },
    set (newValue) {
      if (newValue === value) return;
      childObj = observe(newValue);
      value = newValue;
      dep.notify();
    }
  })
}

class Observer {
  constructor (data) {

    // 给对象和数组也加上dep，原因是 数组新增了元素或者对象新增了属性，就可以触发依赖收集了
    this.dep = new Dep();

    // 只能劫持已存在的属性，新添加的如果要实现响应式需要用其他API $set $delete
    def(data, "__ob__", this);

    if (Array.isArray(data)) {
      protoAugment(data, arrayMethod);
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }  

  // 劫持data对象中的属性
  walk (data) {
    // 遍历对象中的所有属性，调用defineReactive劫持每个属性
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(data, keys[i]);
    }
  }
  // 劫持数组
  observeArray (data) {
    for (let i = 0; i < data.length; i++) {
      observe(data[i]);
    }
  }
}

export function observe (data) {

  // 如果不是对象就不用代理了
  if (typeof data !== 'object' || data == null) {
    return;
  }

  // 如果被代理过就不用重复代理了
  if (hasOwn(data, '__ob__') && data.__ob__ instanceof Observer) {
    return data.__ob__;
  }
  
  return new Observer(data);

}

function dependArray (value) {
  let e;
  for (let i = 0; i < value.length; i++) {
    e = value[i]
    // 让数组里面的数组继续收集依赖
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
