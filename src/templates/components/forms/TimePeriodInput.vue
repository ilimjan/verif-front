<template>
  <div class="schedule-input">
    <select-field-checkbox
      v-if="!hideCheckbox"
      :select-fields-array="selectFieldsArray"
      :select-field-name="selectFieldName"
      :select-field-disable="selectFieldDisable"
    ></select-field-checkbox>

    <div class="period-wrapper">
      <!-- :disabled-time="afterTo" -->
      <date-picker
        class="period-wrapper__first"
        :class="{ error: isError }"
        v-model="tempValue.from"
        format="HH:mm"
        value-type="format"
        type="time"
        :disabled="disabled"
      >
        <template v-slot:icon-calendar>
          <img src="icons/Clock.svg" class="period-wrapper__icon" />
        </template>
      </date-picker>

      <!-- :disabled-time="beforeFrom" -->
      <date-picker
        class="period-wrapper__last"
        :class="{ error: isError }"
        v-model="tempValue.to"
        format="HH:mm"
        value-type="format"
        type="time"
        :disabled="disabled"
      >
        <template v-slot:icon-calendar>
          <img src="icons/Clock.svg" class="period-wrapper__icon" />
        </template>
      </date-picker>
    </div>
  </div>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/locale/ru';
import SelectFieldCheckbox from './SelectFieldCheckbox';
import CheckboxInput from './CheckboxInput';
import { $DialogService } from '../../../services/dialog.service';

export default {
  name: 'TimePeriodInput',
  components: { CheckboxInput, SelectFieldCheckbox, DatePicker },
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
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    required: {
      type: Boolean,
      required: false
    }
  },

  computed: {
    isError: function() {
      if (!this.tempValue || !this.tempValue.from || !this.tempValue.to) {
        return true;
      }

      return false;
    }
  },

  data() {
    return {
      tempValue: {},
      counter: 0
    };
  },

  mounted() {
    if (this.value) {
      this.tempValue = this.value;
    } else {
      // TODO: Правильнее раскомментить, но в таком случае объект очищается всегда при загрузке компонента
      //this.tempValue = {};
    }
  },

  watch: {
    tempValue() {
      if (this.tempValue) {
        this.$emit('input', this.tempValue);
      }
    },

    value(newValue) {
      if (newValue) {
        this.tempValue = newValue;
      } else {
        // TODO: Правильнее раскомментить, но в таком случае объект очищается всегда при загрузке компонента
        //this.tempValue = {};
      }
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
    beforeFrom(date) {
      if (date && this.tempValue.from) {
        var dateStr = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split('T')[1]
          .substring(0, 5);
        let time1 = Number.parseInt(
          dateStr.split(':')[0] + dateStr.split(':')[1]
        );
        let time2 = Number.parseInt(
          this.tempValue.from.split(':')[0] + this.tempValue.from.split(':')[1]
        );

        this.incrementCounter(time1);

        return time1 % 100 === 0 && this.counter < 23
          ? time1 <= time2 - (100 - (time2 % 100))
          : time1 <= time2;
      } else {
        return false;
      }
    },

    afterTo(date) {
      if (date && this.tempValue.to) {
        var dateStr = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split('T')[1]
          .substring(0, 5);
        let time1 = Number.parseInt(
          dateStr.split(':')[0] + dateStr.split(':')[1]
        );
        let time2 = Number.parseInt(
          this.tempValue.to.split(':')[0] + this.tempValue.to.split(':')[1]
        );

        this.incrementCounter(time1);

        return time1 % 100 === 0 && this.counter < 23
          ? time1 >= time2 - (100 - (time2 % 100))
          : time1 >= time2;
      } else {
        return false;
      }
    },

    incrementCounter(time) {
      // Тут запутанная логика связанная с неправильной работой компонента.
      // Дело в том что он сначала проверяет все часы с нулевым значением минут,
      // и если, допустим, время time2=6:12 то он пометит весь 6 час как недоступный,
      // даже не заходя в проверку по минутам
      if (time === 0) {
        this.counter = 0;
      } else if (this.counter < 23) {
        this.counter++;
      }
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/vars.scss';

.period-wrapper {
  width: 250px;
  display: flex;

  &__icon {
    height: 22px;
    margin-top: 4px;
  }

  &__first {
    ::v-deep input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  &__last {
    ::v-deep input {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left: none;
    }
  }
}

input {
  .error {
    border-color: $colorErrorHover;
  }
}
</style>
