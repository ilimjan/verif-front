<template>
  <div
    class="boolean-input"
    :class="{
      'boolean-input--with-text': text,
      'boolean-input--disabled': disabled
    }"
  >
    <select-field-checkbox
      v-if="!hideCheckbox"
      :select-fields-array="selectFieldsArray"
      :select-field-name="selectFieldName"
      :select-field-disable="selectFieldDisable"
    ></select-field-checkbox>

    <div class="boolean-input__text" v-if="text">
      {{ text }}
    </div>

    <div class="boolean-input__value" v-if="nullValue">
      <label class="container">
        <span>
          {{ nullValue }}
        </span>
        <input
          type="radio"
          :checked="valueIs(null) || valueIs(undefined)"
          @click="setValue(null)"
          :disabled="disabled"
        />
        <span class="checkmark"></span>
      </label>
    </div>

    <div class="boolean-input__value">
      <label class="container">
        <span>
          Нет
        </span>
        <input
          type="radio"
          :checked="valueIs(false)"
          @click="setValue(false)"
          :disabled="disabled"
        />
        <span class="checkmark"></span>
      </label>
    </div>

    <div class="boolean-input__value">
      <label class="container">
        <span>
          Да
        </span>
        <input
          type="radio"
          :checked="valueIs(true)"
          @click="setValue(true)"
          :disabled="disabled"
        />
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
</template>

<script>
import SelectFieldCheckbox from './SelectFieldCheckbox';

export default {
  name: 'BooleanInput',
  components: { SelectFieldCheckbox },
  props: {
    selectFieldsArray: {
      type: Array,
      required: false
    },
    selectFieldName: {
      type: String,
      required: false
    },
    selectFieldDisable: {
      type: Boolean,
      required: false
    },
    hideCheckbox: {
      type: Boolean,
      required: false
    },
    value: {
      type: Boolean,
      required: false
    },
    text: {
      type: String,
      required: false
    },
    nullValue: {
      type: String,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    }
  },

  data() {
    return {
      tempValue: undefined
    };
  },

  mounted() {
    if (!this.nullValue) {
      this.tempValue = !!this.value;
    } else {
      this.tempValue = this.value;
    }
  },

  watch: {
    value() {
      this.tempValue = this.value;
    },

    tempValue() {
      this.$emit('input', this.tempValue);
    }
  },

  methods: {
    setValue(value) {
      this.tempValue = value;
    },

    valueIs(value) {
      return this.tempValue === value;
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/vars.scss';

.boolean-input {
  display: flex;
  align-items: center;
  min-height: $heightInput;

  &--with-text {
    margin-top: 18px;
  }

  &__text {
    flex: 1 0;
    font-size: $fontSizeDefault;
    color: $colorGray6;
  }

  &__value {
    &:not(:first-child) {
      margin-left: 50px;
    }

    .container {
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;

      position: relative;
      padding-left: 36px;
      cursor: pointer;
      font-size: $fontSizeDefault;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;

      input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
      }

      &:hover input ~ .checkmark {
        background-color: lighten($colorSecondary, 30%);
      }

      input:checked ~ .checkmark:after {
        display: block;
      }

      input[disabled] ~ .checkmark:after {
        background: $colorGray3;
      }

      input[disabled] ~ .checkmark {
        border: 2px solid $colorGray3;
        background-color: transparent;
      }

      .checkmark {
        background-color: white;
        border: 2px solid $colorSecondary;

        position: absolute;
        top: 0;
        left: 0;
        height: 26px;
        width: 26px;
        border-radius: 50%;

        &::after {
          content: '';
          position: absolute;
          display: none;

          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: $colorSecondary;
        }
      }
    }
  }
}
</style>
