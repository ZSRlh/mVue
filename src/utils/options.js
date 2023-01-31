import { hasOwn } from ".";

const strats = Object.create(null);

const LIFECYCLE = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
];

LIFECYCLE.forEach(hook => {
  // strats[hook] = mergeHook;
  strats[hook] = function (p, c) {
    if (c) {
      if (p) {
        return p.concat(c);
      } else {
        return Array.isArray(c) ? c : [c];
      }
    } else {
      return p
    }
  }
})


const defaultStrat = (parent, child) => {
  return child === undefined ? parent : child;
}

export function mergeOptions (parent, child) {
  const options = {};
  
  for (let key in parent) {
    mergeField(key);
  }

  for (let key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key]);
  }
  return options;
}
