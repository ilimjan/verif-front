<template>
  <div
    class="modal-filter"
    :class="{ 'modal-filter--closed': !isOpenedInnerValue }"
  >
    <div class="modal-filter__header">
      <span class="modal-filter__header--title">
        Фильтр
      </span>
      <img src="icons/Close.svg" height="24" width="24" @click="close" />
    </div>
    <div class="modal-filter__body">
      <div class="filter-select">
        <div class="filter-select__title">
          Федеральный округ
        </div>
        <select
          class="sel sel-outlined"
          v-model="tempFilter.federalDistrictName"
          style="background-image: url(icons/Arrow-grey.svg)"
        >
          <option
            v-for="option in filterValues['FEDERAL_DISTRICT']"
            v-bind:key="option.id"
            v-bind:value="option"
          >
            {{ option.value }}
          </option>
        </select>
      </div>
      <div class="filter-select">
        <div class="filter-select__title">
          Субъект РФ
        </div>
        <select
          class="sel sel-outlined"
          v-model="tempFilter.subjectName"
          style="background-image: url(icons/Arrow-grey.svg)"
        >
          <option
            v-for="option in filterValues['REGION']"
            v-bind:key="option.id"
            v-bind:value="option"
          >
            {{ option.value }}
          </option>
        </select>
      </div>
      <div class="filter-select">
        <div class="filter-select__title">
          Наименование оператора по обращению с отходами
        </div>
        <select
          class="sel sel-outlined"
          v-model="tempFilter.operatorName"
          style="background-image: url(icons/Arrow-grey.svg)"
        >
          <option
            v-for="(option, index) in operatorNames"
            v-bind:key="index"
            v-bind:value="option"
          >
            {{
              !option
                ? 'Пустое значение'
                : option.replaceAll(' ', '') === ''
                ? 'Пустая строка'
                : option
            }}
          </option>
        </select>
      </div>

      <div class="filter-select">
        <div class="filter-select__title">
          Код ОКТМО
        </div>
        <select
          class="sel sel-outlined"
          v-model="tempFilter.oktmoCode"
          style="background-image: url(icons/Arrow-grey.svg)"
        >
          <option
            v-for="option in oktmoCodes"
            v-bind:key="option"
            v-bind:value="option"
          >
            {{ option }}
          </option>
        </select>
      </div>
      <div class="filter-select">
        <div class="filter-select__title">
          Статус объекта
        </div>
        <select
          class="sel sel-outlined"
          v-model="tempFilter.status"
          style="background-image: url(icons/Arrow-grey.svg)"
        >
          <option
            v-for="option in filterValues['OBJECT_STATUS']"
            v-bind:key="option.id"
            v-bind:value="option"
          >
            {{ option.value }}
          </option>
        </select>
      </div>
      <div class="filter-select">
        <div class="filter-select__title">
          Категория объекта
        </div>
        <select
          class="sel sel-outlined"
          v-model="tempFilter.type"
          style="background-image: url(icons/Arrow-grey.svg)"
        >
          <option
            v-for="option in filterValues['OBJECT_TYPE']"
            v-bind:key="option.id"
            v-bind:value="option"
          >
            {{ option.value }}
          </option>
        </select>
      </div>
      <div class="filter-select">
        <div class="filter-select__title">
          Статус
        </div>
        <select
          class="sel sel-outlined"
          v-model="tempFilter.flowStatusName"
          style="background-image: url(icons/Arrow-grey.svg)"
        >
          <option
            v-for="(option, index) in flowStatuses"
            v-bind:key="index"
            v-bind:value="option"
          >
            {{ option.displayName }}
          </option>
        </select>
      </div>
    </div>
    <div class="modal-filter__footer">
      <button
        class="btn btn-lg btn-solid btn-grey filter__elem"
        @click.prevent="clear"
      >
        <span>Очистить</span>
      </button>

      <button
        class="btn btn-lg btn-solid btn-primary filter__elem"
        @click.prevent="apply"
      >
        <span>Применить</span>
      </button>
    </div>
  </div>
</template>

<script>
import { $ReferenceService } from '../../services/reference.service';
import { $DialogService } from '../../services/dialog.service';
import CustomSelect from './forms/CustomSelect';

export default {
  name: 'ModalFilter',
  components: { CustomSelect },
  props: {
    opened: {
      type: Boolean,
      required: false
    },
    isAdmin: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      tempFilter: {
        federalDistrictName: null,
        subjectName: null,
        oktmoCode: null,
        status: null,
        flowStatusName: null,
        // не менять на null, убьёт (может быть значине null)
        operatorName: undefined
      },

      filterTypes: [],
      filterValues: {},
      oktmoCodes: [],
      flowStatuses: [],
      operatorNames: [],
      isOpenedInnerValue: false
    };
  },

  watch: {
    opened() {
      this.isOpenedInnerValue = this.opened;
    }
  },

  created() {
    if (!this.$listeners.filterChanged) {
      console.error('Missing required event listener: "filterChanged"');
    }
  },

  mounted() {
    this.isOpenedInnerValue = this.opened;
    $ReferenceService.getReferenceTypes().then(
      typesResponse => {
        this.filterTypes = typesResponse.data;
        this.filterTypes.forEach(type => {
          $ReferenceService.getReference(type.name).then(
            valuesResponse => {
              this.$nextTick(() => {
                this.filterValues[type.name] = valuesResponse.data;
              });
            },
            error => {
              $DialogService.showErrorObj(error);
            }
          );
        });
      },
      error => {
        $DialogService.showErrorObj(error);
      }
    );

    $ReferenceService.getOktmoCodes().then(
      oktmoResponce => {
        this.oktmoCodes = oktmoResponce.data;
      },
      error => {
        $DialogService.showErrorObj(error);
      }
    );

    $ReferenceService.getFlowStatuses().then(
      flowStatuses => {
        this.flowStatuses = flowStatuses.data;
      },
      error => {
        $DialogService.showErrorObj(error);
      }
    );

    $ReferenceService.getOperatorNames().then(
      operatorNames => {
        if (Array.isArray(operatorNames.data)) {
          this.operatorNames = operatorNames.data.filter(item => item);
        }
      },
      error => {
        $DialogService.showErrorObj(error);
      }
    );
  },

  methods: {
    close() {
      this.isOpenedInnerValue = false;
      this.$emit('filterClosed', this.tempFilter);
    },

    clear() {
      this.tempFilter = {};
    },

    apply() {
      this.isOpenedInnerValue = false;
      this.$emit('filterClosed', this.tempFilter);
      this.$emit('filterChanged', this.tempFilter);
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';

.modal-filter {
  position: fixed;
  z-index: 10;
  height: 100vh;
  top: 0;
  right: 0;
  width: 480px;
  filter: drop-shadow(-15px 0px 35px rgba(0, 0, 0, 0.1));
  background-color: white;
  transition: width 0.1s ease-out;

  display: flex;
  flex-direction: column;

  &--closed {
    width: 0 !important;

    .modal-filter__header {
      display: none;
    }

    .modal-filter__body {
      display: none;
    }

    .modal-filter__footer {
      display: none;
    }
  }

  &__header {
    height: 62px;
    padding: 0 16px;
    border-bottom: 1px solid $colorGray1;
    display: flex;
    align-items: center;

    &--title {
      flex: 1 0;
      font-size: $fontSizeXL;
      font-weight: 600;
    }

    img {
      cursor: pointer;
    }
  }

  &__body {
    flex: 1 0;
    padding: 20px 16px;
    overflow-y: auto;
  }

  &__footer {
    height: 72px;
    padding: 0 16px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background-color: $colorGray1;
  }
}

.filter-select {
  margin-bottom: 20px;

  &__title {
    font-size: $fontSizeSmall;
    color: $colorGray5;
  }
}
</style>
