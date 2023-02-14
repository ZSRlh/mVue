import { createElementVNode, createTextVNode } from "./vdom";
import Watcher from './observe/watcher';

function patchProps (el, props) {
  for (const key in props) {
    if (Object.hasOwnProperty.call(props, key)) {
      if (key === 'style') {
        for (const styleName in props.style) {
          if (Object.hasOwnProperty.call(props.style, styleName)) {
            el.style[styleName] = props.style[styleName];
          }
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
}

function createElm (vnode) {
  const {
    tag,
    data,
    children,
    text
  } = vnode;
  // 创建完元素后，要把元素实例绑定到虚拟节点上，方便后续操作
  if (typeof tag === 'string') {
    // 标签
    vnode.el = document.createElement(tag);
    patchProps(vnode.el, data);
    children.forEach(child => {
      vnode.el.appendChild(createElm(child));
    })
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}


function patch(oldVNode, vnode) {

  const isRealElement = oldVNode.nodeType;

  if (isRealElement) {
    // initial render
    const elm = oldVNode;
    const parentElm = elm.parentNode;

    // 根据虚拟节点创建真实DOM
    let newElm = createElm(vnode);

    // 在父节点下一个兄弟节点前面插入新节点
    // TODO: 这个Diff的逻辑一样，要在旧节点下一个节点前插入新的，而不是在旧节点后面插入，想想为啥？
    // 是同一个逻辑，如果在旧的节点后面插入，存在多个新节点的时候，顺序会变化（第二个新节点，会在第一个新节点前面）
    parentElm.insertBefore(newElm, elm.nextSibling);
    // 删掉旧节点
    parentElm.removeChild(elm);

    return newElm;

  } else {
    // updates, diff算法
  }
}

export function initLifeCycle (mVue) {
  /**
   * 将虚拟DOM转换成真实DOM
   * @param {Object} vnode 虚拟DOM
   */
  mVue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el;
    vm.$el = patch(el, vnode);
  }

  // _c(tag, props, children)
  mVue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  }

  // _v(text)
  mVue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  }

  // _s(variable name)
  mVue.prototype._s = function (text) {
    // return text.toString();
    // TODO: 这里用JSON.stringify或者toString都有问题
    // 用 JSON.stringify 字符串变量会带双引号，用toString 对象会变成[object Object]
    // 源码中渲染对象（也可能是数组中的对象）的时候 是对对象中的每个属性递归地调用了 render 函数，才得以渲染出对象原本的样子（个人理解
    return JSON.stringify(text);
  }

  /**
   * 将render函数转化成虚拟DOM
   * @returns Virtual DOM
   */
  mVue.prototype._render = function () {
    const vm = this;
    return vm.$options.render.call(vm);
  }
}

export function mountComponent (vm, el) {
  vm.$el = el;
  /**
   * 1. 调用render方法产生虚拟节点，虚拟DOM vm._render
   * 2. 根据虚拟DOM产生真实DOM vm._update
   * 3. 插入el元素
   */
  // vm._update(vm._render());

  const updateComponent = () => {
    vm._update(vm._render());
  }

  const watcher = new Watcher(vm, updateComponent, undefined, undefined, true);
}

export function callHook (vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm);
    }
  }
}