const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

export function parseText (text) {
  if (!defaultTagRE.test(text)) {
    // 纯文本
    return `_v(${JSON.stringify(text)})`;
  } else {
    // 含有变量的文本
    let tokens = [];
    let match;
    let lastIndex = 0;
    defaultTagRE.lastIndex = 0;

    while (match = defaultTagRE.exec(text)) {
      let index = match.index;
      if (index > lastIndex) {
        // 匹配的变量标识前面还有纯文本
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      tokens.push(`_s(${match[1].trim()})`);
      lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }

    return `_v(${tokens.join('+')})`;
  }
}