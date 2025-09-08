
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

let client = null
let listeners = []

export function connectWs(getToken) {
  if (client?.active) return
  const tok = getToken();
  console.log(tok)

  const token = localStorage.getItem('auth_token') ;

  client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8081/stomp'),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 3000,
    heartbeatIncoming: 20000,
    heartbeatOutgoing: 20000,
    debug: () => {}
  })

client.onConnect = () => {
  console.log('[WS] connected')


  client.subscribe('/user/queue/requests', (frame) => {
    let payload
    try { payload = JSON.parse(frame.body) } catch { return }
    listeners.forEach(l => l?.onNewRequest?.(payload))
  })

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
