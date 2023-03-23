import { mergeOptions } from "../utils";

export function initMixin (mVue) {
  mVue.options = {};
  mVue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  }
}