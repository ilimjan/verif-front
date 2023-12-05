<template>
  <div class="messages">
    <transition
      name="fade"
      v-for="(message, index) in messages"
      :key="index"
      v-if="new Date().getTime() - message.date.getTime() < 3000"
    >
      <div class="message" :class="'message--' + message.type">
        <img
          v-if="message.type"
          :src="'icons/Circle-' + message.type + '.svg'"
        />
        <span>
          {{ message.text }}
        </span>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'SystemMessages',

  data() {
    return {};
  },

  computed: {
    ...mapGetters('systemMessages', ['messages']),

    filteredMessages: function() {
      return this.messages.filter(message => {
        return new Date().getTime() - message.date.getTime() < 3000;
      });
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';

.messages {
  z-index: 9999;
  position: fixed;
  bottom: 15px;
  right: 15px;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
}

.message {
  display: flex;
  width: fit-content;
  float: right;

  align-items: center;

  padding: 15px 20px;
  border-radius: 4px;
  margin: 5px;

  max-width: 20vw;

  filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.05));

  border: 1px solid $colorGray3;
  background-color: white;
  color: $colorText;

  img {
    margin-right: 10px;
  }

  &--info {
    border: 1px solid $colorSecondary;
    background-color: $colorSecondaryLight;
    color: $colorSecondary;
  }

  &--success {
    border: 1px solid $colorSuccess;
    background-color: $colorSuccessLight;
    color: $colorSuccess;
  }

  &--error {
    border: 1px solid $colorError;
    background-color: $colorErrorLight;
    color: $colorError;
  }

  &--warning {
    border: 1px solid $colorWarning;
    background-color: $colorWarningLight;
    color: $colorWarning;
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
