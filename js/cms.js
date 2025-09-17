// /js/cms.js
(function () {
  const PROJECTS_CSV = encodeURI('data/projects-index.csv'); // relative path

  // --- Utilities ---
  function loadCSV(path) {
    return new Promise((resolve, reject) => {
      Papa.parse(path, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (res) => resolve(res.data.map(normalizeRow)),
        error: reject
      });
    });
  }
  function normalizeRow(row) {
    const norm = {};
    Object.keys(row).forEach(k => { norm[k.trim().toLowerCase()] = row[k]; });
    norm._ = (name) => norm[name.trim().toLowerCase()];
    return norm;
  }
  function splitMulti(v) {
    if (!v) return [];
    return String(v).split(/[,;|]/).map(s => s.trim()).filter(Boolean);
  }
  function setText(el, value) {
    if (!el) return;
    el.textContent = value || '';
    el.classList.remove('w-dyn-bind-empty');
  }
  function setImg(el, src, alt) {
    if (!el || !src) return;
    el.src = src;
    el.alt = alt || '';
    el.classList.remove('w-dyn-bind-empty');
  }

  // --- PROJECT INDEX (project-index.html) ---
  async function renderProjectIndex() {
    const list = document.querySelector('#project-list');
    if (!list) return; // not on this page

    const template = list.querySelector('.w-dyn-item');
    if (!template) return;

    const rows = await loadCSV(PROJECTS_CSV);

    // keep a template, then clear the list
    const tpl = template.cloneNode(true);
    list.innerHTML = '';

    rows.forEach(row => {
      const name        = row._('Project Name')      || row._('Name') || '';
      const year        = row._('Year')              || '';
      const region      = row._('Region')            || '';
      // robust type mapping: accept "Project Type" or 3 separate columns
      let types = splitMulti(row._('Project Type'));
      if (!types.length) {
        types = [row._('Type 1'), row._('Type 2'), row._('Type 3')].filter(Boolean);
      }
      const designer    = row._('Designer')          || '';
      const purchaser   = row._('Purchaser')         || '';
      const summary     = row._('Summary')           || '';
      const projectURL  = row._('Project URL')       || '#';
      const heroImage   = row._('Hero Image URL')    || '';

      const item = tpl.cloneNode(true);

      // Fill the visible fields
      setText(item.querySelector('[fs-list-field="project-name"]'), name);
      setText(item.querySelector('[fs-list-field="year"]'), year);
      setText(item.querySelector('.categories.region'), region);

      // 3 type slots (these are the chips in your markup)
      const typeWrap = item.querySelector('#w-node-e49b52f6-5b1d-8a7a-e0f6-5c3854a78d42-c10dda18');
      if (typeWrap) {
        const slots = typeWrap.querySelectorAll('.categories.type');
        slots.forEach((slot, i) => setText(slot, types[i] || ''));
      }

      // Hover image inside mouse_wrapper
      setImg(item.querySelector('.mouse_wrapper img'), heroImage, name);

      // Dropdown content (three text blocks inside right column)
      const info = item.querySelectorAll('.text-block-12.project-text');
      setText(info[0], summary);
      setText(info[1], designer);
      setText(info[2], purchaser);

      // link to full project
      const viewLink = item.querySelector('.index-column-2 .link-block-8 a, .index-column-2 .link-block-8');
      if (viewLink) viewLink.href = projectURL || '#';

      // Hidden fields Finsweet reads
      setText(item.querySelector('[fs-list-field="region"]'), region);
      item.querySelectorAll('[fs-list-field="project-type"]').forEach((el, i) => setText(el, types[i] || ''));

      list.appendChild(item);
    });
  }

  // --- SELECTED WORKS (selected-works.html) ---
  async function renderSelectedWorks() {
    const gridList = document.querySelector('section.projects-grid-list .collection-list');
    if (!gridList) return;

    const templateItem = gridList.querySelector('.w-dyn-item');
    if (!templateItem) return;

    const rows = await loadCSV(PROJECTS_CSV);

    const tpl = templateItem.cloneNode(true);
    gridList.innerHTML = '';

    rows.forEach(row => {
      const name        = row._('Project Name')   || row._('Name') || '';
      const location    = row._('Location')       || '';
      const region      = row._('Region')         || '';
      let types         = splitMulti(row._('Project Type'));
      if (!types.length) types = [row._('Type 1'), row._('Type 2'), row._('Type 3')].filter(Boolean);
      const imageURL    = row._('Hero Image URL') || '';
      const projectURL  = row._('Project URL')    || '#';

      const item = tpl.cloneNode(true);

      const link = item.querySelector('a.project-link') || item.querySelector('a');
      if (link) link.href = projectURL;

      setText(item.querySelector('.grid-project-title'), name);
      setText(item.querySelector('.grid-project-location'), location);
      setImg(item.querySelector('.grid-project-image'), imageURL, name);

      // tags for filters
      const tagList = [region, ...types].filter(Boolean).join(',').toLowerCase();
      const card = item.querySelector('.grid-project');
      if (card) card.setAttribute('data-tag', tagList);

      // mirror into hidden fields (used by Finsweet)
      setText(item.querySelector('[fs-list-field="region"]'), region);
      item.querySelectorAll('[fs-list-field="project-type"]').forEach((el, i) => setText(el, types[i] || ''));

      gridList.appendChild(item);
    });
  }

  // IMPORTANT: run immediately (defer ensures this runs before Finsweet/Webflow)
  renderProjectIndex().catch(console.error);
  renderSelectedWorks().catch(console.error);
})();
