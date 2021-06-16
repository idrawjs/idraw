
function number(value: any) {
  return (typeof value === 'number' && (value > 0 || value <= 0))
}

function x(value: any) {
  return number(value);
}

function y(value: any) {
  return number(value);
}

function w(value: any) {
  return (typeof value === 'number' && value >= 0)
}

function h(value: any) {
  return (typeof value === 'number' && value >= 0)
}

function angle(value: any) {
  return (typeof value === 'number' && value >= -360 && value <= 360)
}

const is = {
  x, y, w, h, angle, number,
}

export default is;