<!-- Сюда мы будем переходить после авторизации через всплывающее окно (если реализуем) -->
<template>
  <div></div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'OidcPopupCallback',

  methods: {
    ...mapActions('oidcStore', ['oidcSignInPopupCallback'])
  },

  created() {
    this.oidcSignInPopupCallback().catch(err => {
      console.error(err);
    });
  }
};
</script>
