const input = document.querySelector('#scale');
let hasInited = false;

export function doScale(core, scale) {
  if (hasInited === true)  return;
  if (!input) return;
  if (scale > 0) {
    input.value = scale;
    core.scale(scale);
  }
  input.addEventListener('change', () => {
    const val = input.value * 1;
    if (val > 0) {
      core.scale(val);
      console.log(core.getScreenTransform());
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