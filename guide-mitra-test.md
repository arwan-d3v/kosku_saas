# Panduan Pengujian Fitur Mitra (Owner Dashboard) KosKu

Dokumen ini ditujukan bagi tim QA (Quality Assurance) atau pemilik kos (Mitra) untuk melakukan *User Acceptance Testing* (UAT) terhadap fungsionalitas aplikasi KosKu pada sisi Dashboard Pemilik.

Pastikan aplikasi berjalan (secara lokal atau melalui URL produksi/staging) sebelum memulai skenario pengujian di bawah ini.

---

## Skenario 1: Autentikasi Mitra (Login & Registrasi)
**Tujuan:** Memastikan pemilik kos dapat mendaftar dan masuk ke sistem dengan aman.

| Langkah | Aksi | Hasil yang Diharapkan | Status (Pass/Fail) |
| :--- | :--- | :--- | :--- |
| 1.1 | Buka halaman web utama dan klik tombol **Register**. | Muncul halaman pendaftaran akun. | |
| 1.2 | Daftar akun baru dan set *role* di database Supabase menjadi `TENANT_ADMIN` atau `SUPERADMIN`. (Bisa disimulasikan). | Akun berhasil dibuat dan role terpasang. | |
| 1.3 | Kembali ke halaman utama, klik **Login** dan masukkan kredensial. | Login berhasil, menu navigasi akan memunculkan tombol **Mitra KosKu** (atau langsung masuk ke Dashboard Owner). | |

---

## Skenario 2: Dashboard Analytics
**Tujuan:** Memastikan bahwa matriks utama dan visualisasi data termuat dengan sempurna menggunakan Recharts.

| Langkah | Aksi | Hasil yang Diharapkan | Status (Pass/Fail) |
| :--- | :--- | :--- | :--- |
| 2.1 | Buka menu `/dashboard/owner`. | Halaman termuat dengan gaya *Modern Minimalist*. | |
| 2.2 | Periksa 4 Kartu Metrik di atas (Pendapatan, Properti, Kamar Terisi, Kamar Kosong). | Angka metrik muncul (kalkulasi dinamis) beserta indikator tren (Warna hijau/merah). | |
| 2.3 | Sorot (Hover) grafik **Tren Pendapatan** (AreaChart). | Muncul *tooltip* interaktif yang menampilkan jumlah uang terformat otomatis dalam Rupiah. | |
| 2.4 | Sorot (Hover) grafik **Tingkat Okupansi** (BarChart). | *Tooltip* menunjukkan angka rinci untuk setiap bangunan (Hijau=Terisi, Abu=Kosong). | |
| 2.5 | Periksa daftar **Aktivitas Terbaru**. | Daftar riwayat transaksi dan aktivitas muncul dalam format *list* yang elegan dengan *icon* berwarna. | |

---

## Skenario 3: Manajemen Properti (Slide-Over CRUD)
**Tujuan:** Memastikan *Single Page Application* (SPA) bekerja sempurna tanpa pindah/reload halaman yang mengganggu.

| Langkah | Aksi | Hasil yang Diharapkan | Status (Pass/Fail) |
| :--- | :--- | :--- | :--- |
| 3.1 | Pindah ke menu **Properti Saya** (`/dashboard/owner/properties`). | Tabel daftar properti muncul rapi (atau pesan "Belum ada kosan"). | |
| 3.2 | Klik tombol **Tambah Kosan**. | Panel meluncur dari samping kanan (*Slide-over*) membawa form tambah properti, layar belakang (*backdrop*) jadi agak blur/redup. | |
| 3.3 | Isi form (Nama Kosan, Alamat, Deskripsi) lalu klik **Simpan**. | Panel tertutup, tabel utama **langsung diperbarui** dengan data kosan baru tanpa *reload* halaman putih. | |
| 3.4 | Klik tombol **Edit** (ikon pensil) pada salah satu properti. | Panel samping terbuka lagi, membawa data yang sudah terisi. Ubah deskripsi lalu simpan. Tabel langsung ter-update. | |
| 3.5 | Klik tombol **Hapus** (ikon tempat sampah). | Akan muncul *pop-up* peringatan keamanan ("Yakin ingin menghapus?"). Jika 'Ya', data hilang dari tabel. | |

---

## Skenario 4: Manajemen Kamar (Kelola Kamar)
**Tujuan:** Menguji hierarki navigasi masuk ke dalam unit properti.

| Langkah | Aksi | Hasil yang Diharapkan | Status (Pass/Fail) |
| :--- | :--- | :--- | :--- |
| 4.1 | Pada tabel Properti, klik tombol **Kamar** pada salah satu baris kosan. | Berpindah halaman ke detail kamar kosan tersebut (`/dashboard/owner/properties/[id]`). | |
| 4.2 | Uji coba penambahan tipe/nomor kamar, harga, dan ketersediaan. | Data kamar baru masuk ke dalam daftar list/grid kamar. (Sama seperti CRUD properti). | |

---

## Skenario 5: Manajemen Penghuni (Tenant Management)
**Tujuan:** Menguji keterbacaan data penyewa yang sedang aktif, beserta status bayarnya.

| Langkah | Aksi | Hasil yang Diharapkan | Status (Pass/Fail) |
| :--- | :--- | :--- | :--- |
| 5.1 | Masuk ke menu **Penghuni** (`/dashboard/owner/tenants`). | Tabel termuat berisi foto avatar penyewa, info properti yang disewa, batas waktu (periode) sewa. | |
| 5.2 | Amati kolom **Status & Tagihan**. | Warna label sesuai (*Badge* hijau AKTIF untuk lunas, Oranye BELUM LUNAS untuk tertunda). Tagihan Rupiah jelas terbaca. | |
| 5.3 | Lakukan filter manual (klik chip tab "Semua", "Aktif", "Belum Lunas"). *(Fitur filter sedang dikembangkan, uji visibilitas tab UI saja).* | Navigasi Filter dapat diklik dan terfokus (berubah warna). | |
| 5.4 | Arahkan kursor ke tombol **Tagih** di kolom Aksi. | Tombol beranimasi menjadi hijau Solid (*WhatsApp style*) untuk persiapan integrasi obrolan *reminder*. | |

---

## Skenario 6: Responsivitas Antarmuka (Mobile & Desktop)
**Tujuan:** Menjamin keindahan antarmuka tak pudar di layar ukuran HP (Responsive Design).

| Langkah | Aksi | Hasil yang Diharapkan | Status (Pass/Fail) |
| :--- | :--- | :--- | :--- |
| 6.1 | Persempit lebar jendela *browser* ke ukuran HP (lebar di bawah 768px). | Navigasi menu kiri (*Sidebar*) akan tersembunyi secara cerdas. | |
| 6.2 | Buka kembali `/dashboard/owner`. | Grafik Recharts otomatis mengecil sesuai layar (*ResponsiveContainer*), 4 kartu atas berubah susunannya menjadi 1 atau 2 lajur agar tidak menabrak. | |
| 6.3 | Uji buka *Slide-over* di mode HP. | Panel form mengambil seluruh porsi layar (100% *width*), sangat mudah diketik (*thumb-friendly*). | |

---

**Panduan Tambahan:**
Bila selama pengetesan Anda menemukan galat sistem (Error 500, *Crash*, Layout rusak), harap catat nama File/URL serta lampirkan cuplikan layarnya untuk diperbaiki di putaran (*sprint*) pengembangan selanjutnya.
