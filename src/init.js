import { initState } from "./state";

export function initMixin (mVue) {
  mVue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    initState(vm);
  }
}