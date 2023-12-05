<template>
  <div class="checkbox-input">
    <input
      type="checkbox"
      :id="'checkbox-' + id"
      class="custom-checkbox"
      v-model="tempValue"
      :disabled="disabled"
    />
    <label :for="'checkbox-' + id">{{ text }}</label>
  </div>
</template>

<script>
import { $MathUtils } from '../../../services/utils.service';

export default {
  name: 'CheckboxInput',

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
    value: {
      type: Boolean,
      required: false
    },
    text: {
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
      id: undefined,
      tempValue: undefined
    };
  },

  mounted() {
    this.id = $MathUtils.randomInt(10000, 100000);
    this.tempValue = !!this.value;
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
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/vars.scss';

.checkbox-input {
  display: flex;
  align-items: center;
  height: 40px;

  label {
    color: $colorGray6;
  }

  .custom-checkbox {
    position: absolute;
    z-index: -1;
    opacity: 0;
  }

  .custom-checkbox + label {
    display: inline-flex;
    align-items: center;
    user-select: none;
    cursor: pointer;
  }

  .custom-checkbox + label::before {
    content: '';
    display: inline-block;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    flex-grow: 0;
    border: 1px solid $colorGray3;
    border-radius: 0.25em;
    margin-right: 11px;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 80% 80%;
    background-color: white;
  }

  .custom-checkbox:not(:disabled):not(:checked) + label:hover::before {
    //border-color: lighten($colorSecondary, 48%);
  }

  .custom-checkbox:not(:disabled):active + label::before {
    //background-color: lighten($colorSecondary, 48%);
    //border-color: lighten($colorSecondary, 48%);
  }

  .custom-checkbox:focus + label::before {
    //box-shadow: 0 0 0 0.2rem lighten($colorSecondary, 48%);
  }

  .custom-checkbox:focus:not(:checked) + label::before {
    border-color: $colorSecondary;
  }

  .custom-checkbox:checked + label::before {
    border-color: $colorSecondary;
    background-color: $colorSecondary;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3e%3c/svg%3e");
  }

  .custom-checkbox:checked:disabled + label::before {
    border-color: $colorGray3;
  }

  .custom-checkbox:disabled + label::before {
    background-color: $colorGray1;
  }

  .custom-checkbox:disabled:checked + label::before {
    background-color: $colorGray3;
  }
}
</style>
