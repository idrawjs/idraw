export function getData() {
  const data = {
    elements: [
      {
        x: 10,
        y: 10,
        w: 200,
        h: 120,
        type: 'rect',
        detail: {
          color: '#f0f0f0'
        }
      },
      {
        x: 80,
        y: 80,
        w: 200,
        h: 120,
        type: 'rect',
        detail: {
          color: '#cccccc'
        }
      },
      {
        x: 160,
        y: 160,
        w: 200,
        h: 120,
        type: 'rect',
        detail: {
          color: '#c0c0c0'
        }
      },
      {
        x: 400 - 10,
        y: 300 - 10,
        w: 200,
        h: 100,
        type: 'rect',
        detail: {
          color: '#e0e0e0'
        }
      }
    ]
  };
  return data;
}
