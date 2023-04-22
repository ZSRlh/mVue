import { mergeOptions } from "../utils";

export function initMixin (mVue) {
  mVue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  }
}