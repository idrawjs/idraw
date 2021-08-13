function mouseDown(x,y){
  const event = new MouseEvent('mousedown', {
    screenX: x,
    screenY: y,
    clientX: x,
    clientY: y,
  });
  const elem = document.elementFromPoint(x,y);
  elem.dispatchEvent(event);
}


function mouseUp(x,y){
  const event = new MouseEvent('mouseup', {
    screenX: x,
    screenY: y,
    clientX: x,
    clientY: y,
  });
  const elem = document.elementFromPoint(x,y);
  elem.dispatchEvent(event);
}
