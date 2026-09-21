export class AppError extends Error {
    constructor(message: string, public status: 400 | 404 | 409 | 500) {
        super(message);
    }
}