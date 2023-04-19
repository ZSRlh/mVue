import { nextTick } from "../utils";
import { initAssetRegisters } from "./asset";
import { initExtend } from "./extend";
import { initMixin } from "./mixin";

export function initGlobalAPI (mVue) {
  mVue.nextTick = nextTick;

  initMixin(mVue);
  initExtend(mVue);
  initAssetRegisters(mVue);
}