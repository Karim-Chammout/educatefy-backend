import { NextFunction, Request, Response } from 'express';
import { pinoHttp } from 'pino-http';

import logger from '../utils/logger.js';

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id ?? crypto.randomUUID(),
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (_req, res, err) => {
    return `request error: ${res.statusCode} - ${err.message}`;
  },
  customReceivedMessage: (req) => {
    return `request received: ${req.method} ${req.url}`;
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'responseTime',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: (err) => ({
      type: err.name,
      message: err.message,
      stack: err.stack,
    }),
  },
});

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  req.log.error({ err }, 'Unhandled error');
  res.status(500).send({ status: 'server-error', message: err.message });
}
