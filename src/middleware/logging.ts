import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

export function accessLog(req: Request, res: Response, next: NextFunction) {
  const { hostname, method, path, ip, protocol, headers } = req;
  const userAgent = headers['user-agent'] || 'Unknown User Agent';
  const startTime = performance.now();
  const requestTime = new Date().toISOString();

  res.on('finish', () => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const { statusCode } = res;
    const logMessage = `${requestTime} - ${method} ${protocol}://${hostname}${path} - ${ip} - Status: ${statusCode} - Response Time: ${responseTime.toFixed(
      2,
    )}ms - User Agent: ${userAgent}`;
    console.log(logMessage);
  });

  next();
}

export function errorLog(err: Error, req: Request, res: Response, _next: NextFunction) {
  const { hostname, method, path, protocol, headers } = req;
  const userAgent = headers['user-agent'] || 'Unknown User Agent';
  const errorTime = new Date().toISOString();

  const logMessage = `${errorTime} - ${method} ${protocol}://${hostname}${path} - ${err.message} - Stack: ${err.stack} - User Agent: ${userAgent}`;
  console.log(logMessage);

  res.status(500).send({ status: 'server-error', message: err.message });
}
