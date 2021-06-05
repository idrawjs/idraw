
const undo = document.querySelector('#elem-undo');

let hasInited = false;

export function doAction(idraw) {
  if (hasInited === true)  return;
  if (!undo) return;
  undo.addEventListener('click', () => {
    idraw.undo();
  })
}
