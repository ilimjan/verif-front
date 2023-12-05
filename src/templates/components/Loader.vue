<template>
  <transition name="fade">
    <div
      class="loader"
      :class="{ 'loader--fullscreen': fullscreen }"
      v-if="loading"
    >
      <div class="loader--text"></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Loader',
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    fullscreen: {
      type: Boolean,
      required: false
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';

@-webkit-keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1000;

  display: flex;
  justify-content: center;
  align-items: center;

  &--fullscreen {
    position: fixed !important;
  }

  &--text,
  &--text:after {
    border-radius: 50%;
    width: 5em;
    height: 5em;
  }
  &--text {
    margin: 60px auto;
    font-size: 10px;
    position: relative;
    text-indent: -9999em;
    border-top: 1.1em solid lighten($colorSecondary, 30%);
    border-right: 1.1em solid lighten($colorSecondary, 30%);
    border-bottom: 1.1em solid lighten($colorSecondary, 30%);
    border-left: 1.1em solid $colorSecondary;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation: load8 1.1s infinite linear;
    animation: load8 1.1s infinite linear;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
