import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { config } from './config.js'
import { globalLimiter } from './middleware/ratelimit.js'
import { authRouter } from './routes/auth.routes.js'
import { postRouter } from './routes/post.routes.js'
import { commentRouter } from './routes/comment.routes.js'
import { userRouter } from './routes/user.routes.js'
import { tagRouter } from './routes/tag.routes.js'
import { followRouter } from './routes/follow.routes.js'
import { projectRouter } from './routes/project.routes.js'
import { notificationRouter } from './routes/notification.routes.js'
import { sseRouter } from './routes/sse.routes.js'
import { searchRouter } from './routes/search.routes.js'
import { uploadRouter } from './routes/upload.routes.js'

const app = express()
if (config.isProduction) app.set('trust proxy', 1)

// ---- Global Middleware ----
app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,https://bingbingbingo.cn').split(','),
  credentials: true,
}))
app.use(express.json({ limit: '15mb' }))
app.use(cookieParser())
app.use(globalLimiter)

// ---- Static Files ----
const uploadDir = path.resolve(process.cwd(), 'uploads')
app.use('/uploads', express.static(uploadDir, {
  dotfiles: 'ignore',
  index: false,
  setHeaders(res) {
    res.setHeader('Cache-Control', 'no-cache')
  },
}))

// ---- Health Check ----
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ---- API Routes ----
const api = express.Router()

// Auth
api.use('/auth', authRouter)

// Posts
api.use('/posts', postRouter)

// Comments (mounted on posts and standalone)
api.use('/', commentRouter)

// Users
api.use('/users', userRouter)

// Tags
api.use('/tags', tagRouter)

// Follows
api.use('/follows', followRouter)

// Projects
api.use('/projects', projectRouter)

// Notifications (mounted under users/me)
api.use('/users/me/notifications', notificationRouter)

// SSE
api.use('/sse', sseRouter)

// Search
api.use('/search', searchRouter)

// Media / Upload
api.use('/media', uploadRouter)

app.use('/api/v1', api)

// ---- 404 Handler ----
app.use((_req, res) => {
  res.status(404).json({
    code: 10004,
    data: null,
    message: '资源不存在',
  })
})

// ---- Error Handler ----
app.use((err: Error & { type?: string; status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void _next
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ code: 10006, data: null, message: '请求体格式错误' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ code: 10013, data: null, message: '请求体过大' })
  }
  console.error('[API Error]', err)
  res.status(500).json({
    code: 10001,
    data: null,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
  })
})

// ---- Start Server ----
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 bingbingbingo API running on http://localhost:${config.port}`)
    console.log(`   Health: http://localhost:${config.port}/health`)
    console.log(`   API:    http://localhost:${config.port}/api/v1`)
  })
}

export default app
