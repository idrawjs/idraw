const input = document.querySelector('#scale');
let hasInited = false;

export function doScale(idraw, scale) {
  if (hasInited === true)  return;
  if (!input) return;
  if (scale > 0) {
    input.value = scale;
    const screen = idraw.scale(scale);
    console.log('scale: screen = ', screen);
  }
  input.addEventListener('change', () => {
    const val = input.value * 1;
    if (val > 0) {
      const screen = idraw.scale(val);
      console.log('scale: screen = ', screen);
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