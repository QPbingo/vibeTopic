import rateLimit from 'express-rate-limit'
import { config } from '../config.js'

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit.globalRpm,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 10003, data: null, message: '请求过于频繁' },
})

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.rateLimit.loginRpm,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 10003, data: null, message: '登录请求过于频繁，请稍后再试' },
})

export const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.rateLimit.registerRpm,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 10003, data: null, message: '注册请求过于频繁，请稍后再试' },
})

export const createPostLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.rateLimit.createPostRpm,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 10003, data: null, message: '发帖过于频繁，请稍后再试' },
})
