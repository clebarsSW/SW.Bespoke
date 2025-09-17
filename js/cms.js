// /js/cms.js
(function () {
  // Use a RELATIVE path (no leading slash)
  const PROJECTS_CSV = encodeURI('data/projects-index.csv');

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
    Object.keys(row).forEach(k => {
      norm[k.trim().toLowerCase()] = row[k];
    });
    norm._ = (name) => norm[name.trim().toLowerCase()];
    return norm;
  }
  function splitMulti(v) {
    if (!v) return [];
    return String(v).split(/[,;|]/).map(s => s.trim()).filter(Boolean);
  }

  // --- PROJECT INDEX (project-index.html) ---
  async function renderProjectIndex() {
    const list = document.querySelector('#project-list');
    if (!list) return; // not on this page

    const template = list.querySelector('.w-dyn-item');
    if (!template) return;

    // Load your CSV (relative path)
    const rows = await loadCSV(PROJECTS_CSV);
    console.log('[CMS] Project Index rows:', rows.length);

    // Clear and clone
    list.innerHTML = '';
    const tpl = template.cloneNode(true);

    rows.forEach(row => {
      const name        = row._('Project Name')      || row._('Name') || '';
      const year        = row._('Year')              || '';
      const region      = row._('Region')            || '';
      const types       = splitMulti(row._('Project Type'));
      const designer    = row._('Designer')          || '';
      const purchaser   = row._('Purchaser')         || '';
      const summary     = row._('Summary')           || '';
      const projectURL  = row._('Project URL')       || '#';
      const heroImage   = row._('Hero Image URL')    || '';

      const item = tpl.cloneNode(true);

      const nameEl   = item.querySelector('[fs-list-field="project-name"]');
      const yearEl   = item.querySelector('[fs-list-field="year"]');
      const typeWrap = item.querySelector('#w-node-e49b52f6-5b1d-8a7a-e0f6-5c3854a78d42-c10dda18');
      const regionEl = item.querySelector('.categories.region');

      if (nameEl) nameEl.textContent = name;
      if (yearEl) yearEl.textContent = year;
      if (regionEl) regionEl.textContent = region;

      if (typeWrap) {
        const typeSlots = typeWrap.querySelectorAll('.categories.type');
        typeSlots.forEach((slot, i) => slot.textContent = types[i] || '');
      }

      const hoverImg = item.querySelector('.mouse_wrapper img');
      if (hoverImg && heroImage) {
        hoverImg.src = heroImage;
        hoverImg.alt = name;
      }

      const summaryEl   = item.querySelector('.text-block-12.project-text.w-dyn-bind-empty');
      const designerEl  = item.querySelectorAll('.text-block-12.project-text.w-dyn-bind-empty')[1];
      const purchaserEl = item.querySelectorAll('.text-block-12.project-text.w-dyn-bind-empty')[2];
      if (summaryEl)   summaryEl.textContent = summary;
      if (designerEl)  designerEl.textContent = designer;
      if (purchaserEl) purchaserEl.textContent = purchaser;

      const viewLink = item.querySelector('.index-column-2 .link-block-8');
      if (viewLink) viewLink.href = projectURL || '#';

      const regionFilterEl = item.querySelector('[fs-list-field="region"]');
      if (regionFilterEl) regionFilterEl.textContent = region;

      list.appendChild(item);
    });
  }

  // --- SELECTED WORKS GRID (selected-works.html) ---
  async function renderSelectedWorks() {
    const gridList = document.querySelector('section.projects-grid-list .collection-list');
    if (!gridList) return; // not on this page
    const templateItem = gridList.querySelector('.w-dyn-item');
    if (!templateItem) return;

    const rows = await loadCSV(PROJECTS_CSV);
    console.log('[CMS] Selected Works rows:', rows.length);

    gridList.innerHTML = '';
    const tpl = templateItem.cloneNode(true);

    rows.forEach(row => {
      const name        = row._('Project Name')   || row._('Name') || '';
      const location    = row._('Location')       || '';
      const region      = row._('Region')         || '';
      const types       = splitMulti(row._('Project Type'));
      const imageURL    = row._('Hero Image URL') || '';
      const projectURL  = row._('Project URL')    || '#';

      const item = tpl.cloneNode(true);
      const link = item.querySelector('a.project-link') || item.querySelector('a');
      if (link) link.href = projectURL || '#';

      const card = item.querySelector('.grid-project');
      const img  = item.querySelector('.grid-project-image');
      const titleEl = item.querySelector('.grid-project-title');
      const locEl   = item.querySelector('.grid-project-location');

      if (titleEl) titleEl.textContent = name;
      if (locEl)   locEl.textContent = location;
      if (img && imageURL) { img.src = imageURL; img.alt = name; }

      const tagList = [region, ...types].filter(Boolean);
      if (card) card.setAttribute('data-tag', tagList.join(',').toLowerCase());

      const hiddenRegion = item.querySelector('[fs-list-field="region"]');
      if (hiddenRegion) hiddenRegion.textContent = region;
      const hiddenTypes = item.querySelectorAll('[fs-list-field="project-type"]');
      hiddenTypes.forEach((el, i) => el.textContent = types[i] || '');

      gridList.appendChild(item);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderProjectIndex().catch(console.error);
    renderSelectedWorks().catch(console.error);
  });
})();
