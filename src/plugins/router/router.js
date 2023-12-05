import Vue from 'vue';
import Router from 'vue-router';
import OidcCallback from '../../templates/views/OidcCallback.vue';
import OidcPopupCallback from '../../templates/views/OidcPopupCallback.vue';
import OidcCallbackError from '../../templates/views/OidcCallbackError.vue';
import OidcSilentRenew from '../../templates/views/OidcSilentRenew.vue';
import { vuexOidcCreateRouterMiddleware } from 'vuex-oidc';
import store from '@/plugins/store/store';
import { $DialogService } from '../../services/dialog.service';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../../templates/views/Home.vue'),
      meta: { isPublic: true }
    },

    // Меню
    {
      path: '/requests',
      name: 'requests',
      component: () => import('../../templates/views/Requests.vue'),
      meta: { isPublic: false, authorize: [] }
    },
    {
      path: '/dictionaries',
      name: 'dictionaries',
      component: () => import('../../templates/views/Dictionaries.vue'),
      meta: { isPublic: false, authorize: ['fs_admin', 'fs_object_analyst'] }
    },
    /*
        {
            path: '/users',
            name: 'users',
            component: () => import('../../templates/views/Users.vue'),
            meta: { isPublic: false, authorize: ['fs_admin', 'fs_object_analyst'] }
        },
        */

    // Отдельные страницы
    {
      path: '/request',
      name: 'request',
      component: () => import('../../templates/views/Request.vue'),
      meta: { isPublic: false, authorize: [] }
    },

    // Колбэки сервера авторизации
    {
      path: '/callback',
      name: 'oidcCallback',
      component: OidcCallback,
      meta: { isPublic: true }
    },
    {
      path: '/oidc-popup-callback', //Этот адрес нужно внести в настройки сервера авторизации для реализации
      name: 'oidcPopupCallback',
      component: OidcPopupCallback
    },
    {
      path: '/silent-renew',
      name: 'oidcSilentRenew',
      component: OidcSilentRenew
    },
    {
      path: '/oidc-callback-error', // Этот адрес нужно внести в настройки сервера авторизации для реализации
      name: 'oidcCallbackError',
      component: OidcCallbackError
    }
  ]
});

router.beforeEach(vuexOidcCreateRouterMiddleware(store, 'oidcStore'));
router.beforeEach((to, from, next) => {
  const { authorize } = to.meta;
  const currentUser = store.state.oidcStore.user;

  if (authorize) {
    if (!currentUser) {
      // Редирект неавторизованного пользователя
      $DialogService.showWarning('Вы не вошли в аккаунт');
      return next({ path: '/' });
    }

    if (authorize.length) {
      let roleFound = false;

      if (currentUser.role) {
        for (let i = 0; i < authorize.length; i++) {
          let requiredRole = authorize[i];
          if (currentUser.role.includes(requiredRole)) {
            roleFound = true;
          }
        }
      }

      if (!roleFound) {
        $DialogService.showError('Недостаточно прав');
        return next({ path: '/' });
      }
    }
  }

  next();
});

export default router;
