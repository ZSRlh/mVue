import { def, hasOwn } from '../utils';
import { arrayMethod } from './array';

function protoAugment (target, proto) {
  target.__proto__ = proto;
}

function defineReactive(target, key) {
  let value = target[key];

  let childObj = observe(value);

  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get () {
      console.log('in Observer get');
      return value;
    },
    set (newValue) {
      console.log('in Observer set');
      if (newValue === value) return;
      childObj = observe(newValue);
      value = newValue;
    }
  })
}

class Observer {
  constructor (data) {
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