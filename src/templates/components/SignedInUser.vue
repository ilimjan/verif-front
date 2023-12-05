<template>
  <div class="user" v-if="oidcUser">
    {{ oidcUser.given_name }}
    {{ oidcUser.middle_name }}
    {{ oidcUser.family_name }}
  </div>
  <div class="user user--empty" v-else>
    Вы не вошли в систему
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'SignedInUser',

  computed: {
    ...mapGetters('oidcStore', [
      'oidcIsAuthenticated',
      'oidcAuthenticationIsChecked',
      'oidcUser',
      'oidcIdToken',
      'oidcIdTokenExp'
    ])
  },

  methods: {
    ...mapActions('oidcStore', ['authenticateOidcSilent', 'removeOidcUser'])
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';

.user {
  color: $colorText;
  font-size: $fontSizeDefault;

  &--empty {
    color: $colorGray3;
  }
}
</style>
