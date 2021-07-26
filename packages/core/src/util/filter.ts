
export function filterScript(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/ig, '');
}