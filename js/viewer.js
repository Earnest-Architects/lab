/**
 * ============================================================
 *  viewer.js — CORE VIEWER
 * ============================================================
 * Membungkus instance Pannellum. Membangun konfigurasi scene
 * langsung dari data di content.js — kalau content.js bertambah
 * atau berkurang isinya, viewer ini otomatis menyesuaikan tanpa
 * perlu diedit sama sekali.
 * ============================================================
 */
import { views, findView, findContent, projectName, metaDescription } from "./content.js";
import { createNavHotspotEl, createContentHotspotEl, createNoteHotspotEl } from "./hotspots.js";
import { openContentModal } from "./content-modal.js";
import { openNoteModal } from "./note-view.js";
import { fetchNotes } from "./notes-api.js";
import { setCurrentView, getCurrentViewId, tourEvents } from "./state.js";
import { initLanguageSwitcher } from "./google-translate.js";

/* Pasang ikon bola dunia (pojok kiri bawah) untuk ganti bahasa —
   lihat js/google-translate.js untuk cara kerjanya & batasannya. */
initLanguageSwitcher();

/* ---------- Judul halaman (tab browser), judul besar HUD, meta
   description, & tag Open Graph/Twitter (preview link sosmed) ----------
   Satu-satunya sumber datanya adalah `projectName` & `metaDescription`
   di content.js — ganti nilainya di sana, semua ikut berubah otomatis.
   (Catatan: sebagian besar crawler preview link sosmed seperti
   WhatsApp/Facebook/Twitter TIDAK menjalankan JavaScript, jadi untuk
   preview link yang 100% akurat, tag og:title/og:description statis
   di index.html tetap perlu disamakan manual. Bagian ini tetap berguna
   untuk judul tab browser & crawler yang menjalankan JS seperti Google.) */
const fullTitle = `${projectName} Virtual Tour | rinaldisign`;
document.title = fullTitle;

const projectTitleEl = document.getElementById("project-title");
if (projectTitleEl) projectTitleEl.textContent = `${projectName} Virtual Tour`;

function setMetaContent(selector, content) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute("content", content);
}
setMetaContent('meta[name="description"]', metaDescription);
setMetaContent('meta[property="og:title"]', `${projectName} Virtual Tour`);
setMetaContent('meta[property="og:description"]', metaDescription);
setMetaContent('meta[name="twitter:title"]', `${projectName} Virtual Tour`);
setMetaContent('meta[name="twitter:description"]', metaDescription);

export const viewer = pannellum.viewer("panorama", {
  default: {
    firstScene: views[0].id,
    sceneFadeDuration: 600,
    autoLoad: true,
    showControls: false,
    compass: false,
    hfov: 100,
  },
  scenes: Object.fromEntries(
    views.map((v) => [
      v.id,
      {
        type: "equirectangular",
        panorama: v.image,
        autoLoad: true,
        yaw: v.yawOffset || 0,
        hotSpots: (v.pitchPoints || []).map((p) => {
          const showLabel = p.showLabel !== false;

          if (p.type === "content") {
            const c = findContent(p.target);
            const label = p.label || (c || {}).title || "";
            return {
              pitch: p.pitch,
              yaw: p.yaw,
              type: "content-point",
              cssClass: "content-hotspot",
              createTooltipFunc: createContentHotspotEl,
              createTooltipArgs: { label, showLabel },
              clickHandlerFunc: () => openContentModal(p.target),
            };
          }

          const label = p.label || (findView(p.target) || {}).title || "";
          return {
            pitch: p.pitch,
            yaw: p.yaw,
            type: "scene",
            sceneId: p.target,
            cssClass: "nav-hotspot",
            createTooltipFunc: createNavHotspotEl,
            createTooltipArgs: { label, showLabel },
          };
        }),
      },
    ])
  ),
});

/* ---------- Catatan Hotspot (dibuat pengunjung lewat note-finder.html) ----------
   Berbeda dari pitchPoints di content.js (statis, ditulis manual di
   kode), catatan disimpan dinamis lewat Worker Cloudflare. Diambil
   sekali saat halaman dibuka, lalu ditempel ke scene yang sesuai
   pakai viewer.addHotSpot() — pannellum otomatis menyimpannya untuk
   scene yang belum aktif dan menampilkannya begitu scene itu dibuka. */
fetchNotes().then((notes) => {
  notes.forEach((note) => {
    if (!note || !note.view || !findView(note.view)) return; // abaikan catatan untuk view yang sudah dihapus
    viewer.addHotSpot(
      {
        id: `note-${note.id}`,
        pitch: note.pitch,
        yaw: note.yaw,
        type: "info",
        cssClass: "note-hotspot",
        createTooltipFunc: createNoteHotspotEl,
        createTooltipArgs: { label: "", showLabel: false },
        clickHandlerFunc: () => openNoteModal(note),
      },
      note.view
    );
  });
});

/** Pindah ke view lain. Dipakai floorplan.js (klik titik di denah). */
export function goToView(id) {
  if (!id) return;
  viewer.loadScene(id);
}

/* ---------- Nama ruangan (eyebrow kecil di atas judul project) ---------- */

const sceneTitleEl = document.getElementById("scene-title");

function updateTitle(id) {
  const v = findView(id);
  if (v && sceneTitleEl) sceneTitleEl.textContent = v.title;
}

/* ---------- Loading screen ----------
   Animasi brand "Earnest Architects" butuh waktu untuk tampil penuh
   dengan mulus, jadi loading screen ditahan minimal MIN_LOADING_MS
   walaupun panorama sudah selesai dimuat lebih cepat dari itu. */

const loadingScreen = document.getElementById("loading-screen");
const MIN_LOADING_MS = 1700;
const loadingStartedAt = performance.now();

function hideLoadingScreen() {
  loadingScreen.classList.add("hidden");
  tourEvents.emit("viewerload", { id: viewer.getScene() });
}

viewer.on("load", () => {
  const elapsed = performance.now() - loadingStartedAt;
  const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
  setTimeout(hideLoadingScreen, remaining);
});

viewer.on("scenechange", (id) => {
  setCurrentView(id);
  updateTitle(id);
});

/* ---------- Fullscreen control ---------- */

const fullscreenBtn = document.getElementById("fullscreen-btn");

const supportsFullscreen =
  document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;

if (!supportsFullscreen) {
  // iPhone (iOS Safari & semua browser di iOS) belum mendukung Fullscreen API
  // untuk elemen selain <video>, jadi tombolnya disembunyikan saja.
  fullscreenBtn.style.display = "none";
} else {
  fullscreenBtn.addEventListener("click", () => viewer.toggleFullscreen());
}

/* ---------- Tombol VR (buka viewer VR di vr.html) ---------- */
/* Membawa scene yang sedang dilihat lewat ?scene=..., supaya begitu
   masuk mode VR, pengguna melanjutkan dari ruangan yang sama. */

const vrBtn = document.getElementById("vr-btn");

if (vrBtn) {
  vrBtn.addEventListener("click", () => {
    const id = getCurrentViewId() || views[0].id;
    window.location.href = `vr.html?scene=${encodeURIComponent(id)}`;
  });
}

/* ---------- Share (copy link / native share) ---------- */

const shareBtn = document.getElementById("share-btn");
const toastEl = document.getElementById("toast");

let toastTimer = null;
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("visible"), 2400);
}

async function copyLinkFallback(url) {
  const input = document.createElement("textarea");
  input.value = url;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  try {
    document.execCommand("copy");
    return true;
  } catch (err) {
    return false;
  } finally {
    document.body.removeChild(input);
  }
}

async function copyLink() {
  const url = window.location.href;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
      return;
    } catch (err) {
      /* lanjut ke fallback di bawah */
    }
  }
  const ok = await copyLinkFallback(url);
  showToast(ok ? "Link copied" : "Copy failed");
}

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const shareData = {
      title: document.title,
      text: `${projectName} Virtual Tour`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Pengguna membatalkan share sheet, atau gagal — jangan tampilkan
        // pesan error, cukup diamkan (perilaku umum Web Share API).
        if (err && err.name === "AbortError") return;
      }
    }
    copyLink();
  });
}

/* ---------- Inisialisasi view pertama ---------- */
setCurrentView(views[0].id);
updateTitle(views[0].id);
