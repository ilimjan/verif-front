<template>
  <button @click="toggleOpened()" @focusout="hide()">
    <img v-if="icon" left :src="icon" />
    <span>{{ name }}</span>

    <transition name="fade">
      <div class="button-list" v-if="opened">
        <div
          class="button-list__elem"
          v-for="(action, index) in actions"
          :key="index"
          @click="action.function"
        >
          {{ action.name }}
        </div>
      </div>
    </transition>
  </button>
</template>

<script>
export default {
  name: 'ButtonList',
  props: {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: false
    },
    actions: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      opened: false
    };
  },

  methods: {
    toggleOpened() {
      this.opened = !this.opened;
    },

    hide() {
      this.opened = false;
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';

.button-list {
  filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.05));
  background-color: white;
  border: 1px solid $colorGray1;
  border-radius: 4px;
  position: absolute;

  &__elem {
    font-size: $fontSizeDefault;
    font-weight: normal;
    color: $colorText;
    padding: 10px;
    cursor: pointer;

    &:hover {
      background-color: lighten($colorGray1, 3%);
    }
  }
}
</style>
