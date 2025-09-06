// src/components/useBell.js
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import http from '@/api'
import { connectWs, addWsListener } from '@/ws'

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

function endpoints(kind, me) {
  if (kind === 'status') {
    return {
      countUrl: `/api/users/${me}/status/unseen-count`,
      resetUrl: `/api/users/${me}/status/unseen/reset`,
      parseCount: (data) => Number(data) || 0
    }
  }
  return {
    countUrl: `/api/users/${me}/counters`, // or `/api/users/${me}/counters`
    resetUrl: `/api/users/${me}/unread/reset`,
    parseCount: (data) => Number(data?.unread ?? 0),
  }
}

export function useBell(kind /* 'request' | 'status' */, username) {
  let nextId = 1
  const list = ref([])
  const bootUnread = ref(0)
  const liveUnread = ref(0)
  const liveAck = ref(false)

  const storedUser = getStoredUser()
  const me = username || storedUser?.username || localStorage.getItem('username') || ''
  console.log('[Bell] user =', me)

  const { countUrl, resetUrl } = endpoints(kind, me)

  function pushToast(title, summary, inc = true) {
    if (!title && !summary) return
    const n = { id: nextId++, title, summary, createdAt: new Date() }
    list.value.unshift(n)
    if (list.value.length > 5) list.value.pop()
    if (inc) liveUnread.value += 1
    // auto-dismiss (optional)
    setTimeout(() => dismiss(n.id), 6000)
  }

  function dismiss(id) {
    const i = list.value.findIndex(n => n.id === id)
    if (i !== -1) list.value.splice(i, 1)
  }

  function timeAgo(d) {
    const s = (Date.now() - d.getTime()) / 1000
    if (s < 60) return 'just now'
    return `${Math.floor(s / 60)}m ago`
  }

  // Debounced reset while liveAck is on
  let resetTimer = null
  async function resetUnreadDebounced() {
    if (!me || resetTimer) return
    resetTimer = setTimeout(async () => {
      resetTimer = null
      await http.post(resetUrl)
      bootUnread.value = 0
      liveUnread.value = 0
    }, 400)
  }

  async function markAllRead() {
    if (!me) return
    await http.post(resetUrl)
    bootUnread.value = 0
    liveUnread.value = 0
  }

  function startLiveAcknowledge() {
    liveAck.value = true
    markAllRead()
  }

  function stopLiveAcknowledge() {
    liveAck.value = false
    loadBootCount()
  }

  const count = computed(() => bootUnread.value + liveUnread.value)
  const items = computed(() => list.value.filter(n => n && n.id != null))

  async function loadBootCount() {
    try {
      if (!me) { bootUnread.value = 0; return }
      const { data } = await http.get(countUrl)
      // support either a raw number or { unread }
      const v = (typeof data === 'number')
        ? data
        : (Number(data?.unread ?? data?.unseen ?? 0))
      bootUnread.value = Number.isFinite(v) ? Number(v) : 0
    } catch {
      bootUnread.value = 0
    }
  }

  let removeWs = null // keep remover so we can unmount

  onMounted(async () => {
    await loadBootCount()
    connectWs(() => localStorage.getItem('auth_token') || '')

    removeWs = addWsListener({
      onConnect: async () => { await loadBootCount() },
      onNewRequest: (payload) => {
        if (kind !== 'request') return
        const id = payload?.requestId ?? ''
        const summary = payload?.summary ?? (id ? `Request #${id}` : 'New request')
        if (liveAck.value) {
          pushToast('New Request', summary, false)
          resetUnreadDebounced()
        } else {
          pushToast('New Request', summary)
        }
      },
      onStatusChange: (payload) => {
        if (kind !== 'status') return
        if (!payload) return
         console.log('[WS] status payload:', payload) 
        const recipient =
          payload.to ??
          payload.makerUsername ??
          payload.recipient

        // If a recipient is present and it's not me, ignore the event.
        if (recipient && recipient !== me) return

        // Optional extra guard if backend sends both maker and recipient fields:
        if (payload.maker && payload.maker !== me) return
        const id = payload?.requestId ?? ''
        const st = payload?.newStatus ?? payload?.status ?? ''
        const summary = id ? `Request #${id} → ${st}` : st
        if (liveAck.value) {
          pushToast(`Status: ${st}`, summary, false)
          resetUnreadDebounced()
        } else {
          pushToast(`Status: ${st}`, summary)
        }
      }
    })

    // small safety net
    setTimeout(loadBootCount, 500)
  })

  // IMPORTANT: register at setup level, not inside onMounted
  onBeforeUnmount(() => { if (removeWs) removeWs() })

  return { items, count, dismiss, timeAgo, markAllRead, startLiveAcknowledge, stopLiveAcknowledge }
}
