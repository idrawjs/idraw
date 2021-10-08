import {
  delay, throttle, compose,
} from '../../src/lib/time';


describe('@idraw/util: lib/delay', () => {

  test('delay', async () => { 
    const start = Date.now();
    const time = 1000;
    await delay(time);
    const count = Date.now() - start;
    expect(count >= time).toStrictEqual(true);
  });
  
  test('throttle', async () => { 
    let count = 0;
    function doThrottle() {
      return new Promise((resolve) => {
        const func = throttle(function() {
          count ++;
        }, 100);
        let interval = setInterval(() => {
          if (count >= 5) {
            clearInterval(interval);
            resolve(null)
          }
          func();
        }, 5);
      })
    }
    await doThrottle();
    expect(count).toStrictEqual(5);
  });
  

  test('compose', async () => { 
    let middleware = [];
    let context = {
      data: []
    };

    middleware.push(async(ctx: any, next: any) => {
      ctx.data.push(1);
      await next();
      ctx.data.push(6);
    });

    middleware.push(async(ctx: any, next: any) => {
      ctx.data.push(2);
      await next();
      ctx.data.push(5);
    });

    middleware.push(async(ctx: any, next: any) => {
      ctx.data.push(3);
      await next();
      ctx.data.push(4);
    });

    const fn = compose(middleware);

    await fn(context);
    expect(context).toStrictEqual({data: [1, 2, 3, 4, 5, 6]});
  });

});

