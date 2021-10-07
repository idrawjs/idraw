import {
  parseHTMLToDataURL, parseSVGToDataURL
} from '../../src/lib/parser';


describe('@idraw/util: lib/parser', () => {

  test('parseHTMLToDataURL', async () => {
    const result = await parseHTMLToDataURL(`
    <style>
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
    </style>
    <button class="btn" >
      <span>Button</span>
    </button>
    `, {
      width: 120,
      height: 80,
    });
    expect(result).toStrictEqual(`data:image/svg+xml;charset=utf-8;base64,CiAgICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEyMCIgaGVpZ2h0ID0gIjgwIj4KICAgICAgPGZvcmVpZ25PYmplY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+CiAgICAgICAgPGRpdiB4bWxucyA9ICJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sIj4KICAgICAgICAgIAogICAgPHN0eWxlPgogICAgLmJ0biB7CiAgICAgIGxpbmUtaGVpZ2h0OiAxLjU3MTU7CiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsKICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrOwogICAgICBmb250LXdlaWdodDogNDAwOwogICAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7CiAgICAgIGJhY2tncm91bmQtaW1hZ2U6IG5vbmU7CiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50OwogICAgICBib3gtc2hhZG93OiAwIDJweCAjMDAwMDAwMDQ7CiAgICAgIGN1cnNvcjogcG9pbnRlcjsKICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7CiAgICAgIGhlaWdodDogMzJweDsKICAgICAgcGFkZGluZzogNHB4IDE1cHg7CiAgICAgIGZvbnQtc2l6ZTogMTRweDsKICAgICAgYm9yZGVyLXJhZGl1czogMnB4OwogICAgICBjb2xvcjogIzAwMDAwMGQ5OwogICAgICBiYWNrZ3JvdW5kOiAjZmZmOwogICAgICBib3JkZXItY29sb3I6ICNkOWQ5ZDk7CiAgICB9CiAgICA8L3N0eWxlPgogICAgPGJ1dHRvbiBjbGFzcz0iYnRuIiA+CiAgICAgIDxzcGFuPkJ1dHRvbjwvc3Bhbj4KICAgIDwvYnV0dG9uPgogICAgCiAgICAgICAgPC9kaXY+CiAgICAgIDwvZm9yZWlnbk9iamVjdD4KICAgIDwvc3ZnPgogICAg`);
  });


  test('parseSVGToDataURL', async () => {
    const result = await parseSVGToDataURL(`<svg t="1622524780663" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8365" width="200" height="200"><path d="M881 442.4H519.7v148.5h206.4c-8.9 48-35.9 88.6-76.6 115.8-34.4 23-78.3 36.6-129.9 36.6-99.9 0-184.4-67.5-214.6-158.2-7.6-23-12-47.6-12-72.9s4.4-49.9 12-72.9c30.3-90.6 114.8-158.1 214.7-158.1 56.3 0 106.8 19.4 146.6 57.4l110-110.1c-66.5-62-153.2-100-256.6-100-149.9 0-279.6 86-342.7 211.4-26 51.8-40.8 110.4-40.8 172.4S151 632.8 177 684.6C240.1 810 369.8 896 519.7 896c103.6 0 190.4-34.4 253.8-93 72.5-66.8 114.4-165.2 114.4-282.1 0-27.2-2.4-53.3-6.9-78.5z" p-id="8366" fill="#1296db"></path></svg>`);

    expect(result).toStrictEqual(`data:image/svg+xml;charset=utf-8;base64,PHN2ZyB0PSIxNjIyNTI0NzgwNjYzIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjgzNjUiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNODgxIDQ0Mi40SDUxOS43djE0OC41aDIwNi40Yy04LjkgNDgtMzUuOSA4OC42LTc2LjYgMTE1LjgtMzQuNCAyMy03OC4zIDM2LjYtMTI5LjkgMzYuNi05OS45IDAtMTg0LjQtNjcuNS0yMTQuNi0xNTguMi03LjYtMjMtMTItNDcuNi0xMi03Mi45czQuNC00OS45IDEyLTcyLjljMzAuMy05MC42IDExNC44LTE1OC4xIDIxNC43LTE1OC4xIDU2LjMgMCAxMDYuOCAxOS40IDE0Ni42IDU3LjRsMTEwLTExMC4xYy02Ni41LTYyLTE1My4yLTEwMC0yNTYuNi0xMDAtMTQ5LjkgMC0yNzkuNiA4Ni0zNDIuNyAyMTEuNC0yNiA1MS44LTQwLjggMTEwLjQtNDAuOCAxNzIuNFMxNTEgNjMyLjggMTc3IDY4NC42QzI0MC4xIDgxMCAzNjkuOCA4OTYgNTE5LjcgODk2YzEwMy42IDAgMTkwLjQtMzQuNCAyNTMuOC05MyA3Mi41LTY2LjggMTE0LjQtMTY1LjIgMTE0LjQtMjgyLjEgMC0yNy4yLTIuNC01My4zLTYuOS03OC41eiIgcC1pZD0iODM2NiIgZmlsbD0iIzEyOTZkYiI+PC9wYXRoPjwvc3ZnPg==`);
  });


});

