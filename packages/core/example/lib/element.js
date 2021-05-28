
const dom = document.querySelector('#elem-list');

let hasInited = false;

export function doElemens(core) {
  if (hasInited === true)  return;
  renderElemens(core);
  listenElements(core);
}

function renderElemens(core) {
  const data = core.getData();
  const elems = data.elements;
  const items = elems.map((ele) => {
    return `
    <div class="elem-item">
      <span class="elem-item-name" data-elem-name="${ele.uuid || ''}">${ele.name || 'Unnamed'}</span>
      <span class="elem-item-btn" data-elem-btn-up="${ele.uuid || ''}">Up</span>
      <span class="elem-item-btn" data-elem-btn-up="${ele.uuid || ''}">Down</span>
    </div>
    `;
  });
  dom.innerHTML = items.join('');
}

function listenElements(core) {
  const names = dom.querySelectorAll('[data-elem-name]');  
  const upBtns = dom.querySelectorAll('[data-elem-btn-up]');
  const downBtns = dom.querySelectorAll('[data-elem-btn-down]');

  names.forEach((el) => {
    el.addEventListener('click', () => {
      const uuid = el.getAttribute('data-elem-name');
      core.selectElement(uuid);
    }, false);
  });

  upBtns.forEach((el) => {
    el.addEventListener('click', () => {
      const uuid = el.getAttribute('data-elem-btn-up');
      core.moveUpElement(uuid);
      renderElemens(core);
    }, false);
  });

  downBtns.forEach((el) => {
    el.addEventListener('click', () => {
      const uuid = el.getAttribute('data-elem-btn-down');
      core.moveDownElement(uuid);
      renderElemens(core);
    }, false);
  })
}

