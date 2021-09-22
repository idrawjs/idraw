import { TypePoint } from '@idraw/types';
import { BoardEvent } from './../../src/lib/event';

describe('@idraw/board: src/lib/event', () => {

  // 'doubleClick': TypePoint;
  // 'hover': TypePoint;
  // 'leave': void;
  // 'point': TypePoint;
  // 'move': TypePoint;
  // 'moveStart': TypePoint;
  // 'moveEnd': TypePoint;
  // 'wheelX': number;
  // 'wheelY': number;

  test('BoardEvent event:off', async () => {
    const event = new BoardEvent();
    const point = { x: 123, y: 456 }
    const callback = (p: TypePoint) => {
      expect(p).toStrictEqual(point);
    }
    event.on('doubleClick', callback);
    event.trigger('doubleClick', point)
    event.off('doubleClick', callback);
  });

  test('BoardEvent event:doubleClick', async () => {
    const event = new BoardEvent();
    const point = { x: 123, y: 456 }
    event.on('doubleClick', (p) => {
      expect(p).toStrictEqual(point);
    });
    event.trigger('doubleClick', point)
  });

  test('BoardEvent event:hover', async () => {
    const event = new BoardEvent();
    const point = { x: 123, y: 456 }
    event.on('hover', (p) => {
      expect(p).toStrictEqual(point);
    });
    event.trigger('hover', point)
  });

  test('BoardEvent event:leave', async () => {
    const event = new BoardEvent();
    event.on('leave', (e) => {
      expect(e).toStrictEqual(undefined);
    });
    event.trigger('leave', undefined)
  });

  test('BoardEvent event:point', async () => {
    const event = new BoardEvent();
    const point = { x: 123, y: 456 }
    event.on('point', (p) => {
      expect(p).toStrictEqual(point);
    });
    event.trigger('point', point)
  });

  test('BoardEvent event:move', async () => {
    const event = new BoardEvent();
    const point = { x: 123, y: 456 }
    event.on('move', (p) => {
      expect(p).toStrictEqual(point);
    });
    event.trigger('move', point)
  });


  test('BoardEvent event:moveStart', async () => {
    const event = new BoardEvent();
    const point = { x: 123, y: 456 }
    event.on('moveStart', (p) => {
      expect(p).toStrictEqual(point);
    });
    event.trigger('moveStart', point)
  });

  test('BoardEvent event:moveEnd', async () => {
    const event = new BoardEvent();
    const point = { x: 123, y: 456 }
    event.on('moveEnd', (p) => {
      expect(p).toStrictEqual(point);
    });
    event.trigger('moveEnd', point)
  });

  test('BoardEvent event:wheelX', async () => {
    const event = new BoardEvent();
    const num = 123
    event.on('wheelX', (e) => {
      expect(e).toStrictEqual(num);
    });
    event.trigger('wheelX', num)
  });

  test('BoardEvent event:wheelY', async () => {
    const event = new BoardEvent();
    const num = 123
    event.on('wheelY', (e) => {
      expect(e).toStrictEqual(num);
    });
    event.trigger('wheelY', num)
  });

});