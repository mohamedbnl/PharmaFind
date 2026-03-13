import jwt, { type SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  role: string;
}

const secret = () => process.env.JWT_SECRET as string;

export function signAccessToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: (process.env.JWT_ACCESS_EXPIRY ?? '15m') as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret(), opts);
}

export function signRefreshToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: (process.env.JWT_REFRESH_EXPIRY ?? '7d') as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret(), opts);
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, secret()) as TokenPayload;
  } catch {
    return null;
  }
}
