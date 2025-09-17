/* cms.js — CSV -> Project Index renderer
   IMPORTANT: point CSV_PATH to your actual file in /data/ */
const CSV_PATH = "/data/Stellar Works Bespoke - Projects Index.csv";  // change if you rename

// Map your column names from the CSV
const FIELDS = {
  id: "Item ID",
  name: "Name",
  slug: "Slug",
  year: "Year",
  region: "Region",          // can be "Asia;Americas;..." — we'll split by ';'
  type: "Project Type",      // if your column is named differently, change this
  cover: "Project Hero",     // image URL (optional)
  collectionsCell: "Collections?",
  collectionsTags: "Collections Tags"
};

const MULTI = ";";
const SELECTED_COLLECTION_NAME = "Selected Works"; // used on selected-works.html

// ---------- CSV loader (Papa must be present on the page) ----------
async function loadCSV(path) {
  const res = await fetch(path, { cache: "force-cache" });
  const text = await res.text();
  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (r) => resolve(r.data),
    });
  });
}

function splitMulti(v) {
  return String(v || "")
    .split(MULTI)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeRow(r) {
  const collections = new Set([
    ...splitMulti(r[FIELDS.collectionsCell]),
    ...splitMulti(r[FIELDS.collectionsTags]),
  ]);
  return {
    id: String(r[FIELDS.id] ?? r["ID"] ?? r[FIELDS.slug] ?? "").trim(),
    name: r[FIELDS.name] || "Untitled",
    slug: String(r[FIELDS.slug] || "").trim(),
    year: r[FIELDS.year] || "",
    region: splitMulti(r[FIELDS.region]),
    type: r[FIELDS.type] || "",
    cover: r[FIELDS.cover] || "",
    collections: Array.from(collections),
    raw: r,
  };
}

let _projectsPromise = null;
async function getProjects() {
  if (_projectsPromise) return _projectsPromise;
  _projectsPromise = loadCSV(CSV_PATH).then((rows) => rows.map(normalizeRow));
  return _projectsPromise;
}

// ---------- HTML template that matches your Webflow/Finsweet structure ----------
function itemHTML(p) {
  // If you don't actually have /projects/slug.html files, use '#' instead.
  const detailHref = p.slug ? `/projects/${p.slug}.html` : "#";
  return `
  <div role="listitem" class="w-dyn-item">
    <div style="display:none" class="mouse_wrapper">
      ${p.cover ? `<img src="${p.cover}" alt="${p.name}" class="hero_image">` : ""}
    </div>

    <div class="dropdown-trigger">
      <div class="w-layout-grid grid-3 individual" style="opacity:0.7">
        <div fs-list-field="project-name" class="body-6 project-name">${p.name}</div>

        <div fs-list-fieldtype="number" fs-list-field="year" class="categories year">${p.year}</div>

        <div fs-list-field="project-type" class="categories type">
          ${p.type ? `<div fs-list-field="project-type" class="categories type">${p.type}</div>` : ""}
        </div>

        <div>
          <div fs-list-field="region" class="categories region">${p.region.join(", ")}</div>
        </div>
      </div>
    </div>

    <!-- you can wire these links if needed -->
    <div class="dropdown-content" style="height:0px"></div>
    <div class="div-block-5 line"></div>
  </div>`;
}

// ---------- Page renderers ----------
async function renderProjectIndex({ target = "#project-list", sortAZ = true } = {}) {
  const mount = document.querySelector(target);
  if (!mount) return;

  const projects = await getProjects();
  if (sortAZ) projects.sort((a, b) => a.name.localeCompare(b.name));

  // Render items
  mount.innerHTML = projects.map(itemHTML).join("");
}

async function renderSelectedWorks({ target = "#selected-list", sortAZ = true } = {}) {
  const mount = document.querySelector(target);
  if (!mount) return;

  const projects = await getProjects();
  const selected = projects.filter((p) => p.collections.includes(SELECTED_COLLECTION_NAME));
  if (sortAZ) selected.sort((a, b) => a.name.localeCompare(b.name));

  mount.innerHTML = selected.map(itemHTML).join("");
}

window.CMS = { getProjects, renderProjectIndex, renderSelectedWorks };
