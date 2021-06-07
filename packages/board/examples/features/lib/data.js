
const data = {
  elements: [
    {
      x: 10,
      y: 10,
      w: 200,
      h: 120,
      type: 'rect',
      desc: {
        color: '#f0f0f0',
      }
    },
    {
      x: 80,
      y: 80,
      w: 200,
      h: 120,
      type: 'rect',
      desc: {
        color: '#cccccc',
      }
    },
    {
      x: 160,
      y: 160,
      w: 200,
      h: 120,
      type: 'rect',
      desc: {
        color: '#c0c0c0',
      }
    },
    {
      x: 400 - 10,
      y: 300 - 10,
      w: 200,
      h: 100,
      type: 'rect',
      desc: {
        color: '#e0e0e0',
      }
    },
    {
      x: 300 - 10,
      y: 200 - 10,
      w: 20,
      h: 20,
      type: 'rect',
      desc: {
        color: '#000000',
      }
    }
  ]
}

function getData() {
  return data;
}

export {
  getData
};