import express, { type Express } from 'express'
import cors from 'cors'
import { pool } from './connections.js'
import { verifyTicket } from './auth.js'
import { startHeartbeat } from './heartbeat.js'
import { config } from './config.js'

const app: Express = express()
app.use(cors({ origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,https://bingbingbingo.cn').split(','), credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    connections: pool.totalConnections,
    onlineUsers: pool.onlineUsers,
    timestamp: new Date().toISOString(),
  })
})

app.get('/sse/notifications', (req, res) => {
  const ticket = req.query.ticket as string | undefined
  if (!ticket) { res.status(401).json({ error: 'Missing ticket' }); return }

  const userId = verifyTicket(ticket)
  if (!userId) { res.status(401).json({ error: 'Invalid or expired ticket' }); return }

  const added = pool.add(userId, res)
  if (!added) {
    res.status(503).json({ error: 'Too many connections' })
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  console.log(`[SSE] User ${userId} connected. Total: ${pool.totalConnections}`)
  res.write(`:ok\n\n`)

  const heartbeat = startHeartbeat(() => { res.write(`:ping\n\n`) })

  req.on('close', () => {
    clearInterval(heartbeat)
    pool.remove(userId, res)
    console.log(`[SSE] User ${userId} disconnected. Total: ${pool.totalConnections}`)
  })
})

app.post('/internal/push', (req, res) => {
  const { userId, notificationId, secret } = req.body
  if (secret !== config.internalPushSecret) { res.status(403).json({ error: 'Forbidden' }); return }
  if (!userId || !notificationId) { res.status(400).json({ error: 'Missing userId or notificationId' }); return }

  const event = JSON.stringify({ type: 'notification', notificationId })
  pool.sendToUser(userId, 'notification', event, notificationId)
  console.log(`[SSE] Pushed notification ${notificationId} to user ${userId}`)
  res.json({ ok: true })
})

app.listen(config.port, () => {
  console.log(`🔔 bingbingbingo SSE service running on http://localhost:${config.port}`)
  console.log(`   Health:      http://localhost:${config.port}/health`)
  console.log(`   SSE:         http://localhost:${config.port}/sse/notifications?ticket=xxx`)
  console.log(`   Internal:    http://localhost:${config.port}/internal/push`)
})

export default app
