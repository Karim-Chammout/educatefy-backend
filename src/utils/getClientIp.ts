import { Request } from 'express';

const PRIVATE_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^::1$/,
  /^f[cd]/,
  /^fe80:/,
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_PATTERNS.some((pattern) => pattern.test(ip));
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    for (const ip of ips) {
      if (ip && !isPrivateIp(ip)) {
        return ip;
      }
    }
  }

  return req.ip || '';
}
