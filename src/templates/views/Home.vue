<template>
  <div class="home" style="background-image: url(reo-background.jpg)">
    <!--<h2 class="text--muted">Федеральная схема обращения с твердыми коммунальными отходами</h2>-->
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Home',

  computed: {
    ...mapGetters('oidcStore', ['oidcUser'])
  },

  mounted() {
    if (this.oidcUser) {
      this.$router.push('/requests');
    }
  }
};
</script>

<style scoped lang="scss">
.home {
  height: 60vh;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
</style>
