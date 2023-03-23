import { nextTick } from "../utils";
import { initMixin } from "./mixin";

export function initGlobalAPI (mVue) {
  mVue.nextTick = nextTick;

  initMixin(mVue);
}