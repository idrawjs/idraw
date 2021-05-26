const inputX = document.querySelector('#scrollX');
const inputY = document.querySelector('#scrollY');
let hasInited = false;

export function doScroll(core, conf = {}) {
  if (hasInited === true)  return;
  
  if (conf.scrollX >= 0) {
    inputX.value = conf.scrollX;
    core.scrollX(conf.scrollX);
    core.draw();
  }

  if (conf.scrollY >= 0) {
    inputY.value = conf.scrollY;
    core.scrollY(conf.scrollY);
    core.draw();
  }

  inputX.addEventListener('change', () => {
    const val = inputX.value * 1;
    if (val >= 0) {
      core.scrollX(val);
      core.draw();
    }
  });
  inputY.addEventListener('change', () => {
    const val = inputY.value * 1;
    if (val >= 0) {
      core.scrollY(val);
      core.draw();
    }
  });
  hasInited = true;
}