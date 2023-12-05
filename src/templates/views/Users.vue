<template>
  <div v-if="oidcIsAuthenticated"></div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Users',

  data() {
    return {};
  },

  computed: {
    ...mapGetters('oidcStore', ['oidcIsAuthenticated'])
  }
};
</script>
