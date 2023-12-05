<template>
  <div class="custom-select">
    <select-field-checkbox
      v-if="!hideCheckbox"
      :select-fields-array="selectFieldsArray"
      :select-field-name="selectFieldName"
      :select-field-disable="selectFieldDisable"
    ></select-field-checkbox>

    <loader :loading="loading"></loader>

    <div v-if="multi" class="custom-select__input" :id="'select-' + id">
      <multiselect
        v-model="tempValue"
        :options="multiOptions"
        :searchable="true"
        :close-on-select="true"
        :show-labels="false"
        track-by="value"
        label="value"
        placeholder=""
        multiple
        :class="{ error: isError }"
        :disabled="disabled"
      />
    </div>

    <div v-else-if="multiCheckbox" class="custom-select__input" :id="'select-' + id">
      <b-form-checkbox-group
        v-model="tempValue"
        plain
      >
        <b-form-checkbox
          v-for="option in computedValues.sort((el1, el2) => el1.index - el2.index)"
          :key="option.id"
          :value="option"
        >
          {{ option[displayFieldName] }}
        </b-form-checkbox>
      </b-form-checkbox-group>
    </div>

    <div v-else class="custom-select__input" :id="'select-' + id">
      <input
        type="text"
        v-if="focused"
        class="inp inp-block"
        style="background-image: url('icons/Arrow-grey.svg');"
        v-model="search"
        @focus="setFocused(true)"
        @blur="setFocused(false)"
        @focusout="onFocusOut()"
        :disabled="disabled"
        :class="{ error: isError }"
      />
      <input
        type="text"
        v-if="!focused"
        class="inp inp-block"
        style="background-image: url('icons/Arrow-grey.svg');"
        :value="
          tempValue
            ? typeof tempValue === 'object'
              ? tempValue[displayFieldName]
              : tempValue
            : undefined
        "
        @focus="setFocused(true)"
        @blur="setFocused(false)"
        @focusout="onFocusOut()"
        :disabled="disabled"
        :class="{ error: isError }"
      />
    </div>
    <div
      class="custom-select__values"
      v-if="focused"
      :id="'select_values-' + id"
    >
      <div
        v-for="(option, index) in computedValues.sort((el1, el2) => {
          return el1.index - el2.index;
        })"
        :key="index"
        class="custom-select__value"
        @mousedown="setValue(option)"
      >
        {{ typeof option === 'object' ? option[displayFieldName] : option }}
      </div>
    </div>

    <!-- Вариант с обычным select (поиск по вхождению невозможен)
        <select class="sel sel-outlined sel-block"
                v-model="tempValue"
                @focusout="onFocusOut()"
                :disabled="disabled"
                :class="{'error': isError}">
            <option v-for="(option, index) in computedValues" :key="index"
                    v-bind:value="option"
            >
                {{ typeof option === 'object' ? option[displayFieldName] : option }}
            </option>
        </select>
        -->
  </div>
</template>

<script>
import store from '../../../plugins/store/store';
import Loader from '../Loader';
import SelectFieldCheckbox from './SelectFieldCheckbox';
import { $MathUtils } from '../../../services/utils.service';
import Multiselect from 'vue-multiselect';

export default {
  name: 'CustomSelect',
  components: { Loader, SelectFieldCheckbox, Multiselect },
  props: {
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
    hideCheckbox: {
      type: Boolean,
      required: false
    },
    value: {
      required: false
    },
    hasOtherValue: {
      type: Boolean,
      required: false
    },

    // Одно из двух, referenceType или values
    referenceType: {
      type: String,
      required: false
    },
    values: {
      type: Array,
      required: false
    },

    fieldName: {
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
    required: {
      type: Boolean,
      required: false
    },
    propDirty: {
      type: Boolean,
      required: false
    },
    multi: {
      type: Boolean,
      required: false
    },
    multiCheckbox: {
      type: Boolean,
      required: false
    }
  },

  computed: {
    computedValues: function() {
      if (Array.isArray(this.values) && this.values.length) {
        if (this.hasOtherValue && this.values) {
          return [...this.values, this.otherValue];
        }

        return this.values.filter(v => {
          return (
            !this.search ||
            (typeof v === 'object'
              ? v[this.displayFieldName] &&
                v[this.displayFieldName]
                  .toLowerCase()
                  .includes(this.search.toLowerCase())
              : v.includes(this.search.toLowerCase()))
          );
        });
      }

      if (this.referenceType) {
        const references = store.state.referenceStore.references.get(
          this.referenceType
        );

        if (this.hasOtherValue && references) {
          return [...references, this.otherValue];
        } else if (this.hasOtherValue && !references) {
          return [this.otherValue];
        }

        return references.filter(v => {
          return (
            !this.search ||
            (typeof v === 'object'
              ? v[this.displayFieldName] &&
                v[this.displayFieldName]
                  .toLowerCase()
                  .includes(this.search.toLowerCase())
              : v.includes(this.search.toLowerCase()))
          );
        });
      }

      return [];
    },

    isError: function() {
      if (this.isErrorProp) {
        return true;
      }

      if (
        (this.propDirty || this.isDirty || this.storeDirty) &&
        this.required
      ) {
        return !this.tempValue;
      }

      return false;
    },

    storeDirty() {
      return store.state.validationStore.validationEnabled;
    }
  },

  data() {
    return {
      tempValue: undefined,
      displayFieldName: 'value',
      isDirty: false,
      otherValue: { value: 'Иное' },
      focused: false,
      search: undefined,
      id: undefined,
      multiOptions: []
    };
  },

  mounted() {
    this.id = $MathUtils.randomInt(10000, 100000);
    this.tempValue = this.value;
    if (this.fieldName) {
      this.displayFieldName = this.fieldName;
    }

    setTimeout(() => {
      this.multiOptions = this.computedValues.sort((el1, el2) => {
        return el1.index - el2.index;
      })
    }, 500);

    const titleElement = this.$el.parentElement.querySelector(
      '.form-elem__title'
    );
    if (titleElement && this.required) {
      titleElement.classList.add('required');
    }
  },

  watch: {
    tempValue() {
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
    }
  },

  methods: {
    setValue(value) {
      this.tempValue = value;
    },

    onFocusOut() {
      this.isDirty = true;
    },

    setFocused(value) {
      // Хак чтобы сразу не скрывалось
      setTimeout(() => {
        this.focused = value;

        if (this.focused) {
          this.$nextTick(() => {
            let select = document.getElementById('select-' + this.id);
            let values = document.getElementById('select_values-' + this.id);

            let offsetX =
              select.getBoundingClientRect().x -
              values.getBoundingClientRect().x;
            let offsetY =
              select.getBoundingClientRect().y -
              values.getBoundingClientRect().y +
              40;

            values.setAttribute(
              'style',
              `transform: translate3d(${offsetX}px, ${offsetY}px, 0); width: ${
                select.getBoundingClientRect().width
              }px;`
            );
          });
        } else {
          this.search = undefined;
        }
      }, 100);
    }
  }
};
</script>

<style lang="scss">
@import './../../../assets/style/vars.scss';
@import './../../../assets/style/modal.scss';
@import '~vue-multiselect/dist/vue-multiselect.min.css';

.custom-select {
  position: relative;
  display: flex;

  div:not(:first-of-type) {
    // not select-field-checkbox
    flex: 1 0;
  }

  &__input {
    width: 100%;
  }

  &__values {
    position: absolute;

    width: 100%;
    max-height: 300px;
    overflow-y: auto;

    top: $heightInput;
    z-index: 10;
    background-color: white;
    border-radius: 0 0 4px 4px;
    filter: drop-shadow(0px 0px 27px rgba(130, 121, 121, 0.15));
    border: 1px solid $colorGray3;
    border-top: none;
  }

  &__value {
    font-size: $fontSizeDefault;
    padding: 15px;
    cursor: pointer;

    &:hover {
      background-color: $colorGray1;
    }
  }
}

input {
  padding-right: 16px;
  background-repeat: no-repeat;
  background-position: 99% 50%;
  background-size: 12px;

  &.error {
    border-color: $colorErrorHover;
  }
}

.form-check-input[type=checkbox]{
  width: 1rem;
  height: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 0;
  margin-right: 0.5rem;
}
</style>
