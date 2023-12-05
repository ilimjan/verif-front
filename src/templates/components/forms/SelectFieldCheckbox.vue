<template>
  <div
    class="select-field-checkbox"
    v-if="selectFieldsArray && selectFieldName"
  >
    <checkbox-input
      class="select-field-checkbox"
      v-model="checkboxValue"
      :disabled="selectFieldDisable"
    />
  </div>
</template>

<script>
import CheckboxInput from './CheckboxInput';

export default {
  name: 'SelectFieldCheckbox',
  components: { CheckboxInput },
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
    }
  },

  data() {
    return {
      checkboxValue: false
    };
  },

  mounted() {
    this.updateValue();
  },

  watch: {
    checkboxValue(newValue) {
      if (!this.selectFieldsArray) {
        return;
      }
      const alreadyExists =
        this.selectFieldsArray.indexOf(this.selectFieldName) > -1;

      if (newValue) {
        if (!alreadyExists) {
          this.selectFieldsArray.push(this.selectFieldName);
        }
      } else {
        const index = this.selectFieldsArray.indexOf(this.selectFieldName);
        if (index > -1) {
          this.selectFieldsArray.splice(index, 1);
        }
      }
    },

    selectFieldsArray() {
      this.updateValue();
    },

    selectFieldName() {
      this.updateValue();
    }
  },

  methods: {
    updateValue() {
      this.checkboxValue = !!(
        this.selectFieldsArray &&
        this.selectFieldsArray.find(field => field === this.selectFieldName)
      );
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/vars.scss';

.select-field-checkbox {
}
</style>
