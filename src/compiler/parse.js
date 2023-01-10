import { AST_NODE_TYPE } from '../constants';

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;

/**
 * 匹配开始标签名: <div> | <namespace:xxx>
 * '<div></div>'.match(startTagOpen) // ['<div','div',index:0,input:'<div></div>']
 */
const startTagOpen = new RegExp(`^<${qnameCapture}`);

/**
 * 匹配结束标签名
 * </div>'.match(endTag)  // ["</div>", "div", index: 0, input: "</div>", groups: undefined]
 */
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

/**
 * 匹配属性
 * 'class="a" id="b"></div>'.match(attribute) // ["class="a"", "class", "=", "a", undefined, undefined, index: 0, input: "class="a" id="b"></div>", groups: undefined]
 * 属性值使用双引号、单引号、不使用引号在匹配结果中的索引不同
 * - 双引号：索引3
 * - 单引号：索引4
 * - 不使用引号：索引5
 */
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

/**
 * 是否自闭和
 * '></div>'.match(startTagClose) // [">", "", index: 0, input: "></div>", groups: undefined]
 * '/>'.match(startTagClose) // ["/>", "/", index: 0, input: "/><div></div>", groups: undefined]
 */
const startTagClose = /^\s*(\/?)>/;

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const doctype = /^<!DOCTYPE [^>]+>/i;
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;

/**
 * 解析模版
 */
export function parseHTML (html) {

  const stack = [];
  let currentParent;  // 指向栈中的最后一个
  let root;

  function createASTElement (tag, attrs) {
    return {
      tag,
      type: AST_NODE_TYPE.ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    }
  }

  /**
   * 移动解析指针
   * @param {number} n 
   */
  function advance (n) {
    html = html.substring(n);
  }

  function parseStartTag () {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      }
      advance(start[0].length);
      
      let attr;
      let end;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        })
        advance(attr[0].length);
      }

      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
      }
      return match;
    }
  }

  function start (tagName, attrs) {
    let node = createASTElement(tagName, attrs);
    if (!root) {
      root = node;
    }
    if (currentParent) {
      node.parent = currentParent;
      currentParent.children.push(node);
    }
    stack.push(node);
    currentParent = node;
  }

  function end (tagName) {
    let node = stack.pop();

    currentParent = stack[stack.length - 1];
  }

  function chars (text) {
    currentParent.children.push({
      type: AST_NODE_TYPE.TEXT_TYPE,
      text,
      parent: currentParent,
    })

  }

  while (html) {
    // 如果为0 说明是一个开始标签或结束标签，大于0 说明是文本的结束位置
    let textEnd = html.indexOf('<');

    if (textEnd === 0) {
      // 开始标签
      const startTagMatch = parseStartTag(html);
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }

      // 结束标签
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch.tagName);
        continue;
      }
    }

    if (textEnd >= 0) {
      // 文本
      let text = html.substring(0, textEnd);
      if (text) {
        advance(text.length);
        chars(text);
      }
    }
  }

  return root;
}
