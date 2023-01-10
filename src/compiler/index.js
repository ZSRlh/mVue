import { AST_NODE_TYPE } from "../constants";
import { parseHTML } from "./parse";
import { parseText } from "./text-paser";

/**
 * 生成_c函数的属性参数
 * @param {Array} attrs 
 * @returns 属性字符串
 */
function genProps (attrs) {
  let str = '' // { name, value }
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    // TODO: 为啥专门处理
    if (attr.name === 'style') {
      const obj = {};
      attr.value.split(';').filter(item => {
        return item && item.trim();
      }).forEach(item => {
        const [key, value] = item.trim().split(':');
        obj[key.trim()] = value.trim();
        attr.value = obj;
      })
    }
    str += `${attr.name}: ${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

/**
 * 生成_c函数的子元素参数
 * @param {Array} children 
 * @returns 子元素字符串
 */
function genChildren (children) {
  return children.map(child => {
    if (child.type === AST_NODE_TYPE.ELEMENT_TYPE) {
      // 节点
      return codegen(child);
    } else if (child.type === AST_NODE_TYPE.TEXT_TYPE) {
      // 文本
      return parseText(child.text);
    }
    return '';
  }).join(',');
}

function codegen(ast) {
  // _c(tag, attrs, children)
  let code = `_c(
    ${ast.tag ? `'${ast.tag}'` : 'null'},
    ${ast.attrs ? genProps(ast.attrs) : 'null'},
    ${ast.children ? genChildren(ast.children) : 'null'}
  )`;
  return code;
}

export function compileToFunction (template) {
  const ast = parseHTML(template);
  const code = codegen(ast);
  /**
   * 模版引擎的实现原理: with + new Function
   */
  let render = new Function(`with(this){return ${code}}`);
  return render;
}