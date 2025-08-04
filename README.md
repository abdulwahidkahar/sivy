<p align="center">
<img src="https://placehold.co/150x50/000000/FFFFFF?text=Sivy" alt="Sivy Logo">
</p>

<h1 align="center">Sivy - AI-Powered Recruitment Intelligence</h1>

<p align="center">
<img src="https://img.shields.io/badge/laravel-12.x-FF2D20.svg?style=for-the-badge&logo=laravel" alt="Laravel">
<img src="https://img.shields.io/badge/react-18.x-61DAFB.svg?style=for-the-badge&logo=react" alt="React">
<img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge" alt="License">
</p>

<p align="center">
<strong>Sivy adalah platform intelijen rekrutmen yang dirancang untuk mengubah cara tim HR menemukan dan menilai talenta. Dengan memanfaatkan AI, Sivy mengotomatiskan proses penyaringan CV yang membosankan, memungkinkan perekrut untuk fokus pada hal yang paling penting: berinteraksi dengan kandidat terbaik.</strong>
</p>

<p align="center">
Proyek ini dibangun sebagai portofolio <em>full-stack</em> yang menunjukkan implementasi arsitektur modern, proses latar belakang asinkron, dan integrasi dengan model AI generatif.
</p>

✨ Fitur Utama
🤖 Analisis CV Berbasis AI: Unggah ratusan CV dan dapatkan analisis mendalam dalam hitungan menit, bukan hari.

🎭 Profil Analisis Dinamis: Buat dan kelola berbagai profil pekerjaan (Roles). Setiap analisis disesuaikan dengan kualifikasi teknis dan budaya yang Anda tentukan.

🏆 Peringkat Kandidat Cerdas: Kandidat secara otomatis diberi skor teknis dan skor kecocokan budaya, lalu diurutkan untuk memudahkan pengambilan keputusan.

🗂️ Manajemen Kandidat Terpusat: Lihat semua kandidat yang telah dianalisis dalam satu dasbor yang bersih, lengkap dengan filter dan pencarian.

⚡ Proses Latar Belakang (Queue): Proses analisis yang intensif dijalankan di latar belakang, memastikan antarmuka pengguna tetap cepat dan responsif.

🛠️ Manajemen Skill Otomatis: AI secara otomatis mengekstrak keahlian dari setiap CV dan membangun database skill yang dapat dicari.

🚀 Demo Aplikasi
Berikut adalah cuplikan dari Sivy saat beraksi.

Dashboard Utama

Halaman Daftar Kandidat

Halaman Detail Analisis

Lihat ringkasan statistik dan aktivitas analisis terbaru.

Filter, cari, dan lihat peringkat semua kandidat.

Dapatkan wawasan mendalam dari AI.







🛠️ Tumpukan Teknologi (Tech Stack)
Sivy dibangun dengan tumpukan teknologi modern yang dirancang untuk skalabilitas dan kecepatan pengembangan.

Kategori

Teknologi

Backend

Laravel 12, PHP 8.4, MySQL/PostgreSQL, Laravel Horizon/Redis, Google Gemini API

Frontend

React (TypeScript), Inertia.js, Tailwind CSS, Shadcn UI / Radix UI

🏁 Memulai (Getting Started)
Ikuti langkah-langkah berikut untuk menjalankan Sivy di lingkungan lokal Anda.

Prasyarat:

PHP >= 8.3

Composer

Node.js & NPM

Database (MySQL/PostgreSQL)

1. Clone Repositori

git clone https://github.com/username-anda/sivy.git
cd sivy

2. Instalasi Backend

# Salin file environment
cp .env.example .env

# Instal dependensi Composer
composer install

# Buat kunci aplikasi
php artisan key:generate

# Konfigurasi file .env Anda (database, API key, dll.)
# ...

# Jalankan migrasi dan seeder (jika ada)
php artisan migrate:fresh --seed

3. Instalasi Frontend

# Instal dependensi NPM
npm install

# Jalankan Vite development server
npm run dev

4. Jalankan Queue Worker
Untuk memproses analisis CV, Anda perlu menjalankan queue worker:

php artisan queue:work

5. Akses Aplikasi
Buka browser Anda dan navigasikan ke URL yang disediakan oleh server pengembangan Laravel (biasanya http://127.0.0.1:8000).

📄 Lisensi
Proyek ini dilisensikan di bawah MIT License.

👤 Kontak
[Nama Anda]

Email: [emailanda@example.com]

LinkedIn: [https://linkedin.com/in/username-anda]

Portofolio: [https://website-anda.com]
