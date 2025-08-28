<template>

  <span v-if="count > 0"
        class="position-absolute translate-middle badge rounded-pill bg-danger">
    {{ count }}
  </span>

  <teleport to="body">
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:20000">

      <transition-group name="slide-up" tag="div" class="d-flex flex-column-reverse gap-2">
        <div v-for="n in notifications" :key="n.id"
             class="toast show bg-white text-dark shadow" role="alert" aria-atomic="true">
          <div class="toast-header">
            <strong class="me-auto">New Request</strong>
            <small>{{ formatTime(n.createdAt) }}</small>
            <button type="button" class="btn-close ms-2 mb-1" @click="dismiss(n.id)"></button>
          </div>
          <div class="toast-body">
            {{ n.summary || ('New request ' + (n.requestId ?? '')) }}
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { connectWs, disconnectWs } from '@/ws'

let nextId = 1
const notifications = ref([])      


const counter = ref(Number(localStorage.getItem("counter") || 0))

function onNewRequest(payload){
  console.log(payload)
  
  const n = {
    id: nextId++,
    requestId: payload?.requestId,
    summary: payload?.summary,
    createdAt: new Date()
  }
  notifications.value.unshift(n)
  n._timer = setTimeout(() => dismiss(n.id), 6000)

  if (notifications.value.length > 5) {
    const last = notifications.value.pop()
    if (last?._timer) clearTimeout(last._timer)
  }


  counter.value++
  localStorage.setItem("counter", String(counter.value))
}

function dismiss(id){
  const i = notifications.value.findIndex(n => n.id === id)
  if (i !== -1) {
    const n = notifications.value[i]
    if (n._timer) clearTimeout(n._timer)
    notifications.value.splice(i, 1)
  }
}


const count = computed(() => counter.value)

function formatTime(d){
  const diff = (Date.now() - d.getTime())/1000
  if (diff < 60) return 'just now'
  const m = Math.floor(diff/60)
  return `${m}m ago`
}

function getToken(){ return localStorage.getItem('auth_token') || '' }

onMounted(() => connectWs(getToken, onNewRequest))
onBeforeUnmount(() => disconnectWs())
</script>


<style>

.slide-up-enter-from, .slide-up-leave-to { transform: translateY(12px); opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all .18s ease; }


.toast, .toast-body { color:#212529; }
.toast { z-index: 20000; }
</style>
