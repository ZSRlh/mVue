export * from "./next-tick";
export * from "./options";

export function noop (a, b, c) {};

export function def (obj, key, value, enumerable) {
  Object.defineProperty(obj, key, {
    value,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  })
}

// 判断obj中有没有key属性
export function hasOwn (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

// 判断是否是JS原生对象
export function isPlainObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
// 判断是否是对象
export function isObject (obj) {
  return obj !== null && typeof obj === 'object';
}

// 解析字符串取值路径
export function parsePath (path) {
  const segments = path.split('.');
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  }
}