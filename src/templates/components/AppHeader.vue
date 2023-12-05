<template>
  <div class="header">
    <div class="header__logo">
      <app-logo secondary></app-logo>
    </div>
    <div class="header__divider"></div>
    <div class="header__user">
      <signed-in-user></signed-in-user>
    </div>
    <div class="header__buttons">
      <a
        v-if="oidcIsAuthenticated"
        class="btn btn-transparent btn-grey"
        @click.prevent="signOut"
      >
        <img left src="icons/Sign-out.svg" />
        <span>Выйти</span>
      </a>
      <a v-else class="btn btn-transparent btn-grey" @click.prevent="signIn">
        <img left src="icons/Sign-in.svg" />
        <span>Войти</span>
      </a>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import SignedInUser from './SignedInUser';
import AppLogo from './AppLogo';

export default {
  name: 'AppHeader',
  components: { AppLogo, SignedInUser },
  computed: {
    ...mapGetters('oidcStore', ['oidcIsAuthenticated'])
  },

  mounted() {},

  destroyed() {},

  methods: {
    ...mapActions('oidcStore', [
      'authenticateOidc',
      'authenticateOidcPopup', // Через всплывающее окно (не реализовано с их стороны, нужна ссылка)
      'removeOidcUser',
      'signOutOidcSilent'
    ]),

    signOut: function() {
      this.removeOidcUser().then(() => {
        this.signOutOidcSilent().then(() => {
          this.$router.push('/');
        });
      });
    },

    signIn: function() {
      this.authenticateOidc();
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';

.header {
  display: flex;
  justify-content: center;
  align-items: center;

  height: 64px;
  padding: 0 15px;

  &__logo {
    flex: 0 0;
  }

  &__user {
    flex: 0 0 auto;
  }

  &__buttons {
    flex: 0 0 auto;
    margin-left: 20px;
  }

  &__divider {
    flex: 1 0 auto;
  }
}
</style>
