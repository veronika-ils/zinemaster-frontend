// src/ws.js
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

let client = null
let listeners = []

export function connectWs(getToken) {
  if (client?.active) return

  const token = (typeof getToken === 'function' ? getToken() : '') || ''

  client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8081/stomp'), // your endpoint
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 3000,
    heartbeatIncoming: 20000,
    heartbeatOutgoing: 20000,
    debug: () => {}
  })
// src/ws.js
client.onConnect = () => {
  console.log('[WS] connected')

  // Admins: new requests
  client.subscribe('/user/queue/requests', (frame) => {
    let payload
    try { payload = JSON.parse(frame.body) } catch { return }
    listeners.forEach(l => l?.onNewRequest?.(payload))
  })

  // Makers: status changes
  client.subscribe('/user/queue/status', (frame) => {
    let payload
    try { payload = JSON.parse(frame.body) } catch { return }
    listeners.forEach(l => l?.onStatusChange?.(payload))
  })

  listeners.forEach(l => l?.onConnect?.())
}


  client.onStompError = f => console.error('[WS] STOMP error:', f.headers?.message)
  client.onWebSocketClose = e => console.warn('[WS] closed:', e?.reason || '')

  client.activate()
}

export function addWsListener(handlers) {
  listeners.push(handlers)
  return () => { listeners = listeners.filter(h => h !== handlers) }
}

export function disconnectWs() {
  if (client?.active) client.deactivate()
  client = null
  listeners = []
}
