const data = {
  // bgColor: '#ffffff',
  elements: [
    {
      name: "html-001",
      x: 40,
      y: 40,
      w: 200,
      h: 70,
      type: "html",
      angle: 0,
      desc: {
        html: `
        <div style="font-size: 20px;color: #666666">
          <span>Hello World!</span>
        </div>
        <script>
        window.alert('Hello World')
        console.log('Hello World')
        </script>
        <div style="font-size: 30px; font-weight: bold; color: #666666">
          <span>Hello World!</span>
        </div>
        `,
      },
    },

    {
      name: "html-001",
      x: 200,
      y: 120,
      w: 240,
      h: 240,
      type: "html",
      angle: 0,
      desc: {
        width: 120,
        height: 80,
        html: `
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
          <div class="btn-box" style="margin-top: 0;">
            <button class="btn" >
              <span>Button</span>
            </button>
          </div>

          <div class="btn-box">
            <button class="btn btn-primary">
              <span>Button Primary</span>
            </button> 
          </div>
        </div>
        `,
      },
    },
  ],
};

export default data;
