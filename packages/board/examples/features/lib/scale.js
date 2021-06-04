const input = document.querySelector('#scale');
let hasInited = false;

export function doScale(board, scale) {
  if (hasInited === true)  return;
  if (!input) {
    return;
  }
  if (scale > 0) {
    input.value = scale;
    board.scale(scale);
    board.draw();
  }
  input.addEventListener('change', () => {
    const val = input.value * 1;
    if (val > 0) {
      board.scale(val);
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