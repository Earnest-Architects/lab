# Cara pasang fitur "Catatan Hotspot"

Ada 2 bagian yang perlu di-setup, terpisah:
- **GitHub** → tempat situs 360 kamu (semua file di root repo ini).
- **Cloudflare** → tempat API (Worker) + penyimpanan data catatan (KV).

---

## BAGIAN 1 — GitHub (situs 360)

Kalau situs kamu sudah live di GitHub Pages, cukup:

1. Commit & push semua file baru/berubah di repo ini (termasuk folder
   `cloudflare-worker/` — boleh ikut ter-push, tidak akan mengganggu
   situs karena situs cuma baca file HTML/CSS/JS di root & `js/`, `css/`).
2. Tunggu 1-2 menit sampai GitHub Pages selesai build ulang.
3. Selesai — halaman baru otomatis bisa diakses di
   `https://namamu.github.io/nama-repo/note-finder.html`.

Icon 💬 di pojok kanan atas halaman utama (`index.html`) otomatis
mengarah ke halaman itu.

---

## BAGIAN 2 — Cloudflare (Worker + KV)

### 1) Buat KV Namespace

1. Buka [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → tab **KV**.
2. **Create namespace**, beri nama misal `NOTES_KV`.
3. Catat **Namespace ID**-nya (terlihat di daftar KV setelah dibuat).

### 2) Buat Worker dari GitHub

1. **Workers & Pages** → **Create** → **Workers** → **Connect to Git** (atau **Import a repository**).
2. Pilih repo GitHub kamu, dan set:
   - **Root directory**: `cloudflare-worker`
     (supaya Cloudflare hanya build folder Worker ini, bukan seluruh
     situs statis di root repo).
3. Deploy dulu satu kali (boleh gagal ambil KV, akan diperbaiki di
   langkah berikut).

### 3) Sambungkan KV Namespace ke Worker

1) Buka Worker yang baru dibuat → **Settings** → **Bindings** → **Add binding** → pilih **KV Namespace**.
2) **Variable name**: `NOTES_KV` (harus sama persis, huruf besar semua).
3) **KV namespace**: pilih namespace yang dibuat di langkah 1.
4) Simpan — Cloudflare akan otomatis redeploy Worker dengan binding ini aktif.

(Kalau mau, isi juga `id` di `cloudflare-worker/wrangler.toml` dengan
Namespace ID dari langkah 1, lalu commit — tapi mengisi lewat
dashboard di atas sudah cukup, tidak wajib keduanya.)

### 4) Catat URL Worker kamu

Setelah deploy sukses, Worker punya URL seperti:

```
https://notes-hotspot-api.<username-kamu>.workers.dev
```

URL ini yang perlu ditempel ke situs (langkah berikutnya).

### 5) Hubungkan situs ke Worker

1. Buka file **`js/notes-config.js`** di repo GitHub kamu.
2. Ganti isi `NOTES_API_URL` dengan URL Worker dari langkah 4
   (tanpa garis miring "/" di akhir):
   ```js
   export const NOTES_API_URL = "https://notes-hotspot-api.username.workers.dev";
   ```
3. Commit & push. Tunggu GitHub Pages build ulang.

### 6) (Opsional tapi disarankan) Batasi CORS

Secara default `worker.js` mengizinkan semua domain (`ALLOWED_ORIGIN = "*"`).
Supaya cuma situs kamu yang bisa menulis catatan, buka
`cloudflare-worker/worker.js`, ganti baris:

```js
const ALLOWED_ORIGIN = "*";
```

menjadi domain situs kamu, misal:

```js
const ALLOWED_ORIGIN = "https://namamu.github.io";
```

Commit & push — Worker otomatis redeploy karena sudah tersambung ke GitHub.

---

## Selesai — cara pakai

1. Buka situs → klik icon 💬 di pojok kanan atas → masuk ke halaman "Leave a note".
2. Pilih gambar 360, klik tombol **💬 Add note**.
3. Klik titik di dalam gambar 360 → muncul icon 💬 mengambang + form di panel kanan.
4. Isi teks dan/atau lampirkan gambar → klik **Save note**.
5. Buka `index.html` (tur utama) → icon 💬 permanen sudah muncul di
   titik itu untuk semua pengunjung, klik untuk membaca isinya.

## Edit & hapus catatan

Catatan **bisa diedit/dihapus langsung dari UI di note-finder.html**.
Klik icon 💬 catatan yang tersimpan → modal menampilkan isinya plus
tombol **Edit** & **Delete**.

- **Tidak ada pengecekan kepemilikan/login** — siapa pun yang bisa
  membuka `note-finder.html` bisa mengedit atau menghapus catatan
  siapa saja, kapan saja, termasuk catatan buatan orang lain atau
  dari browser/device lain. Ini keputusan yang disengaja karena
  situsnya hanya diakses segelintir orang terpercaya, bukan publik
  luas — kalau nanti aksesnya makin terbuka, pertimbangkan menambah
  proteksi (misal token kepemilikan per-browser, atau kata sandi
  sederhana di halaman note-finder) sebelum itu terjadi.
- **Delete** minta konfirmasi 2 langkah di dalam modal itu sendiri
  sebelum benar-benar menghapus.
- Halaman baca-saja di `index.html` (tur utama) tidak berubah — icon
  💬 di sana tetap hanya menampilkan isi catatan, tombol Edit/Delete
  cuma ada di `note-finder.html`.

## Batasan yang perlu diketahui

- Gambar disimpan sebagai base64 langsung di dalam data catatan
  (dikompres otomatis oleh browser, maks. lebar 1280px). Tidak
  memakai R2/object storage terpisah — cukup untuk skala kecil-menengah.
- Maksimum 500 catatan & ~2MB per catatan (bisa diubah di `worker.js`,
  konstanta `MAX_TOTAL_NOTES` & `MAX_NOTE_BYTES`).
- Fitur ini belum ditambahkan ke `vr.html` (mode VR headset), hanya
  di tur utama (`index.html`) dan `note-finder.html`.
- Tidak ada akun/login — kepemilikan catatan murni berbasis token di
  localStorage per-browser, bukan sistem autentikasi yang sesungguhnya.
