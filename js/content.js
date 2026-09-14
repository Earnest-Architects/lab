/**
 * ============================================================
 *  content.js — SATU-SATUNYA FILE YANG PERLU DIEDIT
 * ============================================================
 * Semua konten tur ada di sini: daftar lantai (denah), daftar
 * gambar 360 (views), titik pada denah, dan panah navigasi
 * (pitch point) di dalam tiap gambar 360.
 *
 * Tidak perlu menyentuh file JS lain untuk:
 *   - menambah / menghapus lantai
 *   - menambah / menghapus gambar 360 (view)
 *   - menambah / menghapus titik pada denah
 *   - menambah / menghapus pitch point di dalam gambar 360
 *   - menambah / menghapus CONTENT (foto, link, video, embed) yang
 *     muncul lewat jendela pop-up saat sebuah hotspot diklik
 * Cukup tambah atau hapus objeknya di array yang bersangkutan,
 * tampilan (denah, panah navigasi, hotspot content) otomatis
 * menyesuaikan.
 *
 * CARA MENCARI NILAI PITCH & YAW:
 *   Buka pitch-finder.html, pilih gambar 360 yang mau dicari
 *   titiknya, lalu klik posisi yang diinginkan di dalam gambar.
 *   Nilai pitch & yaw akan muncul dan bisa langsung disalin ke
 *   dalam "pitchPoints" di bawah.
 *
 * NAMA PROJECT (projectName):
 *   Dipakai otomatis oleh js/viewer.js & js/vr.js untuk:
 *     - Judul tab browser        -> "(projectName) Virtual Tour | Earnest Architects"
 *     - Judul besar di layar     -> "(projectName) Virtual Tour"
 *     - Judul preview link sosmed (og:title / twitter:title)
 *   Ganti nilainya di sini saja, tidak perlu edit file JS/HTML lain.
 *
 * DESKRIPSI PROJECT (metaDescription):
 *   Dipakai otomatis untuk meta description SEO & preview link
 *   sosial media (og:description / twitter:description).
 *   Ganti nilainya di sini saja.
 * ============================================================
 */

export const projectName = "Labougainvillea";
export const metaDescription = "Labougainvillea 360° Panorama by Rinaldisign.";

/* ============================================================
   1) DENAH (FLOORPLAN)
   ------------------------------------------------------------
   Setiap objek di array ini = 1 lantai.
   - image  : path gambar denah lantai tsb.
   - points : titik-titik pada denah yang bisa diklik untuk
              berpindah ke sebuah VIEW 360.
       target : harus sama persis dengan salah satu "id" di
                array `views` di bagian bawah file ini.
       x, y   : posisi titik pada gambar denah, dalam PERSEN (%)
                dihitung dari kiri (x) dan dari atas (y).
       label  : opsional. Kalau tidak diisi, otomatis memakai
                "title" dari view tujuannya.

   Tambah lantai baru = tambah 1 objek baru di array `floors`.
   Hapus lantai = hapus objeknya dari array ini.
============================================================ */
export const floors = [
  {
    id: "floor1",
    label: "1F",
    name: "1F",
    image: "assets/floorplan.jpg",
    points: [
  { target: "view1", x: 69.3, y: 68.3 },
  { target: "view2", x: 37, y: 20.6 },
],
  },
];

/* ============================================================
   2) GAMBAR 360 (VIEWS)
   ------------------------------------------------------------
   Setiap objek di array ini = 1 gambar panorama 360.
   - id         : pengenal unik. Dipakai sebagai "target" di atas
                  dan di pitchPoints view lain.
   - title      : judul yang tampil di layar & dipakai otomatis
                  sebagai label titik/pitch point yang menuju ke
                  view ini kalau label tidak diisi manual.
   - image      : path file gambar panorama.
   - yawOffset  : opsional, arah hadap awal saat view ini dibuka
                  (derajat, 0-360).
   - pitchPoints: titik-titik yang menempel DI DALAM gambar 360
                  ini. Ada 2 macam target:

       A) Menuju VIEW 360 lain (tampilan lama, tetap sama persis):
            { pitch: 1.9, yaw: 159.8, target: "view2" }
          "target" harus sama dengan salah satu "id" di array
          `views` ini. Kalau "type" tidak ditulis sama sekali,
          otomatis dianggap tipe ini (jadi data lama tetap jalan
          tanpa perlu diubah apa-apa).

       B) Menuju CONTENT — fitur tambahan: foto, ikon+link,
          teks+link, link saja, video YouTube, atau embed lain.
          Saat diklik, muncul jendela pop-up (bisa ditutup &
          diperbesar), TIDAK berpindah gambar 360:
            { pitch: 1.9, yaw: 159.8, type: "content", target: "content-promo" }
          "target" harus sama dengan salah satu "id" di array
          `contents` (lihat bagian 3 di bawah). Wajib tulis
          `type: "content"` supaya dikenali sebagai tipe ini.

       Field yang berlaku untuk keduanya:
         pitch, yaw : sudut, ambil dari pitch-finder.html (di
                      pitch-finder.html pilih tab "🖼️ Panorama"
                      untuk tipe A, atau "🧩 Content" untuk tipe B,
                      supaya tidak ketuker saat memilih target).
         label      : opsional, teks yang tampil di titik. Kalau
                      dikosongkan, otomatis pakai title dari view
                      target (tipe A) atau title dari content
                      target (tipe B).
         showLabel  : opsional, isi `false` supaya titik tampil
                      TANPA teks sama sekali (hanya ikon saja) —
                      berlaku baik tipe A maupun B. Default: true
                      (teks ditampilkan).

   Tampilan ikon tipe A (menuju panorama lain) dan tipe B (menuju
   content) sengaja dibedakan otomatis oleh sistem: ikon tipe B
   lebih kecil dan berkedip sedikit lebih cepat, supaya pengunjung
   bisa langsung membedakan mana titik yang pindah ruangan dan mana
   yang membuka info tambahan.

   Tambah gambar 360 baru = tambah 1 objek baru di array `views`,
   lalu taruh file panoramanya di folder assets/.
   Hapus view = hapus objeknya dari array ini (jangan lupa hapus
   juga pitchPoints/titik denah lain yang masih menunjuk ke id-nya).
============================================================ */
export const views = [
  {
    id: "view1",
    title: "Bedroom",
    image: "assets/pano1.jpg",
    yawOffset: 0,
    pitchPoints: [
        { pitch: -5.72, yaw: -178.5, target: "view2" },
        { type: "content", pitch: 0.39, yaw: -71.97, target: "content-peta" },
        { type: "content", pitch: -26.84, yaw: -24.4, target: "content-booking" },
        { type: "content", pitch: 4.66, yaw: 2.91, target: "content-video" },
    ],
  },
  {
    id: "view2",
    title: "Bathroom",
    image: "assets/pano2.jpg",
    yawOffset: 0,
    pitchPoints: [
        { pitch: -27.71, yaw: 74.5, target: "view1" },
    ],
  },
];

/* ============================================================
   3) CONTENT (foto / ikon+link / teks+link / link / video / embed)
   ------------------------------------------------------------
   Fitur tambahan: dipakai oleh pitchPoints tipe B (lihat
   penjelasan di atas array `views`). Ini titik yang KALAU DIKLIK
   membuka jendela pop-up berisi info tambahan — bukan berpindah
   ke gambar 360 lain. Boleh dibiarkan kosong ([]) kalau fitur ini
   belum dipakai; semua pitchPoints yang menuju view 360 tetap
   jalan normal seperti biasa.

   Cara pakai:
     1) Tambah 1 objek baru di array `contents` di bawah ini.
     2) Tunjuk objek itu dari `pitchPoints` milik view yang mana
        saja, pakai `type: "content"` dan `target: "<id di sini>"`.
     3) Di pitch-finder.html, klik dulu titiknya seperti biasa,
        lalu pilih tab target "🧩 Content" (bukan "🖼️ Panorama")
        supaya milih content-nya gampang, tidak ketuker dengan
        daftar gambar 360.

   Setiap objek WAJIB punya:
     id    : pengenal unik (dipakai sebagai "target" di pitchPoints).
     title : judul, tampil sebagai judul jendela pop-up & otomatis
             jadi label titik kalau "label" tidak diisi manual.
     type  : salah satu dari 6 pilihan berikut —
               "photo"     -> tampilkan 1 foto (+ teks opsional).
               "icon-link" -> ikon/gambar kecil + tombol link.
               "text-link" -> teks + tombol link.
               "link"      -> cuma 1 tombol/link saja, tanpa apa-apa.
               "youtube"   -> video YouTube (isi link videonya saja,
                              format apapun: youtube.com/watch?v=...
                              atau youtu.be/...).
               "embed"     -> embed bebas (kode <iframe> atau HTML
                              lain, mis. Google Maps, TikTok, dsb).

   Field lain tergantung "type" yang dipilih (isi seperlunya saja,
   sisanya boleh dihapus dari objeknya):
     image      : path foto/ikon (dipakai oleh "photo" & "icon-link").
     text       : teks/deskripsi (dipakai oleh "photo" & "text-link").
     link       : url tujuan tombol (dipakai oleh "icon-link",
                  "text-link", "link").
     linkLabel  : opsional, teks tombolnya. Kalau kosong otomatis
                  jadi "Buka link".
     youtubeUrl : url video (dipakai oleh "youtube").
     embedHtml  : kode embed mentah, mis. '<iframe src="..."></iframe>'
                  (dipakai oleh "embed").
============================================================ */
export const contents = [
  // Contoh 6 tipe content — hapus tanda komentar ( /* ... */ ) di
  // bawah dan sesuaikan isinya kalau mau langsung dipakai, lalu
  // hubungkan dari pitchPoints lewat { type: "content", target: "..." }.

  /*
  {
    id: "content-foto-menu",
    title: "Menu Minuman",
    type: "photo",
    image: "assets/menu.jpg",
    text: "Daftar menu minuman signature Coboy Bar.",
  },
  {
    id: "content-instagram",
    title: "Instagram Kami",
    type: "icon-link",
    image: "assets/ig-icon.png",
    link: "https://instagram.com/coboybar",
    linkLabel: "Buka Instagram",
  },
  {
    id: "content-promo",
    title: "Promo Bulan Ini",
    type: "text-link",
    text: "Diskon 20% untuk semua cocktail setiap hari Jumat.",
    link: "https://coboybar.example.com/promo",
    linkLabel: "Lihat detail promo",
  },
  {
    id: "content-reservasi",
    title: "Reservasi Meja",
    type: "link",
    link: "https://coboybar.example.com/reservasi",
    linkLabel: "Reservasi sekarang",
  },
  {
    id: "content-video-profil",
    title: "Video Profil Coboy Bar",
    type: "youtube",
    youtubeUrl: "https://www.youtube.com/watch?v=BP53wqxsu7M",
  },
  {
    id: "content-peta",
    title: "Lokasi Kami",
    type: "embed",
    embedHtml: '<iframe src="https://www.google.com/maps/embed?..." style="width:100%;height:100%;border:0;" loading="lazy"></iframe>',
  },
  */
  {
    id: "content-peta",
    title: "The Location",
    type: "embed",
    embedHtml: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4772.09001026853!2d-76.18198988815388!3d25.176126132459327!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x893aa4a0f7d8607f%3A0x81eeb234f9ae8054!2sLa%20Bougainvillea!5e1!3m2!1sen!2sjp!4v1788677515355!5m2!1sen!2sjp" width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
  },
    {
    id: "content-booking",
    title: "Book Now",
    type: "link",
    link: "https://www.labougainvillea.com",
    linkLabel: "Book Now",
  },
     {
    id: "content-video",
    title: "Promotional Video",
    type: "youtube",
    youtubeUrl: "https://www.youtube.com/watch?v=BP53wqxsu7M",
  },
];

/* ============================================================
   Helper — TIDAK PERLU DIEDIT
   Dipakai oleh js/viewer.js dan js/floorplan.js untuk membaca
   data di atas. Diletakkan di sini supaya file ini tetap jadi
   satu-satunya sumber kebenaran untuk seluruh konten tur.
============================================================ */
export function findView(id) {
  return views.find((v) => v.id === id);
}

export function findFloor(id) {
  return floors.find((f) => f.id === id);
}

/** Cari 1 objek content lewat id-nya (dipakai saat hotspot content diklik). */
export function findContent(id) {
  return contents.find((c) => c.id === id);
}

/** Semua lantai yang punya titik menuju view ini (dipakai saat pindah view untuk tahu harus pindah tab lantai ke mana). */
export function floorsForView(viewId) {
  return floors.filter((f) => f.points.some((p) => p.target === viewId));
}

/** Label yang ditampilkan untuk sebuah target: pakai label manual kalau ada, kalau tidak pakai title dari view tujuannya. */
export function labelForTarget(targetId, explicitLabel) {
  if (explicitLabel) return explicitLabel;
  const v = findView(targetId);
  return v ? v.title : targetId;
}
