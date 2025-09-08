import http from '@/api'
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';


const app = createApp(App)             
app.config.globalProperties.$http = http
app.use(router)
app.mount('#app')  
const params = new URLSearchParams(window.location.search)
const tok = params.get('token')
if (tok) {
  localStorage.setItem('auth_token', tok)
  const url = new URL(window.location.href)
  url.searchParams.delete('token')
  window.history.replaceState({}, '', url.toString())
}
