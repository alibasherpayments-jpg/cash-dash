import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp['message'] as string) || message;
        error = (resp['error'] as string) || error;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
          error = 'CONFLICT';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Resource not found';
          error = 'NOT_FOUND';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid reference';
          error = 'BAD_REQUEST';
          break;
        default:
          this.logger.error(`Prisma error ${exception.code}: ${exception.message}`);
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    // Never log sensitive paths like /auth/login to avoid credential logging
    const sensitiveRoutes = ['/auth/login', '/auth/register', '/auth/reset-password'];
    const isSensitive = sensitiveRoutes.some((r) => request.url?.includes(r));

    if (status >= 500 && !isSensitive) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message: Array.isArray(message) ? message : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
