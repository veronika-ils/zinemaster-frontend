import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/LoginPage.vue'; 
import Main from '../components/MainPage.vue';
import Requests from '../components/AllRequests.vue'; 
import Profile from '../components/ProfilePage.vue';
import ManageUsers from '@/components/ManageUsers.vue';
import ForgotPassword from '@/components/ForgotPassword.vue';
import ResetPassword from '@/components/ResetPassword.vue';
import ProductDetails from '@/components/ProductDetails.vue';
import OAuth2Callback from '../components/OAuth2Callback.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/main', component: Main },
  { path: '/requests', component: Requests },
  { path: '/profile', component: Profile },
  { path: '/manage-users', component: ManageUsers},
  { path: '/forgot-password', component: ForgotPassword},
  { path: '/reset-password', component: ResetPassword},
  { path: '/products/:id', component: ProductDetails, props: true },
  { path: '/oauth2/callback', component: OAuth2Callback }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

