<template>
  <div id="app" class="app">
    <div class="app__header">
      <app-header></app-header>
    </div>

    <div class="app__menu" v-if="showMenu">
      <router-link to="/requests">Анкеты-заявки</router-link>
      <router-link to="/dictionaries" v-if="isAdmin">Справочники</router-link>
      <!--
            <router-link to="/users">Пользователи</router-link>
            -->
    </div>

    <div class="app__content">
      <router-view />
    </div>

    <div class="app__footer">
      <app-footer></app-footer>
    </div>

    <system-messages></system-messages>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import AppHeader from './templates/components/AppHeader';
import AppFooter from './templates/components/AppFooter';
import SystemMessages from './templates/components/SystemMessages';
import store from '../src/plugins/store/store';

export default {
  name: 'App',
  components: { SystemMessages, AppFooter, AppHeader },
  computed: {
    ...mapGetters('oidcStore', ['oidcIsAuthenticated', 'oidcUser']),

    showMenu: function() {
      return this.oidcIsAuthenticated && this.$route.path !== '/request';
    },

    isAuthenticated: function() {
      return store.state.referenceStore.referenceLoaded;
    },

    isAdmin: function() {
      return (
        this.oidcUser &&
        this.oidcUser.role &&
        (this.oidcUser.role.includes('fs_admin') ||
          this.oidcUser.role.includes('fs_object_analyst'))
      );
    }
  },

  watch: {
    oidcIsAuthenticated: function(isAuthenticated) {
      if (isAuthenticated && !this.isAuthenticated) {
        store.dispatch('loadAllReferences');
      }
    }
  },

  methods: {}
};
</script>

<style scoped lang="scss">
@import 'assets/style/vars.scss';

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__header {
    z-index: 0;
    box-shadow: 0 7px 7px rgba(130, 121, 121, 0.15);
  }

  &__menu {
    display: flex;
    align-items: center;
    padding: 0 15px;

    height: 64px;
    background-color: white;
    z-index: 1;
    box-shadow: 0 7px 7px rgba(130, 121, 121, 0.15);

    a {
      display: flex;
      justify-content: center;
      align-items: center;

      color: $colorText;
      font-size: $fontSizeDefault;
      border-bottom: 2px solid white;

      height: 100%;
      padding: 0 20px;

      text-decoration: none;

      &:hover {
        background-color: lighten($colorSecondary, 48%);
        border-bottom: 2px solid lighten($colorSecondary, 48%);
        color: $colorSecondary;
      }

      &:active {
        background-color: lighten($colorSecondary, 50%);
        border-bottom: 2px solid lighten($colorSecondary, 50%);
        color: $colorSecondary;
      }

      &.router-link-exact-active {
        border-bottom: 2px solid $colorSecondary;
        color: $colorSecondary;
      }
    }
  }

  &__content {
    padding: 40px 15px;
  }

  &__footer {
    // "Sticky footer"
    flex: 1 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
}
</style>
