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

const app = new Hono(); //buat pelayan kosong

app.get("/", (c) => {
    return c.text("CRUD Sederhana dengan Hono");
});

app.get("/halo", (c) => {
    return c.text("Halo, Dunia!");
});

app.get("/user", async (c) => {
    const users = await sql`SELECT id, name, email FROM users`;
    return c.json(users);
});

export default {
    port: 3000,
    fetch: app.fetch,
};