import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueLoaders from 'vue-loaders';
import VueToast from 'vue-toast-notification';
import VueTimers from 'vue-timers';
import vuetify from './plugins/vuetify';

import 'vue-loaders/dist/vue-loaders.css';
import 'vue-toast-notification/dist/theme-sugar.css';

Vue.config.productionTip = false;

Vue.use(VueLoaders);
Vue.use(VueToast);
Vue.use(VueTimers);

function setupFilters() {
  Vue.filter('price', (value) => {
    if (isNaN(value)) {
      return value;
    } else {
      if (value < 0.01) {
        // Small prices
        return '$' + Number(value).toFixed(6);
      } else {
        return new Intl.NumberFormat(
          'en-US',
          {
            style: 'currency',
            currency: 'USD',
          }
        ).format(value);
      }
    }
  });

  Vue.filter('price-bn', (value) => {
    if (isNaN(value)) {
      return value;
    } else {
      if (value < 0.01) {
        return Number(value).toFixed(6);
      } else {
        return Number(value).toFixed(2);
      }
    }
  });
  
  Vue.filter('tx', function (value) {
    if (!value) return '';
    return value.substr(0, 6) + "..." + value.substr(value.length - 6);
  });
}

setupFilters();

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app');
