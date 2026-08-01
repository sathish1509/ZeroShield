export class AppError extends Error {
  constructor(message, code = 'BAD_REQUEST', statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}