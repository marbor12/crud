import { AppError } from "../errors";
import type { UserRepository } from "../repositories/user.repository";
import type { UserInput } from "../types";

export class UserService {
    constructor(private repo: UserRepository) {}

    list(limit: number, offset: number) {
        return this.repo.findAll(limit, offset);
    }

    async getById(id: number) {
        const user = await this.repo.findById(id);
        if (!user) throw new AppError("user tidak ditemukan", 404);
        return user;
    }

    create(input: UserInput) {
        if (!input.name || !input.email) {
            throw new AppError("name dan email wajib diisi", 400);
        }
        return this.repo.create(input);
    }

    async update(id: number, input: UserInput) {
        if (!input.name || !input.email) {
            throw new AppError("name dan email wajib diisi", 400);
        }
        const user = await this.repo.update(id, input);
        if (!user) throw new AppError("user tidak ditemukan", 404);
        return user;
    }

    async delete(id: number) {
        const deleted = await this.repo.delete(id);
        if (!deleted) throw new AppError("user tidak ditemukan", 404);
    }
}