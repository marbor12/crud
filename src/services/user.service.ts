import { AppError } from "../errors";
import type { UserRepository } from "../repositories/user.repository";
import type { UserInput } from "../types";

export class UserService {
    constructor(private repo: UserRepository) {}
        list(page: number, limit: number) {
        const offset = (page - 1) * limit;
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
}