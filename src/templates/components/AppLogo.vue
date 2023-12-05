<template>
  <div class="logo__wrapper">
    <div
      class="logo__wrapper--img logo"
      :style="`background-image: url(${secondary ? 'logo-secondary.svg' : 'logo-black.svg'})`"
      @click="navigateToHome"
    ></div>
    <div class="logo__wrapper--info">
      Федеральная схема обращения с твердыми коммунальными отходами
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppLogo',
  props: {
    secondary: {
      type: Boolean,
      required: false
    }
  },

  computed: {},

  mounted() {},

  destroyed() {},

  methods: {
    navigateToHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';

.logo__wrapper {
  flex: 0 0;

  display: flex;
  justify-content: center;
  align-items: center;

  &--img {
    cursor: pointer;
  }

  &--info {
    color: $colorGray5;
    border-left: 1px solid $colorGray5;
    font-size: $fontSizeSmall;
    width: 240px;
    text-align: left;
    margin-left: 15px;
    padding-left: 15px;
  }
}

.logo {
  //width: 38px;
  //background-image: url('/logo.svg');
  width: 165px;
  height: 38px;
  background-size: cover;
}
</style>
