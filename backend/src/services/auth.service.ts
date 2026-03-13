import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import type { RegisterInput, LoginInput } from './types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(input: RegisterInput): Promise<AuthTokens & { user: object }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError('EMAIL_TAKEN', 409, 'Email already registered');

  const existingLicense = await prisma.user.findUnique({ where: { licenseNumber: input.licenseNumber } });
  if (existingLicense) throw new AppError('LICENSE_TAKEN', 409, 'License number already registered');

  const passwordHash = await hashPassword(input.password);
  const refreshTokenRaw = signRefreshToken({ userId: 'temp', role: 'pharmacist' });

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      licenseNumber: input.licenseNumber,
      role: 'pharmacist',
    },
    select: { id: true, email: true, fullName: true, phone: true, licenseNumber: true, role: true, isVerified: true },
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  const refreshHash = await hashPassword(refreshToken);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refreshHash } });

  void refreshTokenRaw;
  return { accessToken, refreshToken, user };
}

export async function loginUser(input: LoginInput): Promise<AuthTokens & { user: object }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password');

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password');

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  const refreshHash = await hashPassword(refreshToken);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: refreshHash, lastLoginAt: new Date() },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      licenseNumber: user.licenseNumber,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
}

export async function refreshTokens(rawRefreshToken: string): Promise<AuthTokens> {
  const payload = verifyAccessToken(rawRefreshToken);
  if (!payload) throw new AppError('INVALID_TOKEN', 401, 'Invalid or expired refresh token');

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user?.refreshToken) throw new AppError('INVALID_TOKEN', 401, 'Refresh token revoked');

  const valid = await comparePassword(rawRefreshToken, user.refreshToken);
  if (!valid) throw new AppError('INVALID_TOKEN', 401, 'Invalid refresh token');

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user.id, role: user.role });
  const refreshHash = await hashPassword(newRefreshToken);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refreshHash } });
  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
}

export async function getMe(userId: string): Promise<object> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, phone: true, licenseNumber: true, role: true, isVerified: true, createdAt: true },
  });
  if (!user) throw new AppError('USER_NOT_FOUND', 404, 'User not found');
  return user;
}
