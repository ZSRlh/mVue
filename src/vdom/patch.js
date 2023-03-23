import { sameVnode } from ".";

function patchProps (el, oldProps = {}, props = {}) {

  // 删除老的里面多余的
  const oldStyle = oldProps.style || {};
  const newStyle = props.style || {};
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = '';
    }
  }
  for (let key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }


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

export function createElm (vnode) {
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
    patchProps(vnode.el, {}, data);
    children.forEach(child => {
      vnode.el.appendChild(createElm(child));
    })
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}


export function patch(oldVNode, vnode) {

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
    /**
     * 1. 两个节点不是同一个节点 删除老的换新的
     * 2. 两个节点是同一个节点，判断tag和key，属性差异，复用老节点
     * 3. 父节点比较完比较儿子
     */
    return patchVnode(oldVNode, vnode);
    
  }
}

function patchVnode (oldVNode, vnode) {
  if (!sameVnode(oldVNode, vnode)) {
    // 不是同一个节点，新的替换老的，要用他们的父级节点进行操作
    const newEl = createElm(vnode);
    oldVNode.el.parentNode.replaceChild(newEl, oldVNode.el);
    return newEl;
  }

  const el = vnode.el = oldVNode.el;

  // 文本节点比较
  if (!oldVNode.tag) {
    // 没有tag标签，表示是文本节点
    if (oldVNode.text !== vnode.text) {
      // 不同
      oldVNode.el.textContent = vnode.text;

    }
  }

  // 标签
  patchProps(el, oldVNode.data, vnode.data);

  // 子节点
  const oldChildren = oldVNode.children || [];
  const newChildren = vnode.children || [];

  if (oldChildren.length > 0 && newChildren.length > 0) {
    // diff
    updateChildren(el, oldChildren, newChildren);
  } else if (newChildren.length > 0) {
    // 新的有子节点
    mountChildren(el, newChildren);
  } else if (oldChildren.length > 0) {
    el.innerHTML = '';
  }
}

function mountChildren (el, children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    el.appendChild(createElm(child));
  }
}

function createKeyToOldIdx (oldCh, startIdx, endIdx) {
  const map = {};
  for (let i = startIdx; i <= endIdx; i++) {
    // TODO: 源码中兼容了没有key的情况
    map[oldCh[i].key] = i;
  } 
  return map;
}

function updateChildren (el, oldChildren, newChildren) {
  // 双指针比较
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  // 映射表
  let mapKeyToOldIdx;

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      // 旧头 新头
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // 旧尾 新尾
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // 旧头 新尾
      patchVnode(oldStartVnode, newEndVnode);
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // 旧尾 新头
      patchVnode(oldEndVnode, newStartVnode);
      // 移动
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else {
      // 循环对比

      // 用到的时候再创建，最大限度节省空间和时间，减少循环
      if (!mapKeyToOldIdx) mapKeyToOldIdx = createKeyToOldIdx(oldChildren, oldStartIndex, oldEndIndex);

      // TODO: 源码还对没有key的元素做了兼容
      const oldElmIdx = mapKeyToOldIdx[newStartVnode.key];
      if (oldElmIdx) {
        const oldElm = oldChildren[oldElmIdx];
        if (sameVnode(oldElm, newStartVnode)) {
          patchVnode(oldElm, newStartVnode);
          el.insertBefore(oldElm.el, oldStartVnode.el);
          oldChildren[oldElmIdx] = undefined; // 表示这个节点已经被移动
        } else {
          // key 相同，但是元素类型不同，视为新节点
          const newElm = createElm(newStartVnode);
          el.insertBefore(newElm, oldStartVnode.el);
        }
      } else {
        const newElm = createElm(newStartVnode);
        el.insertBefore(newElm, oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }

  if (oldStartIndex > oldEndIndex) {
    // 老的先越界，说明新的多，剩下的都要插入
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      const curChild = createElm(newChildren[i]);
      const nextChild = newChildren[i + 1] ? newChildren[i + 1].el : null;
      // 插入的时候 要插入在已处理的节点之前
      el.insertBefore(curChild, nextChild); // nextChild 为 null 时，相当于 appendChild
    }
  } else if (newStartIndex > newEndIndex) {
    // 新的先越界，说明老的多，剩下的都不要
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      const childEl = oldChildren[i].el;
      el.removeChild(childEl);
    }
  }


}