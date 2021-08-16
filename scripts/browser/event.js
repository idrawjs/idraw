function mouseDown(opts){
  const { x,y } = opts;
  const event = new MouseEvent('mousedown', {
    screenX: x,
    screenY: y,
    clientX: x,
    clientY: y,
  });
  const elem = document.elementFromPoint(x,y);
  elem.dispatchEvent(event);
}


function mouseMove(opts){
  const { x,y } = opts;
  const event = new MouseEvent('mousemove', {
    screenX: x,
    screenY: y,
    clientX: x,
    clientY: y,
  });
  const elem = document.elementFromPoint(x,y);
  elem.dispatchEvent(event);
}


// function mouseOver(opts){
//   const { x,y } = opts;
//   const event = new MouseEvent('mouseover', {
//     screenX: x,
//     screenY: y,
//     clientX: x,
//     clientY: y,
//   });
//   const elem = document.elementFromPoint(x,y);
//   elem.dispatchEvent(event);
// }


function mouseUp(opts){
  const { x,y } = opts;
  const event = new MouseEvent('mouseup', {
    screenX: x,
    screenY: y,
    clientX: x,
    clientY: y,
  });
  const elem = document.elementFromPoint(x,y);
  elem.dispatchEvent(event);
}


function wheelX(x, opts = { clientX: 0, clientY: 0 }){
  const event = new WheelEvent('wheel', {
    deltaX: x,
    deltaY: 0,
    clientX: opts.clientX || 0,
    clientY: opts.clientY || 0
  });
  const elem = document.elementFromPoint(opts.clientX, opts.clientY);
  elem.dispatchEvent(event);
}

function wheelY(y, opts = { clientX: 0, clientY: 0 }){
  const event = new WheelEvent('wheel', {
    deltaX: 0,
    deltaY: y,
    clientX: opts.clientX || 0,
    clientY: opts.clientY || 0
  });
  const elem = document.elementFromPoint(opts.clientX, opts.clientY);
  elem.dispatchEvent(event);
}


export default {
  mouseDown,
  mouseUp,
  mouseMove,
  // mouseOver,
  wheelX,
  wheelY,
}