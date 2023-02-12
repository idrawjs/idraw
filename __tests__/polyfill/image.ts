/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
window.Image = class {
  constructor() {
    setTimeout(() => {
      // @ts-ignore
      if (typeof this.onload === 'function') {
        // @ts-ignore
        this.onload();
      }
    }, 50);
  }
};
