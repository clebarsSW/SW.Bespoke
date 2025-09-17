// /js/cms.js
(function () {
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
    // make header access case/space-insensitive: row._["project name"]
    const norm = {};
    Object.keys(row).forEach(k => {
      norm[k.trim().toLowerCase()] = row[k];
    });
    norm._ = (name) => norm[name.trim().toLowerCase()];
    return norm;
  }
  function splitMulti(v) {
    if (!v) return [];
    // support comma, semicolon, or pipe separated
    return String(v).split(/[,;|]/).map(s => s.trim()).filter(Boolean);
  }

  // --- PROJECT INDEX (project-index.html) ---
  async function renderProjectIndex() {
    const list = document.querySelector('#project-list');
    if (!list) return; // not on this page
    // Template is the single .w-dyn-item that Webflow left in the list
    const template = list.querySelector('.w-dyn-item');
    if (!template) return;

    // Load your CSV
    const rows = await loadCSV('/data/Stellar Works Bespoke - Projects Index.csv');

    // Optional: clear existing items (keep one template hidden)
    list.innerHTML = '';
    // We’ll keep a detached clone as our template
    const tpl = template.cloneNode(true);

    rows.forEach(row => {
      // CHANGE THESE to match your CSV headers exactly
      const name        = row._('Project Name')      || row._('Name') || '';
      const year        = row._('Year')              || '';
      const region      = row._('Region')            || '';
      const types       = splitMulti(row._('Project Type')); // can be "Hotel, F&B, Workplace"
      const designer    = row._('Designer')          || '';
      const purchaser   = row._('Purchaser')         || '';
      const summary     = row._('Summary')           || '';
      const projectURL  = row._('Project URL')       || '#';
      const heroImage   = row._('Hero Image URL')    || ''; // absolute or /images/...

      // clone and fill
      const item = tpl.cloneNode(true);

      // Top row fields (these exist in your HTML)
      const nameEl   = item.querySelector('[fs-list-field="project-name"]');
      const yearEl   = item.querySelector('[fs-list-field="year"]');
      const typeWrap = item.querySelector('#w-node-e49b52f6-5b1d-8a7a-e0f6-5c3854a78d42-c10dda18');
      const regionEl = item.querySelector('.categories.region');

      if (nameEl) nameEl.textContent = name;
      if (yearEl) yearEl.textContent = year;
      if (regionEl) regionEl.textContent = region;

      // Put up to 3 types into the three type “slots”
      if (typeWrap) {
        const typeSlots = typeWrap.querySelectorAll('.categories.type');
        typeSlots.forEach((slot, i) => slot.textContent = types[i] || '');
      }

      // Hover image (inside .mouse_wrapper > img)
      const hoverImg = item.querySelector('.mouse_wrapper img');
      if (hoverImg && heroImage) {
        hoverImg.src = heroImage;
        hoverImg.alt = name;
      }

      // Dropdown content: summary/designer/purchaser
      const summaryEl   = item.querySelector('.text-block-12.project-text.w-dyn-bind-empty');
      const designerEl  = item.querySelectorAll('.text-block-12.project-text.w-dyn-bind-empty')[1];
      const purchaserEl = item.querySelectorAll('.text-block-12.project-text.w-dyn-bind-empty')[2];
      if (summaryEl)   summaryEl.textContent = summary;
      if (designerEl)  designerEl.textContent = designer;
      if (purchaserEl) purchaserEl.textContent = purchaser;

      // “View Full Project” link in right column
      const viewLink = item.querySelector('.index-column-2 .link-block-8');
      if (viewLink) viewLink.href = projectURL || '#';

      // Region/type values for Finsweet filters (they look for text/values in DOM)
      // Your checkboxes use fs-list-field="region" and "project-type" in several places.
      // Ensure there is at least one element with those attrs containing the values.
      const regionFilterEl = item.querySelector('[fs-list-field="region"]');
      if (regionFilterEl) regionFilterEl.textContent = region;
      // For project types, reuse the type slots we filled above.

      list.appendChild(item);
    });
  }

  // --- SELECTED WORKS GRID (selected-works.html) ---
  async function renderSelectedWorks() {
    // main grid list
    const gridList = document.querySelector('section.projects-grid-list .collection-list');
    if (!gridList) return; // not on this page
    const templateItem = gridList.querySelector('.w-dyn-item');
    if (!templateItem) return;

    const rows = await loadCSV('/data/Stellar Works Bespoke - Projects Index.csv');

    // reset list and keep a template
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

      // Build a data-tag like "Americas,F&B" so your existing JS/Finsweet can filter
      const tagList = [region, ...types].filter(Boolean);
      if (card) card.setAttribute('data-tag', tagList.join(',').toLowerCase());

      // Also mirror tags into the hidden filter divs present in your markup
      const hiddenRegion = item.querySelector('[fs-list-field="region"]');
      if (hiddenRegion) hiddenRegion.textContent = region;
      const hiddenTypes = item.querySelectorAll('[fs-list-field="project-type"]');
      hiddenTypes.forEach((el, i) => el.textContent = types[i] || '');

      gridList.appendChild(item);
    });
  }

  // Kick off on load
  document.addEventListener('DOMContentLoaded', () => {
    renderProjectIndex().catch(console.error);
    renderSelectedWorks().catch(console.error);
  });
})();
