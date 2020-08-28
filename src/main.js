import Vue from 'vue';
import VueApollo from 'vue-apollo';
import { mapGetters } from 'vuex';

import store from '@/store';
import { ACCESS_GROUP_TYPES } from '@/view_models/AccessGroupViewModel';
import FluentComponent from '@/components/Fluent.vue';
import App from './App.vue';
import DPRouter from './router';
import Fluent from './assets/js/fluent';
import { apolloProvider } from './server';
import { Api } from '@/assets/js/access-groups-api.js';

// polyfill/fallback adapted from MDN (https://developer.mozilla.org/en-US/docs/Web/API/Background_Tasks_API#Falling_back_to_setTimeout)
window.requestIdleCallback =
  window.requestIdleCallback ||
  ((handler) => {
    const startTime = Date.now();

    return setTimeout(() => {
      handler({
        didTimeout: false,
        timeRemaining() {
          return Math.max(0, 50.0 - (Date.now() - startTime));
        },
      });
    }, 1);
  });

Vue.use(VueApollo);

store.dispatch('setLoading');
// eslint-disable-next-line
Promise.all([
  store.dispatch('features/fetch'),
  store.dispatch('fetchUser'),
  Fluent.init(),
]).then(([features, , fluent]) => {
  const router = new DPRouter(features, fluent, store);
  store.dispatch('completeLoading');

  Vue.component('Fluent', FluentComponent);
  Vue.mixin({
    data() {
      return {
        accessGroupApi: new Api(),
        administratorEmail: 'fiji@mozilla.com',
      };
    },
    computed: {
      ...mapGetters({
        getFeature: 'features/get',
      }),
      scope() {
        return this.$store.state.scope;
      },
    },
    methods: {
      fluent(...args) {
        return fluent.get(...args);
      },
      // Currently only works with one variable replace
      tinyNotification(fluentSelector, args = '') {
        this.$root.$emit('toast', {
          content: this.fluent('tiny-notification', fluentSelector).replace(
            '[]',
            args,
          ),
        });
      },
      tinyNotificationError(message) {
        this.$root.$emit('toast', {
          error: true,
          content: message,
        });
      },
    },
  });
  new Vue({
    router: router.vueRouter,
    apolloProvider,
    render: (h) => h(App),
    store,
  }).$mount('#app');
});
