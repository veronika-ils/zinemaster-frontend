<template>
  <div class="d-flex align-items-center justify-content-center" style="height: 80vh;">
    <div class="container p-4 shadow rounded" style="max-width: 500px; width: 100%;">
    <h2 class="text-center mb-4">Промени Лозинка</h2>

    <div class="form-group mb-3">
  <label for="password">Нова Лозинка</label>
  <div class="input-group">
    <input
      :type="showPassword ? 'text' : 'password'"
      class="form-control"
      id="password" v-model="password" ref="passwordInput" />
    <span class="input-group-text" @click="showPassword = !showPassword" style="cursor: pointer;">
      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
    </span>
  </div>
</div>

    <button @click="submitNewPassword" class="btn btn-primary w-100">
      Промени Лозинка
    </button>

    <p v-if="message" class="mt-3 text-success text-center">{{ message }}</p>
    <p v-if="error" class="mt-3 text-danger text-center">{{ error }}</p>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const password = ref('');
const message = ref('');
const error = ref('');
const token = ref('');
const showPassword = ref(false);


const route = useRoute();

onMounted(() => {
  token.value = route.query.token;//од рутата го земаме токенот
  if (!token.value) {
    error.value = 'Невалиден токен.';
  }
});

const submitNewPassword = async () => {
  try {
    const response = await axios.post('http://localhost:8081/api/auth/reset-password', {
      token: token.value,//tokenot so go zemavme go prakjame
      newPassword: password.value
    });
    message.value = response.data;
    error.value = '';
  } catch (err) {
    error.value = err.response?.data || 'Има грешка.';
    message.value = '';
  }
};
</script>
