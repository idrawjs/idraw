import iDraw from 'idraw';
import { useEffect, useRef } from 'react';

function Demo() {
  const ref = useRef(null);
  useEffect(() => {
    const idraw = new iDraw(ref.current, {
      width: 600,
      height: 400,
      contextWidth: 600,
      contextHeight: 400,
      devicePixelRatio: 1,
    });
    idraw.addElement({
      name: "rect-001",
      x: 140,
      y: 120,
      w: 200,
      h: 100,
      type: "rect",
      desc: {
        bgColor: "#f7d3c1",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#ff6032",
      },
    })
  }, []);

  return (
    <div ref={ref}></div>
  )
}