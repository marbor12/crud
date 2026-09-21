import type { Sql } from "postgres";
import { AppError } from "../errors";
import type { User, UserInput } from "../types";

export interface UserRepository {
    findAll(limit: number, offset: number): Promise<User[]>;
    findById(id: number): Promise<User | null>;
    create(input: UserInput): Promise<User>;
}


export class PostgresUserRepository implements UserRepository {
    constructor(private sql: Sql) {}

    async findAll(limit: number, offset: number) {
        return await this.sql<User[]>`
            SELECT id, name, email FROM users
            ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
    }

    async findById(id: number) {
        const rows = await this.sql<User[]>`
            SELECT id, name, email FROM users WHERE id = ${id}`;
        return rows[0] ?? null;
    }

    async create(input: UserInput) {
        try {
            const rows = await this.sql<User[]>`
                INSERT INTO users (name, email)
                VALUES (${input.name}, ${input.email})
                RETURNING id, name, email`;
            return rows[0]!;
        } catch (err: any) {
            if (err.code === "23505") throw new AppError("email sudah terdaftar", 409);
            throw err;
        }
    }
}
