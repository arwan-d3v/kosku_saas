# Panduan Deployment & CI/CD (KosKu SaaS)

Dokumen ini berisi panduan langkah demi langkah untuk melakukan *deployment* aplikasi KosKu ke lingkungan *Production*. Kita menggunakan arsitektur modern yang memanfaatkan GitHub Actions, Vercel, dan Render/Railway.

## 1. Arsitektur CI/CD Pipeline
Aplikasi ini sudah dilengkapi dengan **GitHub Actions** (`.github/workflows/ci.yml`).
Setiap kali ada kode yang di-*push* ke *branch* `main`, GitHub akan secara otomatis:
- Menjalankan `npm ci` untuk menginstal dependensi.
- Menjalankan `npm run lint` untuk mengecek kualitas kode.
- Menjalankan `npm run build` untuk memastikan NestJS API dan Next.js Web dapat di-kompilasi tanpa eror.

Jika ada *error* pada tahap ini, proses *deployment* akan digagalkan (untuk mencegah aplikasi *down* di *Production*).

---

## 2. Setup Database & Storage (Supabase)
Sebelum men-deploy kode, pastikan database sudah siap.
1. Buka [Supabase Dashboard](https://supabase.com).
2. Jalankan `20240520000000_initial_schema.sql` di SQL Editor untuk membuat tabel dan sistem Auth (jika belum).
3. Jalankan `20240712000000_storage_setup.sql` di SQL Editor untuk membuat *bucket* `property_images` agar fitur upload foto kosan berfungsi.

---

## 3. Deploy Backend API (Render.com)
NestJS API kita perlu dijalankan di server yang selalu hidup (*Node.js Runtime*). Kita merekomendasikan [Render](https://render.com).

1. Daftar/Masuk ke Render menggunakan akun GitHub.
2. Buat **New Web Service** dan hubungkan ke repository GitHub ini.
3. Konfigurasi Service:
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`
4. Tambahkan **Environment Variables** (sama persis dengan yang ada di `.env` lokal Anda):
   - `SUPABASE_URL` = `<url_supabase_anda>`
   - `SUPABASE_ANON_KEY` = `<anon_key_anda>`
   - `SUPABASE_SERVICE_ROLE_KEY` = `<service_role_key_anda>`
5. Klik **Deploy** dan catat URL publiknya (misal: `https://kosku-api.onrender.com`).

---

## 4. Deploy Frontend Web (Vercel)
Next.js sangat dioptimalkan untuk berjalan di atas [Vercel](https://vercel.com).

1. Daftar/Masuk ke Vercel menggunakan akun GitHub.
2. Buat **New Project** dan hubungkan ke repository GitHub ini.
3. Konfigurasi Project:
   - **Framework Preset**: Next.js (Otomatis terdeteksi)
   - **Root Directory**: Ubah menjadi `apps/web`
4. Tambahkan **Environment Variables** (sama persis dengan yang ada di `.env.local` lokal Anda):
   - `NEXT_PUBLIC_SUPABASE_URL` = `<url_supabase_anda>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<anon_key_anda>`
   - `NEXT_PUBLIC_API_URL` = `<URL_RENDER_DARI_LANGKAH_3>/api`
5. Klik **Deploy**.

## 5. Flow Pembaharuan Aplikasi (Masa Depan)
Jika Anda ingin menambahkan fitur baru di masa depan:
1. Buat kode di komputer lokal.
2. `git add .` dan `git commit -m "fitur baru"`.
3. `git push origin main`.
4. GitHub Actions akan otomatis mengecek kode Anda.
5. Jika lolos, Render dan Vercel akan otomatis mengambil kode terbaru dan me-restart server Anda secara *seamless* tanpa campur tangan manual.
