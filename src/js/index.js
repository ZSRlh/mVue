import { Observer } from "./observer.js";


let p = {};
let val = 'zsr';

Object.defineProperty(p, 'name', {
  enumerable: true,  // 为true，可以被forin和Object.keys拿到
  configurable: true, // 属性是否可以被编辑（如删除等，赋值不是，赋值是通过writabel控制的）
  // writable: true, // writable 和 value 不能和accessors（get、set）同时设置
  // value: 3,
  get() {
    console.log('get property name');
    return val;
  },
  set(newVal) {
    console.log('set property name');
    val = newVal;
  }
})

let obj = {
  name: 'zsr',
  age: 23,
}

var aa = new Observer(obj);
console.log(aa)