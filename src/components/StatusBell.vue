<template>
  <span
    v-if="count > 0"
    class="position-absolute translate-middle badge rounded-pill bg-danger"
  >
    {{ count }}
  </span>

  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div v-for="n in items" :key="`status-${n.id}`" class="toast show bg-white text-dark shadow" role="alert" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">{{ n.title }}</strong>
        <small>{{ timeAgo(n.createdAt) }}</small>
        <button type="button" class="btn-close ms-2 mb-1" @click="dismiss(n.id)"></button>
      </div>
      <div class="toast-body">{{ n.summary }}</div>
    </div>
  </div>
</template>

<script setup>
import { useBell } from './useBell.js'

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}
const storedUser = getStoredUser()
const username = storedUser?.username || localStorage.getItem('username') || ''
console.log("From StatusBell "+username)
const { items, count, dismiss, timeAgo } = useBell('status', username)
</script>

<style scoped>
.toast, .toast-body { color:#212529; }
.toast { z-index: 20000; }
</style>
