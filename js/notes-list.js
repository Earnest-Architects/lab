/**
 * ============================================================
 *  notes-list.js — panel "Notes" (bottom-left) di tur utama
 * ============================================================
 * Menampilkan seluruh catatan hotspot (dari semua gambar 360,
 * bukan cuma yang sedang dibuka) dalam 1 panel kecil yang bisa
 * di-hide/show, mirip pola floorplan-panel. Klik 1 catatan ->
 * viewer otomatis pindah ke scene + pitch/yaw tempat catatan itu
 * ditulis (viewer.loadScene(view, pitch, yaw)).
 *
 * Fitur ini SEPENUHNYA dikendalikan oleh `notesEnabled` di
 * content.js. Kalau false: panel + tombol toggle-nya dihapus dari
 * DOM, dan fetchNotes() tidak pernah dipanggil — project ini tidak
 * perlu Worker/KV Cloudflare sama sekali.
 * ============================================================
 */
import { findView, notesEnabled } from "./content.js";
import { fetchNotes } from "./notes-api.js";
import { viewer } from "./viewer.js";

const panel = document.getElementById("notes-list-panel");
const showBtn = document.getElementById("notes-list-show-btn");

if (!notesEnabled) {
  panel?.closest(".notes-nav-panel")?.remove();
} else {
  initNotesList();
}

function initNotesList() {
  const hideBtn = document.getElementById("notes-list-hide-btn");
  const listBody = document.getElementById("notes-list-body");

  /* ---------- Sembunyikan / tampilkan panel ---------- */

  hideBtn.addEventListener("click", () => {
    panel.classList.add("hidden");
    showBtn.classList.add("visible");
  });
  showBtn.addEventListener("click", () => {
    panel.classList.remove("hidden");
    showBtn.classList.remove("visible");
  });

  /* ---------- Render daftar catatan ---------- */

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function noteSummary(note) {
    if (note.text) return escapeHtml(note.text);
    if (note.image) return "📷 Photo note";
    return "(empty note)";
  }

  function renderList(notes) {
    listBody.innerHTML = "";

    const valid = notes.filter((n) => n && n.view && findView(n.view));
    if (!valid.length) {
      listBody.innerHTML = `<p class="notes-list-empty">No notes yet.</p>`;
      return;
    }

    valid
      .slice()
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .forEach((note) => {
        const v = findView(note.view);
        const item = document.createElement("button");
        item.type = "button";
        item.className = "notes-list-item";
        item.innerHTML = `
          <span class="notes-list-item-view">${escapeHtml(v.title)}</span>
          <span class="notes-list-item-text">${noteSummary(note)}</span>
        `;
        item.addEventListener("click", () => {
          viewer.loadScene(note.view, note.pitch, note.yaw);
        });
        listBody.appendChild(item);
      });
  }

  fetchNotes().then(renderList);
}
