const inputX = document.querySelector('#scrollLeft');
const inputY = document.querySelector('#scrollTop');
let hasInited = false;

export function doScroll(core, conf = {}) {
  if (hasInited === true) return;
  if (!(inputY && inputX)) return;
  
  if (conf.scrollLeft >= 0) {
    inputX.value = conf.scrollLeft;
    core.scrollLeft(conf.scrollLeft);
  }

  if (conf.scrollTop >= 0) {
    inputY.value = conf.scrollTop;
    core.scrollTop(conf.scrollTop);
  }

  inputX.addEventListener('change', () => {
    const val = inputX.value * 1;
    if (val >= 0 || val < 0) {
      core.scrollLeft(val);
      console.log(core.getScreenTransform());
    }
  });
  inputY.addEventListener('change', () => {
    const val = inputY.value * 1;
    if (val >= 0 || val < 0) {
      core.scrollTop(val);
      console.log(core.getScreenTransform());
    }
  });
  hasInited = true;
}