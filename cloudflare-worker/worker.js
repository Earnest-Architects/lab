/**
 * ============================================================
 *  worker.js — API catatan hotspot (GET/POST/PUT/DELETE) untuk 360 tour
 * ============================================================
 * Endpoint:
 *   GET    /notes      -> kembalikan semua catatan tersimpan (array JSON)
 *   POST   /notes      -> simpan 1 catatan baru
 *   PUT    /notes/:id  -> update teks/gambar 1 catatan
 *   DELETE /notes/:id  -> hapus 1 catatan
 *
 * SENGAJA TANPA proteksi kepemilikan (tidak ada token/login): siapa
 * pun yang bisa membuka note-finder.html bisa mengedit/menghapus
 * catatan siapa saja, kapan saja. Ini cocok untuk situs yang hanya
 * diakses segelintir orang terpercaya (bukan situs publik terbuka
 * untuk siapa saja) — kalau nanti aksesnya makin luas, tambahkan lagi
 * mekanisme token/kepemilikan sebelum publikasi lebih luas.
 *
 * Semua catatan disimpan sebagai SATU array JSON di 1 key KV
 * ("notes"). Cukup untuk skala catatan pengunjung 1 tur 360
 * (puluhan-ratusan catatan). Butuh binding KV bernama NOTES_KV
 * (lihat README.md di folder ini untuk cara membuatnya).
 * ============================================================ */

// GANTI "*" dengan domain situs kamu kalau mau lebih ketat, misal:
// "https://namamu.github.io"
const ALLOWED_ORIGIN = "*";

const MAX_TEXT_LENGTH = 1500;
const MAX_NOTE_BYTES = 2_000_000; // ~2MB per catatan (termasuk gambar base64)
const MAX_TOTAL_NOTES = 500; // batas jumlah catatan supaya key KV tidak membengkak

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

async function getAllNotes(env) {
  const raw = await env.NOTES_KV.get("notes");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAllNotes(env, notes) {
  await env.NOTES_KV.put("notes", JSON.stringify(notes));
}

async function handleGet(env) {
  const notes = await getAllNotes(env);
  return json(notes);
}

async function handlePost(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Body bukan JSON yang valid." }, 400);
  }

  const view = String(body.view || "").slice(0, 100);
  const pitch = Number(body.pitch);
  const yaw = Number(body.yaw);
  const text = String(body.text || "").slice(0, MAX_TEXT_LENGTH);
  const image = typeof body.image === "string" ? body.image : "";

  if (!view || Number.isNaN(pitch) || Number.isNaN(yaw)) {
    return json({ error: "Field view/pitch/yaw wajib diisi." }, 400);
  }
  if (!text && !image) {
    return json({ error: "Isi teks catatan atau lampirkan gambar." }, 400);
  }
  if (image && image.length > MAX_NOTE_BYTES) {
    return json({ error: "Ukuran gambar terlalu besar." }, 413);
  }

  const notes = await getAllNotes(env);
  if (notes.length >= MAX_TOTAL_NOTES) {
    return json({ error: "Jumlah catatan sudah mencapai batas maksimum." }, 507);
  }

  const note = {
    id: crypto.randomUUID(),
    view,
    pitch,
    yaw,
    text,
    image,
    createdAt: Date.now(),
  };

  notes.push(note);
  await saveAllNotes(env, notes);

  return json(note, 201);
}

async function handlePut(request, env, id) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Body bukan JSON yang valid." }, 400);
  }

  const notes = await getAllNotes(env);
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return json({ error: "Catatan tidak ditemukan." }, 404);

  const existing = notes[idx];
  const text = body.text !== undefined ? String(body.text || "").slice(0, MAX_TEXT_LENGTH) : existing.text;
  const image = body.image !== undefined ? (typeof body.image === "string" ? body.image : "") : existing.image;

  if (!text && !image) {
    return json({ error: "Isi teks catatan atau lampirkan gambar." }, 400);
  }
  if (image && image.length > MAX_NOTE_BYTES) {
    return json({ error: "Ukuran gambar terlalu besar." }, 413);
  }

  const updated = { ...existing, text, image, updatedAt: Date.now() };
  notes[idx] = updated;
  await saveAllNotes(env, notes);

  return json(updated);
}

async function handleDelete(env, id) {
  const notes = await getAllNotes(env);
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return json({ error: "Catatan tidak ditemukan." }, 404);

  notes.splice(idx, 1);
  await saveAllNotes(env, notes);

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    // /notes
    if (url.pathname === "/notes") {
      if (request.method === "GET") return handleGet(env);
      if (request.method === "POST") return handlePost(request, env);
      return json({ error: "Method not allowed" }, 405);
    }

    // /notes/:id
    const match = url.pathname.match(/^\/notes\/([^/]+)$/);
    if (match) {
      const id = decodeURIComponent(match[1]);
      if (request.method === "PUT") return handlePut(request, env, id);
      if (request.method === "DELETE") return handleDelete(env, id);
      return json({ error: "Method not allowed" }, 405);
    }

    return json({ error: "Not found" }, 404);
  },
};
