
const undo = document.querySelector('#elem-undo');
const redo = document.querySelector('#elem-redo');
let hasInited = false;

export function doAction(idraw) {
  if (hasInited === true)  return;
  if (undo) {
    undo.addEventListener('click', () => {
      const result = idraw.undo();
      console.log('undo: ', result);
    })
  }
 
  if (redo) {
    redo.addEventListener('click', () => {
      const result = idraw.redo();
      console.log('redo: ', result);
    })
  }

  hasInited = true;
}
