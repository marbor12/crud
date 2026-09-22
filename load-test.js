import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    vus: 20, // in case ada 5 orang buka website secara bersamaan
    duration: "15s", // selama 10 detik
    thresholds: {
        // syarat 1: 95% dari mereka harus selesai di bawah 500 milidetik
        http_req_duration: ["p(95)<500"],
        // syarat 2: jumlah request yang gagal harus kurang dari 1%
        http_req_failed: ["rate<0.01"],
    },
};

const BASE_URL = "http://localhost:3000";

// Function ini dijalankan oleh setiap virtual user (VU) selama durasi test 10 detik
export default function () {
    // coba minta daftar user ke server
    const res = http.get("http://localhost:3000/user?page=1&limit=10");

    // cek: apakah hasilnya berhasil
    check(res, {
        "status is 200": (r) => r.status === 200,
    });

    // bikin email yang selalu beda tiap kali dijalanin
    // biar gak erorr email yang udah terdaftar
    const email = `k6-${Date.now()}-${__VU}-${__ITER}@example.com`;

    // coba tambah user baru ke server
    const createRes = http.post(
        `${BASE_URL}/user`,
        JSON.stringify({ name: "K6 Load Test", email }), //data yang dikirim
        {headers: { "Content-Type": "application/json" } }, //header
    );

    // cek: apakah user berhasil ditambhakan (status 201)?
    check(createRes, {
        "POST /user status 201": (r) => r.status === 201,
    });

    sleep(1); // tunggu 1 detik sebelum request berikutnya
}