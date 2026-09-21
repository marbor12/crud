import { Hono } from "hono";
import postgres from "postgres";

const sql = postgres({
    host: "localhost",
    port: 5432,
    user: "user",
    password: "password",
    database: "user_database",
    max: 10,
});

const app = new Hono();

app.get("/", (c) => c.text("CRUD Sederhana dengan Hono"));

// GET /user           -> list (pagination: ?page=1&limit=10)
// GET /user?id=1      -> detail
app.get("/user", async (c) => {
    const idParam = c.req.query("id");

    if (idParam) {
        const id = Number(idParam);
        if (!Number.isInteger(id)) {
            return c.json({ error: "id harus angka" }, 400);
        }
        const rows = await sql`SELECT id, name, email FROM users WHERE id = ${id}`;
        if (rows.length === 0) {
            return c.json({ error: "user tidak ditemukan" }, 404);
        }
        return c.json(rows[0]);
    }

    const page = Math.max(Number(c.req.query("page")) || 1, 1);
    const limit = Math.min(Math.max(Number(c.req.query("limit")) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const users = await sql`
        SELECT id, name, email FROM users
        ORDER BY id
        LIMIT ${limit} OFFSET ${offset}`;
    return c.json({ page, limit, data: users });
});

// POST /user
app.post("/user", async (c) => {
    const { name, email } = await c.req.json();

    if (!name || !email) {
        return c.json({ error: "name dan email wajib diisi" }, 400);
    }

    try {
        const result = await sql`
            INSERT INTO users (name, email)
            VALUES (${name}, ${email})
            RETURNING id, name, email`;
        return c.json(result[0], 201);
    } catch (err: any) {
        if (err.code === "23505") {
            return c.json({ error: "email sudah terdaftar" }, 409);
        }
        console.error(err);
        return c.json({ error: "terjadi kesalahan server" }, 500);
    }
});

// PUT /user?id=1
app.put("/user", async (c) => {
    const id = Number(c.req.query("id"));
    if (!Number.isInteger(id)) {
        return c.json({ error: "id harus angka" }, 400);
    }

    const { name, email } = await c.req.json();
    if (!name || !email) {
        return c.json({ error: "name dan email wajib diisi" }, 400);
    }

    try {
        const result = await sql`
            UPDATE users SET name = ${name}, email = ${email}
            WHERE id = ${id}
            RETURNING id, name, email`;
        if (result.length === 0) {
            return c.json({ error: "user tidak ditemukan" }, 404);
        }
        return c.json(result[0]);
    } catch (err: any) {
        if (err.code === "23505") {
            return c.json({ error: "email sudah terdaftar" }, 409);
        }
        console.error(err);
        return c.json({ error: "terjadi kesalahan server" }, 500);
    }
});

// DELETE /user?id=1
app.delete("/user", async (c) => {
    const id = Number(c.req.query("id"));
    if (!Number.isInteger(id)) {
        return c.json({ error: "id harus angka" }, 400);
    }

    const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
    if (result.length === 0) {
        return c.json({ error: "user tidak ditemukan" }, 404);
    }
    return c.json({ message: "user dihapus", id });
});

export default {
    port: 3000,
    fetch: app.fetch,
};