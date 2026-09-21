import { Hono } from "hono";
import { AppError } from "../errors";
import type { UserService } from "../services/user.service";

export function userRoutes(service: UserService) {
    const r = new Hono();

    r.get("/", async (c) => {
        const idParam = c.req.query("id");
        if (idParam) {
            const id = Number(idParam);
            if (!Number.isInteger(id)) throw new AppError("id harus angka", 400);
            return c.json(await service.getById(id));
        }
        const page = Math.max(Number(c.req.query("page")) || 1, 1);
        const limit = Math.min(Math.max(Number(c.req.query("limit")) || 10, 1), 100);
        return c.json({ page, limit, data: await service.list(page, limit) });
    });

    r.post("/", async (c) => {
        const body = await c.req.json();
        return c.json(await service.create(body), 201);
    });

    return r;
}