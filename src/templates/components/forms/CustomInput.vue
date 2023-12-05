<template>
  <div
    class="custom-input__wrapper"
    :class="{ 'no-select-field': !selectFieldsArray || !selectFieldName }"
  >
    <select-field-checkbox
      v-if="!hideCheckbox"
      :select-fields-array="selectFieldsArray"
      :select-field-name="selectFieldName"
      :select-field-disable="selectFieldDisable"
    ></select-field-checkbox>
    <div v-if="type === 'date' || type === 'month' || type === 'datetime'">
      <date-picker
        v-model="tempValue"
        value-type="timestamp"
        :format="customDate()"
        :type="type"
        :class="{ error: isError }"
        @blur="onFocusOut()"
        :disabled="disabled"
        :disabled-date="disabledDate"
        :confirm="customConfirm()"
      ></date-picker>
    </div>
    <div v-else-if="type === 'textarea'">
      <textarea
        class="inp inp-block"
        :class="{ error: isError }"
        v-model="tempValue"
        @focusout="onFocusOut()"
        :disabled="disabled"
        :placeholder="placeholder ? placeholder : ''"
      ></textarea>
    </div>
    <div
      v-else
      class="custom-input"
      :class="{ 'custom-input--with-text': text || action }"
    >
      <loader :loading="loading"></loader>

      <div class="custom-input__input">
        <input
          :type="type"
          class="inp inp-block"
          :class="{ 'inp-search': search, error: isError, 'search-field': isSearchField }"
          :style="search ? 'background-image: url(icons/Search.svg)' : ''"
          :placeholder="placeholder ? placeholder : ''"
          @focus="setFocused(true)"
          @blur="setFocused(false)"
          v-model="tempValue"
          :disabled="disabled"
          @focusout="onFocusOut()"
          ref="input"
          min="0"
          :max="max"
          :step="integer ? 1 : 0.1"
          :maxlength="maxLength"
          v-mask="
            type === 'phone'
              ? '+7 (###) ### ## ##'
              : type === 'phone2'
              ? '+7 (###) #######'
              : undefined
          "
          @input="type === 'number' ? numberLengthControl() : undefined"
        />
        <div
          class="autocomplete--clear"
          v-if="type === 'text' && tempValue && !disabled"
          @click.prevent="setValue('')"
        >
          <img src="icons/Close-dark.svg" />
        </div>
      </div>
      <button v-if="text" type="button" class="inp inp-block" disabled>
        {{ text }}
      </button>
      <button
        v-if="action"
        type="button"
        class="inp inp-block"
        :disabled="disabled"
        @click.stop="$emit('action')"
      >
        <img :src="action" />
      </button>
      <div class="autocomplete" v-if="values && focused && values.length">
        <div
          v-for="result in values"
          :key="result"
          class="autocomplete__elem"
          @click="setValue(result)"
        >
          {{ result }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/locale/ru';
import store from '../../../plugins/store/store';
import Loader from '../Loader';
import SelectFieldCheckbox from './SelectFieldCheckbox';

export default {
  name: 'CustomInput',
  components: { SelectFieldCheckbox, Loader, DatePicker },

  props: {
    isSearchField: {
      type: Boolean,
      required: false
    },
    isErrorProp: {
      type: Boolean,
      required: false
    },
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
    // Не нужен
    // TODO: избавиться если будет время
    hideCheckbox: {
      type: Boolean,
      required: false
    },
    type: {
      type: String,
      required: true
    },
    value: {
      required: false
    },
    values: {
      type: Array,
      required: false
    },
    search: {
      type: Boolean,
      required: false
    },
    action: {
      type: String,
      required: false
    },
    text: {
      type: String,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    disabledDate: {
      type: Function,
      required: false
    },
    required: {
      type: Boolean,
      required: false
    },
    propDirty: {
      type: Boolean,
      required: false
    },
    placeholder: {
      type: String,
      required: false
    },
    max: {
      type: Number,
      required: false
    },
    integer: {
      type: Boolean,
      required: false
    },
    maxLength: {
      type: Number,
      required: false
    },
    fraction: {
      type: Number,
      required: false
    },
    whole: {
      type: Number,
      required: false
    },
    len: {
      type: Number,
      required: false
    }
  },

  data() {
    return {
      tempValue: undefined,
      focused: false,
      isDirty: false
    };
  },

  computed: {
    isError: function() {
      if (this.isErrorProp) {
        return true;
      }

      /*
                if (this.type === 'phone') {
                    let mask = /^[+][7][ ][(][0-9]{3}[)][0-9]{7}$/; // +7 (хххх)ххххххх
                    return !mask.test(this.value);
                }

                if (this.type === 'mobile') {
                    let mask = /^[+][7][ ][(][0-9]{3}[)][ ][0-9]{3}[ ][-][ ][0-9]{2}[ ][-][ ][0-9]{2}$/; // +7 (ххх) ххх - хх - хх
                    return !mask.test(this.value);
                }
                */

      if (this.type === 'email' && this.tempValue) {
        const isEmail = !!this.tempValue.match(/[\w.-]+@[\w.-]+\.[a-z]{2,3}$/);
        if (!isEmail) {
          return true;
        }
      }

      if (
        (this.propDirty || this.isDirty || this.storeDirty) &&
        this.required
      ) {
        return !this.tempValue && this.tempValue !== 0;
      }

      return false;
    },

    // hasError: function () {
    //
    //     if (!this.tempValue) {
    //         return false;
    //     }
    //
    //     if (this.len) {
    //         let mask = new RegExp('^[0-9]{' + this.len + '}$')
    //         return !mask.test(this.tempValue);
    //     }
    //
    //     if (this.maxLength && this.type !== 'number' && this.tempValue) {
    //         return this.tempValue.length > this.maxLength;
    //     }
    //
    //     if (this.fraction && this.whole && this.whole > this.fraction) {
    //         let mask = new RegExp('^[0-9]{1,' + (this.whole - this.fraction) + '}([.,][0-9]{1,' + this.fraction + '})?$');
    //         return !mask.test(this.tempValue);
    //     }
    //
    //     if (this.fraction && this.whole && this.whole <= this.fraction) {
    //         let mask = new RegExp('^[0-9]{1,' + this.whole + '}([.,][0-9]{1,' + this.fraction + '})?$');
    //         return !mask.test(this.tempValue);
    //     }
    //
    //     return false;
    // },

    storeDirty() {
      return store.state.validationStore.validationEnabled;
    }
  },

  mounted() {
    this.tempValue = this.value;

    // нельзя вводить отризацтельные числа
    if (this.type === 'number' && this.$refs.input) {
      this.$refs.input.onkeydown = function(e) {
        // запрещаем вводить минус
        if (e.keyCode === 189) {
          return false;
        }
      };
    }

    const titleElement = this.$el.parentElement.querySelector(
      '.form-elem__title'
    );
    if (titleElement && this.required) {
      titleElement.classList.add('required');
    }
  },

  watch: {
    tempValue() {
      // при вводе 123. tempValue становится равно '' и инпут сбрасывается на 0
      if (this.tempValue === '') {
        this.tempValue = null;
      }

      if (this.integer && this.tempValue !== null) {
        this.tempValue = Math.floor(this.tempValue);
      }
      this.$emit('input', this.tempValue);
    },

    value(newValue) {
      this.tempValue = newValue;
    },

    isError(isError) {
      const titleElements = this.$el.parentElement.querySelectorAll(
        '.form-elem__title'
      );
      if (titleElements && titleElements.length) {
        if (isError) {
          titleElements.forEach(titleElement => {
            titleElement.classList.add('error');
          });
        } else {
          titleElements.forEach(titleElement => {
            titleElement.classList.remove('error');
          });
        }
      }

      /*
                if (this.type === 'mobile' || this.type === 'phone') {
                    const prompt = this.$el.parentElement.querySelectorAll('.prompt');
                    if (!isError) {
                        prompt.forEach(titleElement => {
                            titleElement.classList.add('form-elem__prompt_hidden');
                        });
                    } else {
                        prompt.forEach(titleElement => {
                            titleElement.classList.remove('form-elem__prompt_hidden');
                        });
                    }
                }
                */
    }
  },

  methods: {
    customConfirm() {
      switch (this.type) {
        case 'datetime':
          return true;
        case 'month':
          return false;
      }

      return false
    },
    customDate() {
      switch (this.type) {
        case 'datetime':
          return 'DD.MM.YYYY hh:mm dd';
        case 'month':
          return 'MM.YYYY';
      }

      return 'DD:MM:YYYY';
    },
    numberLengthControl() {
      if (this.fraction !== undefined && this.whole !== undefined) {
        if (
          (this.tempValue.indexOf('.') !== -1 ||
            this.tempValue.indexOf(',') !== -1) &&
          this.fraction !== 0
        ) {
          // если ввели дробную часть
          let commaIndex =
            this.tempValue.indexOf('.') !== -1
              ? this.tempValue.indexOf('.')
              : this.tempValue.indexOf(',');

          // если не ввели цифру перед дробной частью
          if (commaIndex === 0) {
            this.tempValue = 0 + this.tempValue;
          }
          // если написали много цифр в целой части
          if (commaIndex < this.whole) {
            this.tempValue =
              this.tempValue.slice(0, commaIndex) +
              this.tempValue.slice(commaIndex);
          }
          // если написали много цифр в дробной части
          if (this.tempValue.length - commaIndex - 1 > this.fraction) {
            this.tempValue = this.tempValue.slice(0, -1);
          }
        } else {
          // если ввели только целую часть
          if (this.tempValue.length > this.whole) {
            this.tempValue = this.tempValue.slice(0, -1);
          }
        }
      }
    },
    onFocusOut() {
      this.isDirty = true;
    },

    setValue(value) {
      this.tempValue = value;
      this.value = this.tempValue;
    },

    setFocused(value) {
      // Хак чтобы сразу не скрывалось
      setTimeout(() => {
        this.focused = value;
      }, 100);
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/vars.scss';

.custom-input {
  flex: 1 0;
  position: relative;

  &__wrapper {
    display: flex;
    width: 100%;

    div:not(.select-field-checkbox) {
      // not select-field-checkbox
      flex: 1 0 auto;
    }
  }

  &__wrapper.no-select-field {
    div {
      flex: 1 0 auto;
    }
  }

  &__input {
    position: relative;
  }

  &--with-text {
    display: flex;

    .custom-input__input {
      flex: 1 0 auto;
    }

    input {
      border-right: none;
      border-radius: 5px 0 0 5px;
    }

    button {
      width: auto;
      height: 40px;
      padding: 0 10px;
      border-radius: 0 5px 5px 0;
      border-left: none;
      color: $colorGray6;
      background-color: $colorGray1;

      &:not([disabled]) {
        background-color: lighten($colorGray1, 4%);
        cursor: pointer;

        &:hover {
          background-color: lighten($colorGray1, 2%);
        }

        &:active {
          background-color: $colorGray1;
        }
      }

      &:disabled {
        background-color: lighten($colorGray3, 15%) !important;
      }
    }
  }
}

.autocomplete {
  position: absolute;
  z-index: 5;
  background-color: white;
  width: 100%;
  border-radius: 4px;
  filter: drop-shadow(0px 0px 27px rgba(130, 121, 121, 0.15));

  &__elem {
    font-size: $fontSizeDefault;
    padding: 15px;
    cursor: pointer;

    &:hover {
      background-color: $colorGray1;
    }
  }

  &--clear {
    z-index: 9;
    position: absolute;
    top: 8px;
    right: 10px;
    background-color: $colorGray3;
    cursor: pointer;

    border-radius: 50%;
    height: 24px;
    width: 24px;

    display: flex;
    justify-content: center;
    align-items: center;

    img {
      height: 20px;
      width: 20px;
    }

    &:hover {
      background-color: $colorGray1;
    }

    &[hidden] {
      display: none;
    }
  }
}

input.error {
  border-color: $colorErrorHover;
}

textarea.error {
  border-color: $colorErrorHover;
}

.errorMsg {
  margin-top: 5px;
  margin-left: 10px;
  color: red;
  visibility: hidden;

  &__show {
    visibility: visible;
  }
}
</style>
