const data = {
  // bgColor: '#f0f0f0',
  elements: [
    {
      name: "rect-001",
      x: 10,
      y: 10,
      w: 200,
      h: 100,
      type: "rect",
      desc: {
        bgColor: "#f0f0f0",
        borderRadius: 20,
        borderWidth: 10,
        borderColor: "#bd0b64",
      },
    },
    {
      name: "rect-002",
      x: 80,
      y: 80,
      w: 200,
      h: 120,
      // angle: 30,
      type: "rect",
      operation: {
        lock: true,
      },
      desc: {
        bgColor: "#cccccc",
        borderRadius: 60,
        borderWidth: 10,
        borderColor: "#bd0b64",
      },
    },
    {
      name: "rect-003",
      x: 160,
      y: 160,
      w: 200,
      h: 20,
      type: "rect",
      angle: 45,
      desc: {
        bgColor: "#c0c0c0",
        borderRadius: 20,
        borderWidth: 10,
        borderColor: "#bd0b64",
      },
    },
    {
      name: "rect-004",
      x: 400 - 10,
      y: 300 - 10,
      w: 200,
      h: 100,
      type: "rect",
      desc: {
        bgColor: "#e0e0e0",
        borderRadius: 20,
        borderWidth: 10,
        borderColor: "#bd0b64",
      },
    },
  ],
};

export default data;
