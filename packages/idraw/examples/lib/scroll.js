const inputX = document.querySelector('#scrollX');
const inputY = document.querySelector('#scrollY');
let hasInited = false;

export function doScroll(idraw, conf = {}) {
  if (hasInited === true) return;
  if (!(inputY && inputX)) return;
  
  if (conf.scrollX >= 0) {
    inputX.value = conf.scrollX;
    const screen = idraw.scrollX(conf.scrollX);
    console.log('scale: scrollX = ', screen);
  }

  if (conf.scrollY >= 0) {
    inputY.value = conf.scrollY;
    idraw.scrollY(conf.scrollY);
  }

  inputX.addEventListener('change', () => {
    const val = inputX.value * 1;
    if (val >= 0) {
      const screen = idraw.scrollX(val);
      console.log('scale: scrollX = ', screen);
    }
  });
  inputY.addEventListener('change', () => {
    const val = inputY.value * 1;
    if (val >= 0) {
      const screen = idraw.scrollY(val);
      console.log('scale: scrollY = ', screen);
    }
  });
  hasInited = true;
}