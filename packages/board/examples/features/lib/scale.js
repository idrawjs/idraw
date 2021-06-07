const input = document.querySelector('#scale');
let hasInited = false;

export function doScale(board, scale) {
  if (hasInited === true)  return;
  if (!input) {
    return;
  }
  if (scale > 0) {
    input.value = scale;
    const screen = board.scale(scale);
    console.log('scale: screen =', screen);
    board.draw();
  }
  input.addEventListener('change', () => {
    const val = input.value * 1;
    if (val > 0) {
      const screen = board.scale(val);
      console.log('scale: screen =', screen);
      board.draw();
    }
  });
  hasInited = true;
}

export function getScale() {
  if (!input) {
    return;
  }
  let val = 1;
  if (input.value * 1 > 0) {
    val = input.value * 1;
  }
  return val;
}