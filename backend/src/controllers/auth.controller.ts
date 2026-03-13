import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/errors';
import * as authService from '../services/auth.service';

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({ success: true, data: result });
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.json({ success: true, data: result });
});

export const refresh: RequestHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as { refreshToken: string };
  const tokens = await authService.refreshTokens(refreshToken);
  res.json({ success: true, data: tokens });
});

export const logout: RequestHandler = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.userId!);
  res.json({ success: true, data: { message: 'Logged out' } });
});

export const me: RequestHandler = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.userId!);
  res.json({ success: true, data: user });
});
