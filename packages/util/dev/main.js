import util from './../src/default';

const html = `
<style>
.btn-box {
  margin: 10px 0;
}
.btn {
  line-height: 1.5715;
  position: relative;
  display: inline-block;
  font-weight: 400;
  white-space: nowrap;
  text-align: center;
  background-image: none;
  border: 1px solid transparent;
  box-shadow: 0 2px #00000004;
  cursor: pointer;
  user-select: none;
  height: 32px;
  padding: 4px 15px;
  font-size: 14px;
  border-radius: 2px;
  color: #000000d9;
  background: #fff;
  border-color: #d9d9d9;
}
.btn-primary {
  color: #fff;
  background: #1890ff;
  border-color: #1890ff;
  text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
  box-shadow: 0 2px #0000000b;
}
</style>
<div>
  <div class="btn-box">
    <button class="btn">
      <span> Hello&nbsp;Button</span>
    </button>
  </div>
  <div class="btn-box">
    <button class="btn btn-primary">
      <span>Button Primary</span>
    </button> 
  </div>
</div>
`;

util.loadHTML(html, {
  height: 100,
  width: 200
}).then((img) => {
  document.querySelector('body').appendChild(img)
}).catch(err => {
  console.log(err);
})

