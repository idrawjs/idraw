const input = document.querySelector('#scale');
let hasInited = false;

export function doScale(idraw, scale) {
  if (hasInited === true)  return;
  if (!input) return;
  if (scale > 0) {
    input.value = scale;
    idraw.scale(scale);
    idraw.draw();
  }
  input.addEventListener('change', () => {
    const val = input.value * 1;
    if (val > 0) {
      idraw.scale(val);
      idraw.draw();
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