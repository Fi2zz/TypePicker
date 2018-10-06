/**
 *
 * @type {{subscribe: (key: string, fn: Function) => void; publish: (...args: any[]) => boolean}}
 */
const Observer = (function() {
  const clientList = <any>{};
  /**
   *
   * @param {string} key
   * @param {Function} fn
   */
  const subscribe = function(key: string, fn: Function) {
    if (!clientList[key]) {
      clientList[key] = [];
    }
    clientList[key].push(fn);
  };
  /**
   *
   * @param args
   * @returns {boolean}
   */
  const publish = function(...args: Array<any>) {
    let key = [].shift.call(args);
    let fns = clientList[key];
    if (!fns || fns.length === 0) {
      return false;
    }
    for (let i = 0, fn; (fn = fns[i++]); ) {
      fn.apply(this, args);
    }
  };
  return {
    subscribe,
    publish
  };
})();

/**
 *
 * @param {string} event
 * @param value
 * @returns {boolean}
 */
export const publish = (event: string, value: any) =>
  Observer.publish(event, value);
/**
 *
 * @type {(key: string, fn: Function) => void}
 */
export const subscribe = Observer.subscribe;
