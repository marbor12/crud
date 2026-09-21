# CRUD User API
Project latihan pertama saya selama magang. Ini API sederhana untuk mengelola data user (tambah, lihat, ubah, hapus), dibuat dengan Bun + Hono, dan datanya disimpan di PostgreSQL yang dijalankan lewat Docker.

## Yang saya pakai
- **Bun**: menjalankan kode TypeScript
- **Hono**: framework web untuk membuat API
- **PostgreSQL**: database
- **Docker Compose**: menjalankan PostgreSQL tanpa install manual

## Yang dibutuhkan sebelum mulai
- Docker (dan Docker Compose)
- Bun

## Cara menjalankan
1. Salin file contoh pengaturan
```
   cp .env.example .env
```

2. Isi `.env` sesuai `docker-compose.yml`:
```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=user
   DB_PASSWORD=password
   DB_NAME=user_database
```

3. Nyalakan database (tabel `users` dibuat otomatis dari `init.sql`):
```
   docker compose up -d
```

4. Pasang paket:
```
   bun install
```

5. Jalankan server:
```
   bun --watch index.ts
```

## Cara membuka
Server jalan di `http://localhost:3000`.

- **Tampilan web:** buka `http://localhost:3000` di browser. Dari sini bisa cari, tambah, edit, dan hapus user. Setiap aksi menampilkan modal berhasil atau gagal.
- **API:** semua endpoint ada di alamat `/user` (lihat di bawah).

## Daftar endpoint
| Method | Alamat | Fungsi |
|---|---|---|
| GET | `/user` | Lihat semua user (bisa pakai `?page=1&limit=10`) |
| GET | `/user?id=1` | Lihat detail satu user |
| POST | `/user` | Tambah user baru |
| PUT | `/user?id=1` | Ubah data user |
| DELETE | `/user?id=1` | Hapus user |

### Contoh pakai curl
Tambah user:
```
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@example.com"}'
```

Lihat semua user:
```
curl "http://localhost:3000/user?page=1&limit=10"
```

Lihat satu user:
```
curl "http://localhost:3000/user?id=1"
```

Ubah user:
```
curl -X PUT "http://localhost:3000/user?id=1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Baru","email":"maria@example.com"}'
```

Hapus user:
```
curl -X DELETE "http://localhost:3000/user?id=1"
```

### Kode status yang dipakai
- `200` berhasil
- `201` user berhasil dibuat
- `400` data yang dikirim salah (misalnya nama kosong atau id bukan angka)
- `404` user tidak ditemukan
- `409` email sudah dipakai user lain
- `500` ada masalah di server

## Struktur folder
```
index.ts                 -> merakit semua bagian dan menyalakan server
init.sql                 -> membuat tabel users otomatis
docker-compose.yml       -> pengaturan database di Docker
src/
  routes/                -> urusan HTTP: baca request, kirim balasan
  services/              -> aturan-aturan (validasi, cek user ada atau tidak)
  repositories/          -> satu-satunya bagian yang bicara ke database
  errors.ts              -> error buatan sendiri (bawa pesan dan status)
  types.ts               -> bentuk data User
```

Alur satu request: **route -> service -> repository -> database**, lalu balik lagi.
Saya pisahkan jadi tiga lapis supaya tiap file punya satu tugas (belajar prinsip SOLID).

## Catatan belajar
- Password database ada di file `.env` yang tidak ikut ke GitHub (sudah masuk `.gitignore`).
- Koneksi database memakai *connection pool* (`max: 10`), jadi koneksi dipakai bergantian, bukan dibuka-tutup tiap request.
- Kalau menjalankan `docker compose down -v`, data di database ikut terhapus. Tabelnya akan dibuat lagi otomatis oleh `init.sql`.
