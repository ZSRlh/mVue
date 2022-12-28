import { def } from "./utils/index.js";

export class Observer {
  value;
  constructor (value) {
    this.value = value;
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      // TODO: array
    } else {
      this.walk(value);
    }
  };

  walk (obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
}

function defineReactive (obj, key, val, customSetter, shallow) {
  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  const getter = property && property.get;
  const setter = property && property.set;

  if (!getter && arguments.length === 2) {
    val = obj[key];
  }

  // TODO: childObj
  let childObj;

  Object.defineProperty(obj, key ,{
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val;
      // TODO: dependence;
      console.log('get in observer');
      return value;
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val;
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      console.log('set in observer');
      // TODO: dependence;
    }
  })

}
