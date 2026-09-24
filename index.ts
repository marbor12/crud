import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import postgres from "postgres";
import { AppError } from "./src/errors";
import { PostgresUserRepository } from "./src/repositories/user.repository";
import { UserService } from "./src/services/user.service";
import { userRoutes } from "./src/routes/user.route";

const sql = postgres({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
});

// Merakit: repository -> service -> route
const userRepo = new PostgresUserRepository(sql);
const userService = new UserService(userRepo);

const app = new Hono();
app.route("/user", userRoutes(userService));
app.use("/*", serveStatic({ root: "./public" }));

// Satu tempat buat nerjemahin error jadi respons
app.onError((err, c) => {
    if (err instanceof AppError) return c.json({ error: err.message }, err.status);
    console.error(err);
    return c.json({ error: "terjadi kesalahan server" }, 500);
});

export default { port: 3000, fetch: app.fetch };