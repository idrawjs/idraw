const inputX = document.querySelector('#scrollX');
const inputY = document.querySelector('#scrollY');
let hasInited = false;

export function doScroll(core, conf = {}) {
  if (hasInited === true) return;
  if (!(inputY && inputX)) return;
  
  if (conf.scrollX >= 0) {
    inputX.value = conf.scrollX;
    core.scrollX(conf.scrollX);
  }

  if (conf.scrollY >= 0) {
    inputY.value = conf.scrollY;
    core.scrollY(conf.scrollY);
  }

  inputX.addEventListener('change', () => {
    const val = inputX.value * 1;
    if (val >= 0 || val < 0) {
      core.scrollX(val);
    }
  });
  inputY.addEventListener('change', () => {
    const val = inputY.value * 1;
    if (val >= 0 || val < 0) {
      core.scrollY(val);
    }
  });
  hasInited = true;
}