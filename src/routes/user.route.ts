import { Hono } from "hono";
import { AppError } from "../errors";
import type { UserService } from "../services/user.service";

function parseId(value: string | undefined): number {
    const id = Number(value);
    if (!Number.isInteger(id)) throw new AppError("id harus angka", 400);
    return id;
}

export function userRoutes(service: UserService) {
    const r = new Hono();

    r.get("/", async (c) => {
        const idParam = c.req.query("id");
        if (idParam) {
            return c.json(await service.getById(parseId(idParam)));
        }
        const page = Math.max(Number(c.req.query("page")) || 1, 1);
        const limit = Math.min(Math.max(Number(c.req.query("limit")) || 10, 1), 100);
        const offsetParam = c.req.query("offset");
        const offset =
            offsetParam !== undefined
                ? Math.max(Number(offsetParam) || 0, 0)
                : (page - 1) * limit;
        return c.json({ page, limit, offset, data: await service.list(limit, offset) });
    });

    r.post("/", async (c) => {
        const body = await c.req.json();
        return c.json(await service.create(body), 201);
    });

    r.put("/", async (c) => {
        const id = parseId(c.req.query("id"));
        const body = await c.req.json();
        return c.json(await service.update(id, body));
    });

    r.delete("/", async (c) => {
        const id = parseId(c.req.query("id"));
        await service.delete(id);
        return c.json({ message: "user dihapus", id });
    });

    return r;
}