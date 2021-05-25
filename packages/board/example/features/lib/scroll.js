const inputX = document.querySelector('#scrollX');
const inputY = document.querySelector('#scrollY');
let hasInited = false;

export function doScroll(board) {
  if (hasInited === true)  return;
  inputX.addEventListener('change', () => {
    const val = inputX.value * 1;
    if (val > 0) {
      board.scrollX(val);
      board.draw();
    }
  });
  inputY.addEventListener('change', () => {
    const val = inputY.value * 1;
    if (val > 0) {
      board.scrollY(val);
      board.draw();
    }
  });
  hasInited = true;
}