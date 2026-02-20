import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorEnvelope {
  code: string;
  message: string;
  details?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status = this.resolveStatus(exception);
    const errorEnvelope = this.resolveErrorEnvelope(exception, status);

    this.logger.error(
      `${request.method} ${request.url} -> ${status} ${errorEnvelope.code}: ${errorEnvelope.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      data: null,
      meta: {},
      error: errorEnvelope,
    });
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      const httpException = exception as HttpException;
      return httpException.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveErrorEnvelope(exception: unknown, status: number): ErrorEnvelope {
    if (exception instanceof HttpException) {
      const httpException = exception as HttpException;
      const payload = httpException.getResponse();

      if (typeof payload === 'string') {
        return {
          code: this.statusToCode(status),
          message: payload,
        };
      }

      if (payload && typeof payload === 'object') {
        const value = payload as Record<string, unknown>;
        const messageValue = value.message;

        return {
          code: typeof value.code === 'string' ? value.code : this.statusToCode(status),
          message: Array.isArray(messageValue)
            ? messageValue.join(', ')
            : typeof messageValue === 'string'
              ? messageValue
              : httpException.message,
          details: value.details ?? (Array.isArray(messageValue) ? messageValue : undefined),
        };
      }

      return {
        code: this.statusToCode(status),
        message: httpException.message,
      };
    }

    if (exception instanceof Error) {
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: exception.message,
      };
    }

    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    };
  }

  private statusToCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      default:
        return status >= 500 ? 'INTERNAL_SERVER_ERROR' : `HTTP_${status}`;
    }
  }
}
