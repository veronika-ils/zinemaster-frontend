import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/LoginPage.vue'; 
import Main from '../components/MainPage.vue';
import Requests from '../components/AllRequests.vue'; 
import Profile from '../components/ProfilePage.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/main', component: Main },
  { path: '/requests', component: Requests },
  { path: '/profile', component: Profile }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

