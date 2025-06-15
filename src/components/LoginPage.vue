<template>
  <div class="max-vh-100 d-flex align-items-center justify-content-center bg-gradient">
    <div class="card p-4 shadow-lg w-100" style="max-width: 400px; border-radius: 1rem;margin-top: 50px;">
      <h2 class="text-center mb-4 fw-bold">Login</h2>

      <form @submit.prevent="login" class="py-4">
        <div class="form-group mb-3">
          <label for="username">Username</label>
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-user"></i></span>
            <input
              type="text"
              v-model="username"
              class="form-control"
              id="username"
              placeholder="Type your username"
              required
            />
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="password">Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-lock"></i></span>
            <input
              type="password"
              v-model="password"
              class="form-control"
              id="password"
              placeholder="Type your password"
              required
            />
          </div>
          <div class="text-end mt-1">
            <a href="#" class="small text-decoration-none">Forgot password?</a>
          </div>
        </div>

        <button type="submit" class="btn btn-gradient w-100 mt-3">LOGIN</button>

        <p v-if="error" class="text-danger mt-2 text-center">{{ error }}</p>
      </form>

      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const error = ref('');//reactive promenlivi - real time change
const router = useRouter();

const login = async () => {//ova e demek pomoderno,ama i so method block da koristis isto ke e
  try {
    const res = await axios.post('http://localhost:8081/api/auth/login', {//prakajme POST do kaj so ni e povrzan backendot(JSON format)
      username: username.value,
      password: password.value
    });
    localStorage.setItem('user', JSON.stringify(res.data));
    router.push('/main');
  } catch (err) {
    error.value = err.response?.data || 'Login failed.';
  }
};
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
