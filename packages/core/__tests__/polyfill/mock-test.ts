// https://stackoverflow.com/questions/61593774/how-do-i-test-code-that-uses-requestanimationframe-in-jest

import { requestAnimationFrameMock } from "./requestanimateframe";

describe("mock_requestAnimationFrame", () => {
  beforeEach(() => {
    requestAnimationFrameMock.reset();
  })
  test("reqest -> trigger", () => {
    const order: any = [];
    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([]);

    requestAnimationFrame(t => order.push(1));

    expect(requestAnimationFrameMock.queue.size).toBe(1);
    expect(order).toEqual([]);

    requestAnimationFrameMock.triggerNextAnimationFrame();

    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([1]);
  });

  test("reqest -> request -> trigger -> trigger", () => {
    const order: any = [];
    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([]);

    requestAnimationFrame(t => order.push(1));
    requestAnimationFrame(t => order.push(2));

    expect(requestAnimationFrameMock.queue.size).toBe(2);
    expect(order).toEqual([]);

    requestAnimationFrameMock.triggerNextAnimationFrame();

    expect(requestAnimationFrameMock.queue.size).toBe(1);
    expect(order).toEqual([1]);

    requestAnimationFrameMock.triggerNextAnimationFrame();

    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([1, 2]);
  });

  test("reqest -> cancel", () => {
    const order: any = [];
    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([]);

    const handle = requestAnimationFrame(t => order.push(1));

    expect(requestAnimationFrameMock.queue.size).toBe(1);
    expect(order).toEqual([]);

    cancelAnimationFrame(handle);

    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([]);
  });

  test("reqest -> request -> cancel(1) -> trigger", () => {
    const order: any = [];
    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([]);

    const handle = requestAnimationFrame(t => order.push(1));
    requestAnimationFrame(t => order.push(2));

    expect(requestAnimationFrameMock.queue.size).toBe(2);
    expect(order).toEqual([]);

    cancelAnimationFrame(handle);

    expect(requestAnimationFrameMock.queue.size).toBe(1);
    expect(order).toEqual([]);

    requestAnimationFrameMock.triggerNextAnimationFrame();

    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([2]);
  });

  test("reqest -> request -> cancel(2) -> trigger", () => {
    const order: any = [];
    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([]);

    requestAnimationFrame(t => order.push(1));
    const handle = requestAnimationFrame(t => order.push(2));

    expect(requestAnimationFrameMock.queue.size).toBe(2);
    expect(order).toEqual([]);

    cancelAnimationFrame(handle);

    expect(requestAnimationFrameMock.queue.size).toBe(1);
    expect(order).toEqual([]);

    requestAnimationFrameMock.triggerNextAnimationFrame();

    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([1]);
  });

  test("triggerAllAnimationFrames", () => {
    const order: any = [];
    expect(requestAnimationFrameMock.queue.size).toBe(0);
    expect(order).toEqual([]);

    requestAnimationFrame(t => order.push(1));
    requestAnimationFrame(t => order.push(2));

    requestAnimationFrameMock.triggerAllAnimationFrames();

    expect(order).toEqual([1,2]);

  });

  test("does not fail if triggerNextAnimationFrame() is called with an empty queue.", () => {
    requestAnimationFrameMock.triggerNextAnimationFrame();
  })
});