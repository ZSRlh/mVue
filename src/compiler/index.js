import { parseHTML } from "./parse";

export function compileToFunction (template) {
  let ast = parseHTML(template);
  console.log('ast', ast)
}