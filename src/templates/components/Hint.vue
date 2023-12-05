<template>
  <span class="hint__wrapper">
    <transition name="fade">
      <div class="hint" v-show="showHint">
        {{ message }}
      </div>
    </transition>

    <img
      src="icons/Circle-question.svg"
      @mouseover="showHint = true"
      @mouseleave="showHint = false"
    />
  </span>
</template>

<script>
export default {
  name: 'Hint',
  props: {
    message: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      showHint: false
    };
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';

.hint {
  position: absolute;
  z-index: 10;

  top: -30px;
  left: 40px;

  width: 300px;

  background-color: white;
  border: 1px solid $colorGray3;
  border-radius: 4px;
  padding: 10px 15px;

  &__wrapper {
    flex: 0 0;
    position: relative;
    margin-left: 5px;
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
