<template>
  <div></div>
</template>

<script>
/**
 * Авторирует пользователя в фоне (если на сервере авторизации уже есть сессия)
 */
import 'core-js/fn/promise';
import { vuexOidcProcessSilentSignInCallback } from 'vuex-oidc';
import store from '@/plugins/store/store';

export default {
  name: 'SilentRenew',

  mounted() {
    store.dispatch('systemMessages/addInfo', 'Test silent renew');
    vuexOidcProcessSilentSignInCallback();
  }
};
</script>

<style scoped></style>
