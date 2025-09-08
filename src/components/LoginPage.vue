<template>
  <div class="max-vh-100 d-flex align-items-center justify-content-center bg-gradient">
    <div class="card p-4 shadow-lg w-100" style="max-width: 400px; border-radius: 1rem;margin-top: 50px;">
      <h2 class="text-center mb-4 fw-bold">Login</h2>

      <form @submit.prevent="login" class="py-4">
        <div class="form-group mb-3">
          <label for="username">Корисничко име</label>
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-user"></i></span>
            <input
              type="text"
              v-model.trim="form.username" 
              class="form-control"
              id="username" placeholder="Type your username" required />
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="password">Лозинка</label>
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-lock"></i></span>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              class="form-control"
              id="password" placeholder="Type your password" required />
            <span class="input-group-text" @click="showPassword = !showPassword" style="cursor: pointer;">
  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
</span>

          </div>
          <div class="text-end mt-1">
            <router-link to="/forgot-password" class="small text-decoration-none">Заборавена Лозинка?</router-link>

          </div>
        </div>

        <button type="submit" class="btn btn-gradient w-100 mt-3">LOGIN</button>
        <div class="text-center mt-3">
  
  <button type="button" class="btn btn-danger w-100" @click="loginWithGoogle">
    <i class="fab fa-google me-2"></i> Login with Google
  </button>
</div>

        <p v-if="error" class="text-danger mt-2 text-center">{{ error }}</p>
      </form>

      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

import { reactive } from 'vue';


const loginWithGoogle = async () => {
  try {
  
  window.location.href = "http://localhost:8081/oauth2/authorization/google"; 
  } catch (err) {
    console.error("Google login failed", err);
  }
};

const username = ref('');
const password = ref('');
const error = ref('');//reactive promenlivi - real time change
const router = useRouter();
const showPassword = ref(false);


const form = reactive({ username: '', password: '' });

async function login() {
  const payload = {
    username: form.username?.trim(),
    password: form.password
  };
  console.log('Login payload:', payload); 
  try {
    const { data } = await axios.post('http://localhost:8081/api/auth/login', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
        localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.replace("/main")
  } catch (e) {
    console.log('Login failed body:', e.response?.data); 
  }
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #00c9ff, #92fe9d, #e85dff);
}
.btn-gradient {
  background: linear-gradient(to right, #00c9ff, #e85dff);
  color: white;
  border: none;
  font-weight: bold;
  transition: 0.3s ease;
}
.btn-gradient:hover {
  opacity: 0.9;
}

</style>
