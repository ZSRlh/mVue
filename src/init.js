import { initState } from "./state";
import { compileToFunction } from './compiler'
import { mountComponent } from "./lifecycle";

export function initMixin (mVue) {
  mVue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    initState(vm);

    if (options.el) {
      vm.$mount(options.el);
      setTimeout(() => {
        vm.name = 'lh';
        vm.age = 18
        console.log('first')
        vm._update(vm._render());
      }, 1000);
    }
  }

  mVue.prototype.$mount = function (el) {
    const vm = this;
    const opts = vm.$options;
    el = document.querySelector(el);

    if (!opts.render) {
      let template;

      // 优先识别template
      if (!opts.template) {
        if (el) {
          template = el.outerHTML;
        }
      } else {
        template = opts.template;
      }

      if (template) {
        const render = compileToFunction(template.trim());
        opts.render = render;
      }
    }
    mountComponent(vm, el)
  }
}