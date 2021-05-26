const input = document.querySelector('#scale');
let hasInited = false;

export function doScale(core, scale) {
  if (hasInited === true)  return;
  if (scale > 0) {
    input.value = scale;
    core.scale(scale);
    core.draw();
  }
  input.addEventListener('change', () => {
    const val = input.value * 1;
    if (val > 0) {
      core.scale(val);
      core.draw();
    }
  });
  hasInited = true;
}

export function getScale() {
  let val = 1;
  if (input.value * 1 > 0) {
    val = input.value * 1;
  }
  return val;
}