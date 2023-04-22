import { nextTick } from "../utils";
import { initAssetRegisters } from "./asset";
import { initExtend } from "./extend";
import { initMixin } from "./mixin";

export function initGlobalAPI (mVue) {
  mVue.nextTick = nextTick;

  // 静态方法
  mVue.options = {
    _base: mVue,
  }

  initMixin(mVue);
  initExtend(mVue);
  initAssetRegisters(mVue);
}