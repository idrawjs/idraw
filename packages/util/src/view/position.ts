import type { ElementPosition } from '@idraw/types';

export function calcResultMovePosition(opts: { from: ElementPosition; to: ElementPosition }): {
  from: ElementPosition;
  to: ElementPosition;
} | null {
  const from = [...opts.from];
  const to = [...opts.to];

  // [] -> [1,2,3] or [1, 2 ,3] -> []
  if (from.length === 0 || to.length === 0) {
    return null;
  }

  // invalid [1] -> [1, 2, 3]
  if (from.length <= to.length) {
    for (let i = 0; i < from.length; i++) {
      if (to[i] === from[i]) {
        if (i === from.length - 1) {
          return null;
        }
        continue;
      }
    }
  }

  let moveDirection: 'up-down' | 'down-up' | null = null;

  if (from.length >= 1 && to.length >= 1) {
    // isEffectToIndex
    // false [2, 4] -> [1, 2]
    // false [3, 4, 5] -> [4, 5]

    // up -> down
    // true  [2] -> [4]
    // true  [2] -> [3, 4]
    // true  [2, 3] -> [2, 3, 4]
    if (from.length <= to.length) {
      if (from.length === 1) {
        if (from[0] < to[0]) {
          moveDirection = 'up-down';
        }
      } else {
        for (let i = 0; i < from.length; i++) {
          if (from[i] === to[i]) {
            if (from.length === from.length - 1) {
              moveDirection = 'up-down';
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    // down -> up
    // true  [4] -> [2]
    // true  [3, 4, 5] -> [3, 3]
    // true  [3, 4, 5] -> [2]
    if (from.length >= to.length) {
      if (to.length === 1) {
        if (to[0] < from[0]) {
          // isEffectToIndex = true;
          moveDirection = 'down-up';
        }
      } else {
        for (let i = 0; i < to.length; i++) {
          if (i === to.length - 1 && to[i] < from[i]) {
            // isEffectToIndex = true;
            moveDirection = 'down-up';
          }
          if (from[i] === to[i]) {
            continue;
          } else {
            break;
          }
        }
      }
    }
  }

  const startEffectIndex = from.length - 1;
  const endEffectIndex = to.length - 1;
  if (moveDirection === 'up-down' && startEffectIndex >= 0) {
    to[startEffectIndex] -= 1;
  } else if (moveDirection === 'down-up' && endEffectIndex >= 0) {
    from[endEffectIndex] += 1;
  }

  return { from, to };
}

export function calcRevertMovePosition(opts: { from: ElementPosition; to: ElementPosition }): {
  from: ElementPosition;
  to: ElementPosition;
} | null {
  const result = calcResultMovePosition(opts);
  if (!result) {
    return result;
  }
  return {
    from: [...result.to],
    to: [...result.from]
  };
}
