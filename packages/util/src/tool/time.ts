type Middleware = (ctx: any, next: Middleware) => any;

export function compose(middleware: Middleware[]): (context: any, next?: Middleware) => any {
  return function (context: any, next?: Middleware) {
    // let index = -1;
    return dispatch(0);

    function dispatch(i: number): Promise<any> {
      // index = i
      let fn: Middleware = middleware[i];
      if (i === middleware.length && next) {
        fn = next;
      }
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

export function delay(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export function throttle(fn: (...args: any[]) => any, timeout: number): (...args: any[]) => any {
  let timer: any = -1;
  return function (...args: any[]) {
    if (timer >= 0) {
      return;
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = -1;
    }, timeout);
  };
}

export function debounce(fn: (...args: any[]) => any, timeout: number): (...args: any[]) => any {
  let timer: any = -1;
  return function (...args: any[]) {
    if (timer >= 0) {
      window.clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = -1;
    }, timeout);
  };
}
