import { initMixin } from "./init";

function mVue (option) {
  this._init(option);
}

initMixin(mVue);

export default mVue;