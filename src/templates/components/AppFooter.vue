<template>
  <div class="footer">
    <div class="footer__logo">
      <app-logo></app-logo>
    </div>
    <div class="footer__divider"></div>
    <div class="footer__version">
      <div class="version">
        v. 1.0.2
      </div>
    </div>
    <div class="footer__divider"></div>
    <div class="footer__copyright">
      © ППК «Российский экологический оператор»
    </div>
  </div>
</template>

<script>
import AppLogo from './AppLogo';
export default {
  name: 'AppFooter',
  components: { AppLogo },
  computed: {},

  mounted() {},

  destroyed() {},

  methods: {}
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';

.footer {
  display: flex;
  justify-content: center;
  align-items: center;

  border-top: 1px solid $colorGray3;

  bottom: 0;
  width: calc(100% - 30px);

  height: 80px;
  padding: 0 15px;

  &__logo {
    flex: 0 0;
  }

  &__copyright {
    flex: 0 0 auto;
  }

  &__version {
    flex: 0 0 auto;
  }

  &__divider {
    flex: 1 0 auto;
  }
}

.version {
  border: 1px solid $colorGray3;
  padding: 7px 16px;
  border-radius: 5px;

  font-weight: bold;
  color: $colorGray4;

  display: flex;
  align-items: center;
}
</style>
