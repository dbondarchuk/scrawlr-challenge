import { createApp, h } from 'vue';
import './style.css';
import App from './App.vue';
import router from '@/router';

import BootstrapVue3 from 'bootstrap-vue-3';
import { BToastPlugin } from 'bootstrap-vue-3';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';

import './icons.js';

// 5. Create and mount the root instance.
const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(router);
app.use(BootstrapVue3);
app.use(BToastPlugin);

app.mount('#app');
// Now the app has started!
