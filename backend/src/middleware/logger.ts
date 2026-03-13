import type { RequestHandler } from 'express';

const isDev = process.env.NODE_ENV !== 'production';

export const logger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    if (isDev) {
      console.log(`[${level}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    } else {
      // Structured JSON for log aggregators (Datadog, CloudWatch, etc.)
      process.stdout.write(JSON.stringify({
        level, method: req.method, path: req.path,
        status: res.statusCode, duration_ms: duration,
        ts: new Date().toISOString(),
      }) + '\n');
    }
  });
  next();
};
