import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production-agro-2026'

export interface AuthUser {
  id: string
  login: string
  name: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' })
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET) as AuthUser
    next()
  } catch {
    return res.status(401).json({ error: 'Недействительный токен' })
  }
}

export function adminRequired(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'Администратор') {
    return res.status(403).json({ error: 'Доступ только для администратора' })
  }
  next()
}
