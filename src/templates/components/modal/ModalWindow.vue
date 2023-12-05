<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div :class="{ modal: true, fullDisplay: fullDisplay }">
          <div class="modal__header">
            <span class="modal__header--title">
              <slot name="header">
                Заголовок
              </slot>
            </span>
            <img
              src="icons/Close.svg"
              height="24"
              width="24"
              @click="$emit('close')"
            />
          </div>
          <div class="modal__body">
            <slot name="body"> </slot>
          </div>
          <div class="modal__footer">
            <slot name="footer">
              <button
                class="btn btn-lg btn-solid btn-grey"
                @click="$emit('close')"
              >
                <span>Отменить</span>
              </button>

              <button
                class="btn btn-lg btn-solid btn-primary"
                @click.prevent="$emit('apply')"
              >
                <span>Применить</span>
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ModalWindow',
  props: {
    fullDisplay: {
      type: Boolean,
      required: false
    }
  },

  data() {
    return {};
  },

  computed: {},

  mounted() {},

  destroyed() {},

  methods: {}
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/modal.scss';
.modal.fullDisplay {
  min-width: 555px;
  @media screen and (min-width: 768px) {
    min-width: 888px;
  }
}
</style>
