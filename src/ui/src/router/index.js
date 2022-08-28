import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/views/home/Home.vue';
import Signin from '@/views/auth/signin/Signin.vue';
import Signup from '@/views/auth/signup/Signup.vue';
import TodoNotes from '@/views/todo/TodoNotes.vue';

// 2. Define routes here
const routes = [
  { path: '/', component: Home },
  { path: '/signup', component: Signup },
  { path: '/signin', component: Signin },
  { path: '/todonotes', component: TodoNotes },
];

// 3. Create the router instance and pass the `routes` option
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
});

export default router;
