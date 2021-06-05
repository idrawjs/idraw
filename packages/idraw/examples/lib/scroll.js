const inputX = document.querySelector('#scrollX');
const inputY = document.querySelector('#scrollY');
let hasInited = false;

export function doScroll(idraw, conf = {}) {
  if (hasInited === true) return;
  if (!(inputY && inputX)) return;
  
  if (conf.scrollX >= 0) {
    inputX.value = conf.scrollX;
    idraw.scrollX(conf.scrollX);
    idraw.draw();
  }

  if (conf.scrollY >= 0) {
    inputY.value = conf.scrollY;
    idraw.scrollY(conf.scrollY);
    idraw.draw();
  }

  inputX.addEventListener('change', () => {
    const val = inputX.value * 1;
    if (val >= 0) {
      idraw.scrollX(val);
      idraw.draw();
    }
  });
  inputY.addEventListener('change', () => {
    const val = inputY.value * 1;
    if (val >= 0) {
      idraw.scrollY(val);
      idraw.draw();
    }
  });
  hasInited = true;
}