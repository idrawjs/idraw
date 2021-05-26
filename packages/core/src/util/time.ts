
export function compose (middleware: Function[]) {
  return function (context: any, next?: Function) {
    // let index = -1;
    return dispatch(0);

    function dispatch (i: number): Promise<any> {
      // index = i
      let fn = middleware[i]
      if (i === middleware.length && next) {
        fn = next;
      }
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}


export function delay(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  })
}

export function throttle(fn: Function, timeout: number) {
  let timer: any = -1;
  return function(...args: any[]) {
    if (timer > 0) {
      return;
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = -1;
    }, timeout)
  }
}

