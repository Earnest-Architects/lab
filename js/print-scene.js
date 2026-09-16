/**
 * ============================================================
 *  print-scene.js — print tombol "Print this view"
 * ============================================================
 * Ambil frame yang sedang tampil di canvas WebGL Pannellum persis
 * pada sudut pandang saat itu, lalu buka tab baru berisi halaman
 * print-ready: full-bleed, landscape, kertas default A4 (kalau
 * printer/PDF-nya support A3, browser tetap akan scale otomatis
 * sesuai ukuran kertas yang dipilih user di print dialog).
 *
 * Pojok kiri-bawah: "Image CG"; pojok kanan-bawah: nama ruangan
 * (diambil dari #scene-title, yang sudah dikelola viewer.js).
 * Keduanya pakai font Monotype Corsiva, ukuran kecil.
 * ============================================================ */
import { viewer } from "./viewer.js";

const printBtn = document.getElementById("print-scene-btn");

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function captureCurrentFrame() {
  const canvas = viewer.getRenderer().getCanvas();
  return canvas.toDataURL("image/jpeg", 0.95);
}

function openPrintPage(imageDataUrl, roomName) {
  const win = window.open("", "_blank");
  if (!win) return; // popup diblokir browser — gagal secara diam-diam, tombol lain tetap jalan

  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Print — ${escapeHtml(roomName)}</title>
<style>
  @page { size: A4 landscape; margin: 2mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }
  .print-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .print-stamp {
    position: absolute;
    bottom: 3mm;
    font-family: "Monotype Corsiva", "Apple Chancery", cursive;
    font-size: 12pt;
    color: #1a1a1a;
    text-shadow: 0 1px 3px rgba(255,255,255,0.65);
    z-index: 2;
  }
  .print-stamp--left { left: 5mm; }
  .print-stamp--right { right: 5mm; text-align: right; }
  @media screen {
    body { background: #666; display: flex; align-items: center; justify-content: center; }
    .print-page {
      width: 297mm; height: 210mm;
      position: relative;
      background: #fff;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      overflow: hidden;
    }
    .print-photo, .print-stamp { position: absolute; }
  }
</style>
</head>
<body>
  <div class="print-page">
    <img class="print-photo" src="${imageDataUrl}" alt="" />
    <span class="print-stamp print-stamp--left">Image CG</span>
    <span class="print-stamp print-stamp--right">${escapeHtml(roomName)}</span>
  </div>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  <\/script>
</body>
</html>`);
  win.document.close();
}

if (printBtn) {
  printBtn.addEventListener("click", () => {
    try {
      const imageDataUrl = captureCurrentFrame();
      const roomName = document.getElementById("scene-title")?.textContent?.trim() || "";
      openPrintPage(imageDataUrl, roomName);
    } catch (err) {
      console.error("Print scene failed:", err);
    }
  });
}
