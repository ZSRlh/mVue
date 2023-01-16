import { initState } from "./state";
import { compileToFunction } from './compiler'
import { mountComponent } from "./lifecycle";
import { nextTick } from "./utils";

export function initMixin (mVue) {
  mVue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    initState(vm);

    if (options.el) {
      vm.$mount(options.el);

      /**
       * 下面通过模拟用户使用，说明一个问题：
       * 如何拿到最新更新的DOM?
       */
      
      // 1. 直接更新之后，获取DOM
      // 取不到新的，因为这里的代码是同步执行的，而watcher在更新的时候采用了异步更新(settimeout)
      // vm.name = 'lll'
      // let app = document.getElementById("app");
      // console.log(app.innerHTML); // zsr 旧的

      // 2.1 在settimeout中获取DOM
      // 异步可以取到
      // vm.name = 'lll'
      // setTimeout(() => {
      //   let app = document.getElementById("app");
      //   console.log(app.innerHTML); // lll 新的
      // }, 0);

      // 2.2 在settimeout中获取DOM(交换位置)
      // 因为获取DOM的任务放到了watcher更新之前
      // setTimeout(() => {
      //   let app = document.getElementById("app");
      //   console.log(app.innerHTML); // zsr 旧的
      // }, 0);
      // vm.name = 'lll'

      // 3. 用promise
      // 不论顺序前后，都是旧的，因为此时watcher的更新方法是settimeout，微任务优先级一定高于宏任务
      // Promise.resolve().then(() => {
      //   let app = document.getElementById("app");
      //   console.log(app.innerHTML); // zsr 旧的
      // })
      // vm.name = 'lll'

      // 4. 通过nextTick方法统一用户和内部使用
      // 输出的DOM新旧和vm.name赋值先后顺序相符，在用户使用的时候，应该是通过生命周期来控制
      // vm.name = 'lll'
      // nextTick(() => {
      //   let app = document.getElementById("app");
      //   console.log(app.innerHTML);
      // })
      
      // 异步更新举例
      // setTimeout(() => {
      //   vm.name = 'lh';
      //   vm.name = 18
      // }, 1000);
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