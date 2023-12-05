<template>
  <div class="schedule-input">
    <select-field-checkbox
      v-if="!hideCheckbox"
      :select-fields-array="selectFieldsArray"
      :select-field-name="selectFieldName"
      :select-field-disable="selectFieldDisable"
    ></select-field-checkbox>

    <div class="schedule-input__wrapper">
      <div class="schedule-input__checkboxes">
        <checkbox-input
          v-model="tempValue.everyDay"
          :disabled="disabled"
          text="Ежедневно"
          class="schedule-input__elem"
        />

        <checkbox-input
          v-model="tempValue.fullDay"
          :disabled="disabled"
          text="Круглосуточно"
          class="schedule-input__elem"
        />

        <checkbox-input
          v-model="tempValue.withoutBreak"
          :disabled="disabled"
          text="Без перерыва"
          class="schedule-input__elem"
        />
      </div>

      <div class="schedule-input__days">
        <button
          class="btn btn-day"
          v-for="(day, index) in days"
          :key="'DAY-BTN-' + index"
          :active="dayActive(index)"
          :disabled="disabled || tempValue.everyDay"
          @click.prevent="clickDay(index)"
        >
          <span>{{ day }}</span>
        </button>
      </div>

      <div class="schedule-input__inputs" v-if="tempValue.everyDay">
        <div class="schedule-input__elem schedule-input__elem--day">
          Ежедневно
        </div>

        <div class="schedule-input__elem">
          <div class="form-elem">
            <div class="form-elem__title">
              График работы
            </div>

            <time-period-input
              v-model="tempValue.schedule"
              :required="!tempValue.fullDay && required"
              :disabled="disabled || tempValue.fullDay"
            />
          </div>
        </div>

        <div class="schedule-input__elem">
          <div class="form-elem">
            <div class="form-elem__title">
              Перерыв
              <hint
                message="Указать время суммарно по всем перерывам в течении дня"
              ></hint>
            </div>

            <time-period-input
              v-model="tempValue.break"
              :required="!tempValue.withoutBreak && required"
              :disabled="disabled || tempValue.withoutBreak"
            />
          </div>
        </div>
      </div>
      <div v-else v-for="(day, index) in tempValue.days" :key="'DAY-' + index">
        <div class="schedule-input__inputs" v-if="day.working">
          <div class="schedule-input__elem schedule-input__elem--day">
            {{ days[index] }}
          </div>

          <div class="schedule-input__elem">
            <div class="form-elem">
              <div class="form-elem__title">
                График работы
              </div>

              <time-period-input
                v-model="day.schedule"
                :required="!tempValue.fullDay && required"
                :disabled="disabled || tempValue.fullDay"
              />
            </div>
          </div>

          <div class="schedule-input__elem">
            <div class="form-elem">
              <div class="form-elem__title">
                Перерыв
                <hint
                  message="Указать время суммарно по всем перерывам в течении дня"
                ></hint>
              </div>

              <time-period-input
                v-model="day.break"
                :required="!tempValue.withoutBreak && required"
                :disabled="disabled || tempValue.withoutBreak"
              />
            </div>
          </div>

          <checkbox-input
            v-if="index === firstActiveDay()"
            v-model="tempValue.sameAsFirst"
            :disabled="disabled"
            text="Применить ко всем"
            class="schedule-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SelectFieldCheckbox from './SelectFieldCheckbox';
import CheckboxInput from './CheckboxInput';
import TimePeriodInput from './TimePeriodInput';
import Hint from '../Hint';

export default {
  name: 'ScheduleInput',
  components: { Hint, TimePeriodInput, CheckboxInput, SelectFieldCheckbox },
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
      if (!this.tempValue) {
        return true;
      }

      return false;
    },

    getDays: function() {
      return this.tempValue.days;
    }
  },

  data() {
    return {
      tempValue: {},
      days: [
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота',
        'Воскресенье'
      ]
    };
  },

  mounted() {
    if (this.value) {
      this.tempValue = JSON.parse(this.value);
    } else {
      this.tempValue = {
        schedule: {},
        break: {}
      };
    }
  },

  watch: {
    tempValue: {
      handler(val) {
        this.$emit('input', JSON.stringify(this.tempValue));
      },
      deep: true
    },

    'tempValue.everyDay': {
      handler(val) {
        if (val) {
          this.fillDays(true);
        }
      }
    },

    'tempValue.fullDay': {
      handler(val) {
        if (val) {
          this.tempValue.schedule = {
            from: '00:00',
            to: '23:59'
          };
          this.fillDays(undefined);
        }
      }
    },

    'tempValue.withoutBreak': {
      handler(val) {
        if (val) {
          this.tempValue.break = {
            from: '00:00',
            to: '00:00'
          };
          this.fillDays(undefined);
        }
      }
    },

    'tempValue.sameAsFirst': {
      handler(val) {
        if (val) {
          // this.tempValue.break = {
          //     from: '00:00',
          //     to: '00:00'
          // };
          this.fillDays(undefined);
        }
      }
    },

    value(newValue) {
      if (newValue) {
        this.tempValue = JSON.parse(newValue);
      } else {
        this.tempValue = {};
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
    clickDay(index) {
      if (!this.tempValue.days) {
        this.fillDays(false);
      }

      this.$set(
        this.tempValue.days[index],
        'working',
        !this.tempValue.days[index].working
      );
    },

    dayActive(index) {
      if (!this.tempValue.days) {
        return false;
      }
      return this.tempValue.days[index].working;
    },

    firstActiveDay() {
      for (let i = 0; i < this.tempValue.days.length; i++) {
        if (this.tempValue.days[i].working) {
          return i;
        }
      }
    },

    fillDays(value) {
      if (!this.tempValue.days) {
        this.$set(this.tempValue, 'days', []);
      }

      for (let i = 0; i < this.days.length; i++) {
        if (!this.tempValue.days[i]) {
          this.tempValue.days[i] = {};
        }
        if (value) {
          this.$set(this.tempValue.days[i], 'working', value);
        }
        if (this.tempValue.fullDay) {
          this.tempValue.days[i].schedule = {
            from: '00:00',
            to: '23:59'
          };
        }
        if (this.tempValue.withoutBreak) {
          this.tempValue.days[i].break = {
            from: '00:00',
            to: '00:00'
          };
        }
        if (this.tempValue.sameAsFirst) {
          for (let j = 0; j < this.tempValue.days.length; j++) {
            if (
              this.tempValue.days[j]
                .working /* &&
                                (this.tempValue.days[j].break.from ||
                                this.tempValue.days[j].break.to ||
                                this.tempValue.days[j].schedule.from ||
                                this.tempValue.days[j].schedule.to)*/
            ) {
              if (this.tempValue.days[i].working) {
                this.tempValue.days[i].break = {
                  from: this.tempValue.days[j].break.from,
                  to: this.tempValue.days[j].break.to
                };
                this.tempValue.days[i].schedule = {
                  from: this.tempValue.days[j].schedule.from,
                  to: this.tempValue.days[j].schedule.to
                };
              }
              break;
            }
          }
        }
      }
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/vars.scss';

.schedule-input {
  display: flex;
  align-items: center;

  &__elem {
    margin-right: 30px;
    display: inline-block;

    &--day {
      width: 100px;
    }
  }

  &__checkboxes {
    display: flex;
  }

  &__days {
    margin-top: 20px;
  }

  &__inputs {
    margin-top: 30px;
    display: flex;
    align-items: center;
  }
}

.btn-day {
  margin: 0;

  &:not(:first-of-type) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: none;
  }

  &:not(:last-of-type) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  border: 1px solid $colorSecondary;
  color: $colorSecondary;
  background-color: $colorSecondaryLight;

  &:hover {
    background-color: lighten($colorSecondaryLight, 3%);
  }

  &[active] {
    background-color: $colorSecondary;
    color: white;
    font-weight: bold;
    //border-color: $colorSecondaryHover;

    &[disabled] {
      background-color: $colorGray3 !important;
      color: white !important;
      //border-color: $colorGray !important;
    }

    &:hover {
      background-color: darken($colorSecondary, 3%);
    }
  }
}

input {
  .error {
    border-color: $colorErrorHover;
  }
}
</style>
