export const Observer = (function() {
  let clientList = <any>{};
  const $remove = function(key: string, fn?: any | undefined) {
    let fns = clientList[key];
    // key对应的消息么有被人订阅
    if (!fns) {
      return false;
    }
    // 没有传入fn(具体的回调函数), 表示取消key对应的所有订阅
    if (!fn) {
      fns && (fns.length = 0);
    } else {
      // 反向遍历
      for (let i = fns.length - 1; i >= 0; i--) {
        let _fn = fns[i];
        if (_fn === fn) {
          // 删除订阅回调函数
          fns.splice(i, 1);
        }
      }
    }
  };
  const $on = function(key: string, fn: Function) {
    if (!clientList[key]) {
      clientList[key] = [];
    }
    clientList[key].push(fn);
  };
  const $emit = function(...args: Array<any>) {
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
    $on,
    $emit,
    $remove
  };
})();
