import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta: {
    page?: number;
    total?: number;
    cursor?: string;
    [key: string]: unknown;
  };
  error: null;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | ApiResponse<unknown>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | ApiResponse<unknown>> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (this.isEnvelope(data)) {
          return data;
        }

        return {
          data: data as T,
          meta: {},
          error: null,
        };
      }),
    );
  }

  private isEnvelope(value: unknown): value is ApiResponse<unknown> {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const objectValue = value as Record<string, unknown>;
    return 'data' in objectValue && 'meta' in objectValue && 'error' in objectValue;
  }
}
