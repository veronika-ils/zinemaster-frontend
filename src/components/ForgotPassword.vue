<template>
  <div class="d-flex align-items-center justify-content-center" style="height: 80vh;">
    <div class="container p-4 shadow rounded" style="max-width: 500px; width: 100%;">
    <h2 class="mb-3">Заборавена лозинка</h2>
    <p>Внесете го вашето корисничко име и ќе ви испратиме линк за промена на лозинката.</p>

    <div class="mb-3">
      <label for="username" class="form-label">Корисничко име</label>
      <input type="text" v-model="username" class="form-control" id="username" required />
    </div>

    <button class="btn btn-primary" @click="requestReset" :disabled="isSending">
      {{ isSending ? 'Се испраќа...' : 'Испрати линк за промен' }}
    </button>

    <div class="mt-3 text-success" v-if="message">{{ message }}</div>
  </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const message = ref('')
const isSending = ref(false)

const requestReset = async () => {
  isSending.value = true
  try {
    const res = await fetch('http://localhost:8081/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value })
    })

    const result = await res.text()
    message.value = result
  } catch (error) {
    console.error(error)
    message.value = 'Настана грешка при испраќањето на барањето.'
  } finally {
    isSending.value = false
  }
}
</script>
