import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

let client = null

export function connectWs(getToken, onNewRequest) {
  if (client?.active) return

  client = new Client({
    webSocketFactory: () => new SockJS('/stomp'),
   
    connectHeaders: { Authorization: 'Bearer ' + getToken() },
    reconnectDelay: 5000,
    heartbeatIncoming: 20000,
    heartbeatOutgoing: 20000
  })

  client.onConnect = () => {
    client.subscribe('/user/queue/requests', (msg) => {
      onNewRequest?.(JSON.parse(msg.body))
    })
  }

  client.activate()
}

export function disconnectWs() {
  if (client?.active) {
    client.deactivate()
  }
  client = null
}
