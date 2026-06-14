export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Acesso não autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super(`${resource} não encontrado`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function domainErrorMessage(error: unknown): string {
  if (error instanceof DomainError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Erro inesperado';
}
