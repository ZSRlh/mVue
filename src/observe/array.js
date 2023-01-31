import { def } from '../utils';

const arrayProto = Array.prototype;

/**
 * vue处理数组的时候，在数组原来的原型上又加了一层原型，来实现对数组变化的劫持
 * 原生数组: arr.__proto__ === Array.prototype // true
 * Vue数组: vueArr.__proto__.__proto__ === Array.prototype // true
 * 
 * vueArr.__proto__ === arrayMethod
 * arrayMethod的原型设为数组原来的原型(Array.prototype)
 * 在arrayMethod上重定义改变数组的七个方法
 * 
 * 缺点是由于劫持的是数组的方法，所以只有通过这七个方法改变数组，才能触发响应式，通过索引修改不能触发响应式
 */
export const arrayMethod = Object.create(arrayProto);

const methodsToPatch = [
  'push',
  'pop',
  'unshift',
  'shift',
  'splice',
  'sort',
  'reverse',
]

methodsToPatch.forEach(function (method) {
  const originMethod = arrayProto[method];
  def(arrayMethod, method, function (...args) {
    const result = originMethod.apply(this, args);
    const observer = this.__ob__;
    let inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) {
      observer.observeArray(inserted);
    }
    observer.dep.notify();
    return result;
  })
})