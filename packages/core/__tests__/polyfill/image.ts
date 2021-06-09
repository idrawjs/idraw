// @ts-ignore
window.Image = class {
  constructor() {
    setTimeout(() => {
      // @ts-ignore
      this.onload();
    }, 50);
  }
}