export class ApiError extends Error {
    status;
    errors;

    constructor(status:number, message:string, errors:Array<string> = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
    static UnauthorizedError() {
        return new ApiError(401, "User not authorized")
    };
    static BadRequest(message: string, errors: Array<string> = []) {
        return new ApiError(400, message, errors)
    }
}