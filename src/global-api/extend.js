import { mergeOptions } from "../utils";

export function initExtend (mVue) {
  mVue.extend = function (extendOptions) {

    const Sub = function mVueComponent (options) {
      // 最终使用的组件
      this._init(options);
    }

    // a = Object.create(b) 以b为原型创建a
    //   ==> a.__proto__ = b;
    // 继承Vue，复用原型
    Sub.prototype = Object.create(mVue.prototype);
    // Object.create 继承后，constructor 会变成原型的构造函数，需要重置
    Sub.prototype.constructor = Sub;

    // 为了构建出组件和全局的父子关系(同名组件逐级向上找)，需要合并属性
    Sub.options = mergeOptions(this.options, extendOptions);

    return Sub;
  }
}