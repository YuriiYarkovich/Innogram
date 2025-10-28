import { Request, Response, NextFunction } from 'express';

export function deviceIdMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const deviceId: string | string[] | undefined = req.headers['x-device-id'];
  if (typeof deviceId === 'string') {
    req.deviceId = deviceId;
  }
  next();
}
