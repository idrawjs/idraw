// import {  } from './'

export function clone (data: any): any {
  if (Object.prototype.toString.call(data)) 
  // TODO
  return JSON.parse(JSON.stringify(data));
}