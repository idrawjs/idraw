const inputX = document.querySelector('#scrollX');
const inputY = document.querySelector('#scrollY');
let hasInited = false;

export function doScroll(board, conf = {}) {
  if (hasInited === true)  return;
  if (!(inputX && inputY)) {
    return;
  }
  
  if (conf.scrollX >= 0) {
    inputX.value = conf.scrollX;
    board.scrollX(conf.scrollX);
    board.draw();
  }

  if (conf.scrollY >= 0) {
    inputY.value = conf.scrollY;
    board.scrollY(conf.scrollY);
    board.draw();
  }

  inputX.addEventListener('change', () => {
    const val = inputX.value * 1;
    if (val >= 0) {
      board.scrollX(val);
      board.draw();
    }
  });
  inputY.addEventListener('change', () => {
    const val = inputY.value * 1;
    if (val >= 0) {
      board.scrollY(val);
      board.draw();
    }
  });
  hasInited = true;
}