export * from "./next-tick";
export * from "./options";

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