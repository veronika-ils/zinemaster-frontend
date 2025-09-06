<template>
  <div class="container mt-5 pt-5 text-center">
    <h3 v-if="errorMessage" class="text-danger">{{ errorMessage }}</h3>
    <p v-else>Signing you in…</p>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const errorMessage = ref(null)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const err = params.get('error')
  const token = params.get('token')

  if (err) {
    if (err === 'no_account_for_email') {
      errorMessage.value = 'No account found for this Google email. Please log in with username/password.'
    } else if (err === 'account_inactive') {
      errorMessage.value = 'Your account is inactive. Please contact support.'
    } else if (err === 'domain_not_allowed') {
      errorMessage.value = 'This Google domain is not allowed.'
    } else {
      errorMessage.value = 'Login failed. Please try again.'
    }
    setTimeout(() => router.replace('/login'), 2500)
    return
  }

  if (token) {
    localStorage.setItem('auth_token', token)

    try {
      const res = await axios.get("http://localhost:8081/api/auth/me", {
  headers: { Authorization: `Bearer ${token}` }
})


      console.log("my data")
      console.log(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      router.replace('/main')
    } catch (e) {
      console.error('Fetching user failed:', e)
      router.replace('/login')
    }
  } else {
    router.replace('/login')
  }
})
</script>

