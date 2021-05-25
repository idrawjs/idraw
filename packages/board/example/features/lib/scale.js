const input = document.querySelector('#scale');
let hasInited = false;

export function doScale(board) {
  if (hasInited === true)  return;
  input.addEventListener('change', () => {
    const val = input.value * 1;
    if (val > 0) {
      board.scale(val);
      board.draw();
    }
  });
  hasInited = true;
}