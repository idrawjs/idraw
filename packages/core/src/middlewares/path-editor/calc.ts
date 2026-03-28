/**
 * Get the "visible" bounding box of an SVG path element (including stroke, linecap, and linejoin effects).
 * Returns the bbox in the SVG user coordinate system (x, y, width, height).
 *
 * Compatibility strategy:
 * 1) Try SVG2: getBBox({ stroke: true, fill: false, markers: false, clipped: true })
 * 2) Fallback: use getBoundingClientRect() (bounding box in screen coordinates) + getScreenCTM() inverse transform back to SVG user coordinates
 *
 * Notes:
 * - This method is practical for "visible geometry", automatically accounting for miter/round/bevel joins,
 *   butt/round/square caps, and stroke-width effects.
 * - If the element has filters, shadows, glows, etc., the visual bounding box will be enlarged by them;
 *   this function will include them as well (since they affect the visual footprint).
 * - If you only want the geometric path without stroke, use path.getBBox() (old version without parameters).
 */
export function calcVisibleBBoxOfPath(path: SVGPathElement) {
  const svg = path.ownerSVGElement;
  if (!svg) {
    throw new Error('The path is not inside an <svg> element.');
  }

  // 1) SVG2: Some browsers implement getBBox with options
  try {
    const fancyBBox = path.getBBox({ stroke: true, fill: false, markers: true, clipped: true });
    if (fancyBBox && Number.isFinite(fancyBBox.width) && Number.isFinite(fancyBBox.height)) {
      return {
        x: fancyBBox.x,
        y: fancyBBox.y,
        width: fancyBBox.width,
        height: fancyBBox.height,
      };
    }
  } catch {
    // Ignore and fall back
  }

  // 2) Fallback: use visible bounding box in screen coordinates and transform to SVG user coordinates
  const ctm = svg.getScreenCTM();
  if (!ctm) throw new Error('Failed to get screen CTM from the <svg>.');

  const inv = ctm.inverse(); // Screen coordinates → SVG user coordinates

  // Visible bounding box in screen coordinates (usually includes stroke, linecap, linejoin effects)
  const rect = path.getBoundingClientRect();

  // Convert the four rectangle corners from screen coordinates to SVG user coordinates
  const corners = [
    { x: rect.left, y: rect.top },
    { x: rect.right, y: rect.top },
    { x: rect.right, y: rect.bottom },
    { x: rect.left, y: rect.bottom },
  ];

  const svgPoint = svg.createSVGPoint();
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const c of corners) {
    svgPoint.x = c.x;
    svgPoint.y = c.y;
    // Transform screen → user coordinates
    const p = svgPoint.matrixTransform(inv);
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
