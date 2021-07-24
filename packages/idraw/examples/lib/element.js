
const dom = document.querySelector('#elem-list');

let hasInited = false;

export function doElemens(idraw) {
  if (hasInited === true)  return;
  if (!dom) return;
  renderElemens(idraw);
  listenElements(idraw);
}

function renderElemens(idraw) {
  const data = idraw.getData();
  const elems = data.elements;
  const items = [];
  for (let i = elems.length - 1; i >= 0; i --) {
    const ele = elems[i];
    items.push(`
    <div class="elem-item">
      <span class="elem-item-name" data-elem-name="${ele.uuid || ''}">${ele.name || 'Unnamed'}</span>
      <span class="elem-item-btn ${i === elems.length - 1 ? 'btn-hidden' : ''}" data-elem-btn-up="${ele.uuid || ''}">Up</span>
      <span class="elem-item-btn ${i === 0 ? 'btn-hidden' : ''} " data-elem-btn-down="${ele.uuid || ''}">Down</span>
    </div>
    `);
  }
  dom.innerHTML = items.join('');
}

function listenElements(idraw) {

  dom.addEventListener('click', (e) => {
    if (!e.path[0]) {
      return;
    }
    const el = e.path[0];
    if (el.hasAttribute('data-elem-name')) {
      const uuid = el.getAttribute('data-elem-name');
      idraw.selectElement(uuid);
    } else if (el.hasAttribute('data-elem-btn-up')) {
      const uuid = el.getAttribute('data-elem-btn-up');
      idraw.moveUpElement(uuid);
      renderElemens(idraw);
    } else if (el.hasAttribute('data-elem-btn-down')) {
      const uuid = el.getAttribute('data-elem-btn-down');
      idraw.moveDownElement(uuid);
      renderElemens(idraw);
    }
  }, true);

}

