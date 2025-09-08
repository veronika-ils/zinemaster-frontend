<template>
  <div class="container mt-5 pt-5 text-center">
    <h3 v-if="errorMessage" class="text-danger">{{ errorMessage }}</h3>
    <p v-else>Signing you in…</p>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import http from '@/api'

const router = useRouter()
const route = useRoute()
const errorMessage = ref(null)

onMounted(async () => {
  try {
    
    const tokenFromQuery = route.query.token
    const tokenFromHash  = new URLSearchParams(window.location.hash.slice(1)).get('token')
    const token = tokenFromQuery || tokenFromHash

    console.log('[OAuth2Callback] token from URL:', token)

    if (!token) {
      console.error('No JWT in callback URL; redirecting to login')
      return router.replace('/login')
    }


    localStorage.setItem('auth_token', token)

    const { data } = await http.get('/api/auth/me')  
    localStorage.setItem('user', JSON.stringify(data))

    
    router.replace('/main')
  } catch (e) {
    console.error('OAuth2 callback flow failed:', e)
    localStorage.removeItem('auth_token')
    router.replace('/login')
  }
})

</script>

