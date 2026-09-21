import { Hono } from "hono";

const app = new Hono(); //buat pelayan kosong

app.get("/", (c) => {
    return c.text("CRUD Sederhana dengan Hono");
});

app.get("/halo", (c) => {
    return c.text("Halo, Dunia!");
});

app.get("/user", (c) => {
    return c.json({
        id: 1,
        name: "Maria S",
        email: "mariaboro01@gmail.com"
    })
})

export default {
    port: 3000,
    fetch: app.fetch,
};