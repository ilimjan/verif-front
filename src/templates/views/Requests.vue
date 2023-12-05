<template>
  <div v-if="oidcIsAuthenticated" class="requests">
    <loader fullscreen :loading="loading"></loader>

    <div class="requests__filter filter">
      <div class="filter__row">
        <button
          class="btn btn-lg btn-solid btn-grey filter__elem"
          @click.prevent="toggleShowFilter"
        >
          <img left src="icons/filter.svg" />
          <span>Фильтр</span>
        </button>

        <div class="filter__search">
          <custom-input
            type="text"
            search
            v-model="search"
            :values="searchResults"
            is-search-field
            :placeholder="searchMode.name"
          ></custom-input>
        </div>

        <button
          class="searchbtn btn-filter"
          style="height: 40px; width: 50px; align-content: center; border-left: none; z-index: 9;"
        >
          <img left src="icons/tune.svg"/>
        </button>
        <drop-menu style="z-index: 9" v-show="isFilterModesShown" v-model="searchMode"/>

        <div class="filter__divider"></div>

        <button-list
          name="Экспорт"
          icon="icons/Export.svg"
          class="btn btn-lg btn-solid btn-grey filter__elem"
          :actions="exportActions"
        ></button-list>

        <button
          class="btn btn-lg btn-solid btn-grey filter__elem"
          @click="openImportModal()"
        >
          <img left src="icons/Import.svg" />
          <span>Импорт</span>
        </button>

        <button
          class="btn btn-lg btn-solid btn-primary filter__elem"
          v-if="isOperator"
          @click="openRequestModal()"
        >
          <img left src="icons/Plus.svg" />
          <span>Создать анкету-заявку</span>
        </button>
      </div>

      <div class="filter__row">
        <button
          class="btn btn-solid btn-grey btn-grey--clear filter__elem"
          @click="clearFilter()"
        >
          <span>Очистить все</span>
        </button>

        <div class="filter__filters">
          <div v-for="type in Object.keys(filter)" :key="type">
            <button class="btn btn-grey" v-if="!!filter[type]">
              <span v-if="type === 'technicalSurveyStatus'">{{
                getTechnicalSurveyDisplayStatus(filter[type])
              }}</span>
              <span v-else-if="type === 'oktmoCode'">{{ filter[type] }}</span>
              <span v-else-if="type === 'operatorName'">{{
                filter[type]
              }}</span>
              <span v-else-if="type === 'flowStatusName'">{{
                filter[type].displayName
              }}</span>
              <span v-else>{{ filter[type].value }}</span>
              <img
                right
                src="icons/Close-dark.svg"
                @click="clearFilter(type)"
              />
            </button>
          </div>
        </div>

        <div class="filter__divider"></div>

        <div class="filter__status">
          <span>
            Сортировать по:
          </span>
          <select class="sel sel-transparent" style="background-image: url(icons/Arrow-secondary.svg)" v-model="sort">
            <option
              v-for="option in sorts"
              :key="option.id"
              :value="option"
              :class="{ 'd-none': !isAdmin && option.role === 'admin' }"
            >
              {{ option.name }}
            </option>
          </select>
          <img
            @click="isDescendingOrder = !isDescendingOrder"
            src="icons/SortOrder.svg"
          />
        </div>
      </div>
    </div>

    <div class="requests__table">
      <table class="tbl">
        <thead>
          <tr>
            <th>
              <checkbox-input v-model="allSelected"></checkbox-input>
            </th>
            <th>
              Наименование объекта по обращению с ТКО, ID Объекта по обращению с
              ТКО
            </th>
            <th>
              Эксплуатирующая организация объекта по обращению с ТКО, ИНН
            </th>
            <th>
              <span v-if="isAdmin">Федеральный округ,</span>
              Субъект РФ, Муниципальный район
            </th>
            <th>
              Категория объекта
            </th>
            <th>
              Статус объекта
            </th>
            <th>
              Статус версии
            </th>
            <th v-if="sort.fieldName === 'dataSource.name'">
              {{ sort.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>
              <checkbox-input v-model="item.selected"></checkbox-input>
            </td>
            <td>
              <div>
                <span v-if="!isOperator && !isAdmin && !isAnalyst">
                  {{ item.name ? item.name : 'Объект без названия' }}
                </span>
                <router-link v-else :to="'/request?requestId=' + item.id">
                  {{ item.name ? item.name : 'Объект без названия' }}
                </router-link>
              </div>
              <div class="text--muted">ID: {{ item.id }}</div>
            </td>
            <td>
              <div>
                {{ item.operator ? item.operator.name : '' }}
              </div>
              <div class="text--muted">
                ИНН: {{ item.operator ? item.operator.inn : '' }}
              </div>
            </td>
            <td>
              <div v-if="isAdmin" class="fw-bold">
                {{ item.federalDistrictName ? item.federalDistrictName.value : '' }}
              </div>
              <div>
                {{ item.subjectName ? item.subjectName.value : '' }}
              </div>
              <div class="text--muted">
                {{ item.subjectAreaName ? item.subjectAreaName.value : '' }}
              </div>
            </td>
            <td>
              {{ item.type ? item.type.value : '' }}
            </td>
            <!--                    <td>-->
            <!--                        {{ item.wasteCategory ? item.wasteCategory.value: '' }}-->
            <!--                    </td>-->
            <td>
              {{ item.status ? item.status.value : '' }}
            </td>
            <td>
              <object-status :status="item.flowStatus"></object-status>
            </td>
            <td v-if="sort.fieldName === 'dataSource.name'">
              <span v-if="item.dataSource">
                {{ item.dataSource.name }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="requests__pagination">
        <pagination
          v-bind:items-total="itemsTotal"
          :items-count="items.length"
          @changePage="onChangePage"
        ></pagination>
      </div>
    </div>

    <modal-filter
      v-bind:opened="showFilter"
      @filterChanged="onFilterChange"
      :is-admin="isAdmin"
      @filterClosed="showFilter = false"
    ></modal-filter>

    <modal-window
      v-if="showRequestModal"
      @close="showRequestModal = false"
      @apply="addRequest(tempRequest)"
    >
      <div slot="header">
        Новая анкета-заявка
      </div>
      <div slot="body">
        <div class="form">
          <div class="form-elem">
            <div class="form-elem__title">
              Наименование объекта по обращению с ТКО
            </div>
            <custom-input
              required
              type="text"
              v-model="tempRequest.name"
              @input="getTKONamesList"
            ></custom-input>
            <b-list-group
              v-if="tkoNamesList.length"
              class="position-absolute w-100 rounded-0 rounded-bottom shadow"
              style="z-index: 1"
            >
              <b-list-group-item
                v-for="item in tkoNamesList"
                :key="item.id"
                href="#"
                class="border-top-0"
                @click="setTKOName(item)"
              >
                {{ item.name }}
              </b-list-group-item>
            </b-list-group>
          </div>

          <div class="form-elem">
            <div class="form-elem__title">
              Категория объекта
            </div>
            <custom-select
              required
              v-model="tempRequest.type"
              reference-type="OBJECT_TYPE"
            ></custom-select>
          </div>
        </div>
      </div>
    </modal-window>

    <import-modal
      v-if="showImportModal"
      @close="showImportModal = false"
      @apply="
        showImportModal = false;
        loadItems();
      "
    ></import-modal>

    <modal-window
      v-if="showExportModal"
      @close="showExportModal = false"
      @apply="exportObjects(true, exportEmail)"
    >
      <div slot="header">
        Экспорт на почту
      </div>
      <div slot="body">
        <div class="form">
          <div class="form-elem">
            <div class="form-elem__title">
              E-mail
            </div>
            <custom-input type="text" v-model="exportEmail"></custom-input>
          </div>
        </div>
      </div>
    </modal-window>
  </div>
</template>

<script>
import { ConfigProvider, ENVIRONMENT_VARS } from '../../config/config-provider';
import { mapGetters } from 'vuex';
import Pagination from '../components/Pagination';
import { $InfrastructureObjectService } from '../../services/infrastructureobject.service';
import { $DialogService } from '../../services/dialog.service';
import ModalFilter from '../components/ModalFilter';
import Loader from '../components/Loader';
import CustomInput from '../components/forms/CustomInput';
import CheckboxInput from '../components/forms/CheckboxInput';
import ModalWindow from '../components/modal/ModalWindow';
import CustomSelect from '../components/forms/CustomSelect';
import ObjectStatus from '../components/ObjectStatus';
import store from '../../plugins/store/store';
import { $ExportService } from '../../services/export.service';
import ImportModal from '../components/modal/ImportModal';
import ButtonList from '../components/ButtonList';
import DropMenu from '../components/DropMenu';
import { $http } from '../../plugins/axios/http';

export default {
  name: 'Requests',
  components: {
    ButtonList,
    ImportModal,
    ObjectStatus,
    CustomSelect,
    ModalWindow,
    CheckboxInput,
    CustomInput,
    Loader,
    ModalFilter,
    Pagination,
    DropMenu
  },

  data() {
    return {
      searchMode: {
        id: 0,
        name: 'Поиск по Наименованию объекта, ID объекта',
        mode: 'address'
      },
      isFilterModesShown: false,
      loading: false,
      isDescendingOrder: false,
      items: [],
      parPage: 10,
      currentPage: 0,
      itemsTotal: 0,

      filter: {},
      showFilter: false,

      search: '',
      searchResults: [],

      sort: {},
      sorts: [
        { name: 'Статус версии', fieldName: 'flowStatus' },
        { name: 'Наименование объекта', fieldName: 'name' },
        {
          name: 'Федеральный округ',
          fieldName: 'federalDistrictName.value',
          role: 'admin'
        },
        {
          name: 'Наименование оператора по обращению с отходами, в зоне ответственности которого находится объект обращения с ТКО',
          fieldName: 'dataSource.name',
          role: 'admin'
        },
        { name: 'Статус объекта', fieldName: 'status' },
        { name: 'Категория объекта', fieldName: 'type.value' },
        { name: 'Субъект Российской Федерации', fieldName: 'subjectName.value' }
      ],

      allSelected: false,

      // Модальное окно заявки
      showRequestModal: false,
      tempRequest: {},

      // Модальное окно импорта
      showImportModal: false,

      // Модальное окно экспорта
      showExportModal: false,
      exportEmail: undefined,
      exportActions: [
        {
          name: 'Экспорт',
          function: () => this.exportObjects()
        },
        {
          name: 'Экспорт на почту',
          function: () => this.openExportModal()
        }
      ],
      timeout: 0,
      tkoNamesList: []
    };
  },

  computed: {
    ...mapGetters('oidcStore', ['oidcIsAuthenticated', 'oidcUser']),

    isAdmin: function() {
      return (
        this.oidcUser &&
        this.oidcUser.role &&
        (this.oidcUser.role.includes('fs_admin') ||
          this.oidcUser.role.includes('fs_object_analyst'))
      );
    },

    isOperator: function() {
      return (
        this.oidcUser &&
        this.oidcUser.role &&
        (this.oidcUser.role.includes('fs_operator') ||
          this.oidcUser.role.includes('fs_monitoring'))
      );
    },

    isAnalyst: function() {
      return (
        this.oidcUser &&
        this.oidcUser.role &&
        this.oidcUser.role.includes('fs_analyst')
      );
    },

    selectedObjects: function() {
      return this.items.filter(object => {
        return object.selected;
      });
    }
  },

  mounted() {
    this.sort = this.sorts[0];

    this.showFilterModes();
  },

  watch: {
    search() {
      this.onSearchChange();
    },

    sort() {
      this.onSearchChange();
    },

    isDescendingOrder() {
      this.onSearchChange();
    },

    allSelected() {
      this.selectAll();
    }
  },

  methods: {
    showFilterModes() {
      if (document) {
        let searchModeId = this.searchMode.id;
        document.addEventListener('click', event => {
          const element = event.target;
          const parent = element.parentElement;
          
          if (element && element.classList) {
            if (
              element.classList.contains('searchbtn') ||
              (parent && parent.classList && parent.classList.contains('searchbtn'))
            ) {
              this.isFilterModesShown = !this.isFilterModesShown;
            } else if (element.classList.contains('magnify')) {
              if (searchModeId !== this.searchMode.id) {
                this.isFilterModesShown = !this.isFilterModesShown;
              }
            } else {
              this.isFilterModesShown = false;
            }
          }

          searchModeId = this.searchMode.id;
        });
      } else {
        this.isFilterModesShown = !this.isFilterModesShown;
      }
    },

    getTechnicalSurveyDisplayStatus(status) {
      switch (status) {
        case 'NOT_STARTED':
          return 'Не начато';
        case 'IN_PROGRESS':
          return 'В процессе';
        case 'COMPLETED':
          return 'Завершено';
        default:
          return '';
      }
    },

    onChangePage(page) {
      if (page !== this.currentPage) {
        this.currentPage = page;
        this.loadItems();
      }
    },

    onFilterChange(filter) {
      this.filter = JSON.parse(JSON.stringify(filter));
      this.loadItems();
    },

    onSearchChange() {
      if (this.timeout > 0) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        if (this.search && this.search.length >= 5) {
          $InfrastructureObjectService
            .getInfrastructureObjectsAutocomplete(this.search)
            .then(
              response => {
                this.searchResults = response.data;
              },
              error => {
                $DialogService.showErrorObj(error);
              }
            );
        } else {
          this.searchResults = [];
        }

        this.loadItems();
      }, 500);
    },

    clearFilter(type) {
      this.search = '';
      if (!type) {
        this.$set(this, 'filter', {});
      } else {
        let tempFilter = {};
        let keys = Object.keys(this.filter);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] !== type) {
            tempFilter[keys[i]] = this.filter[keys[i]];
          }
        }
        this.filter = tempFilter;
      }
      this.loadItems();
    },

    loadItems() {
      this.loading = true;
      const preparedFilter = this.buildFilter(this.filter);

      const sortField = this.isDescendingOrder
        ? `-${this.sort.fieldName}`
        : this.sort.fieldName;

      $InfrastructureObjectService
        .getInfrastructureObjects(
          this.currentPage,
          this.parPage,
          sortField,
          this.search,
          preparedFilter
        )
        .then(
          response => {
            this.items = response.data.data;
            this.itemsTotal = response.data.count;
            this.loading = false;
          },
          error => {
            $DialogService.showErrorObj(error);
            this.loading = false;
          }
        );
    },

    buildFilter(filter) {
      const preparedFilter = JSON.parse(JSON.stringify(filter));

      if (preparedFilter.federalDistrictName) {
        preparedFilter.federalDistrictName =
          preparedFilter.federalDistrictName.id;
      }

      if (preparedFilter.subjectName) {
        preparedFilter.subjectName = preparedFilter.subjectName.id;
      }

      if (preparedFilter.status) {
        preparedFilter.status = preparedFilter.status.id;
      }

      if (preparedFilter.type) {
        preparedFilter.type = preparedFilter.type.id;
      }

      if (preparedFilter.name) {
        preparedFilter.name = preparedFilter.name.name;
      }

      if (preparedFilter.flowStatusName) {
        preparedFilter.flowStatusName = preparedFilter.flowStatusName.name;
      }

      return preparedFilter;
    },

    toggleShowFilter() {
      this.showFilter = !this.showFilter;
    },

    openRequestModal() {
      this.showRequestModal = !this.showRequestModal;
      this.tempRequest = {};
    },

    async addRequest(request) {
      store.dispatch('validationEnabled');

      if (this.validate()) {
        // TODO: запрос который сохраняет заявку на сервере и возвращает dto с id
        this.$router.push({
          name: 'request',
          params: {
            data: request
          },
          query: request.id ? {
            id: request.id
          } : {}
        });
        this.showRequestModal = false;
      } else {
        $DialogService.showError('Заполнены не все обязательные поля!');
      }
    },

    validate() {
      return this.tempRequest.name && this.tempRequest.type;
    },

    selectAll() {
      this.items.forEach(item => {
        item.selected = this.allSelected;
      });
    },

    openExportModal() {
      this.showExportModal = !this.showExportModal;
      this.exportMail = undefined;
    },

    exportObjects(byMail, email) {
      if (this.selectedObjects.length > 0) {
        for (let i = 0; i < this.selectedObjects.length; i++) {
          if (byMail) {
            if (email) {
              $ExportService
                .exportXlsxByEmail(this.selectedObjects[i].id, email)
                .then(response => {
                  $DialogService.showSuccess('Отправлено');
                  this.showExportModal = false;
                })
                .catch(error => {
                  $DialogService.showErrorObj(error);
                });
            } else {
              $DialogService.showError('E-mail не указан!');
            }
          } else {
            $ExportService
              .exportXlsx(this.selectedObjects[i].id)
              .then(response => {
                const url = window.URL.createObjectURL(
                  new Blob([response.data])
                );
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute(
                  'download',
                  this.selectedObjects[i].name +
                    '_' +
                    new Date().toLocaleDateString() +
                    '.xlsx'
                );
                document.body.appendChild(link);
                link.click();
              })
              .catch(error => {
                $DialogService.showErrorObj(error);
              });
          }
        }
      } else {
        $DialogService.showError('Не выбрано ни одного объекта');
      }
    },

    openImportModal() {
      this.showImportModal = !this.showImportModal;
    },

    getTKONamesList(name) {
      this.tkoNamesList = [];
      if (this.timeout > 0) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        if (name && typeof name === 'string' && name.length >= 3 && this.oidcUser.region_id) {
          let url = ConfigProvider.value(ENVIRONMENT_VARS.VUE_APP_FS_API_URL);
          if (typeof url === 'string' && url[url.length - 1] !== '/') {
            url += '/';
          }
          $http.post(url + 'data-map/api/v1/verification-public-objects', {
            nameContains: name,
            regionId: this.oidcUser.region_id
          }).then(response => {
            if (response.data && response.data.count) {
              this.tkoNamesList = response.data.items;
            }
          }).catch(error => {
            $DialogService.showErrorObj(error);
          });
        }
      }, 500);
    },

    async setTKOName(item) {
      if (item && item.id) {
        let url = ConfigProvider.value(ENVIRONMENT_VARS.VUE_APP_FS_API_URL);
        if (typeof url === 'string' && url[url.length - 1] !== '/') {
          url += '/';
        }

        let finded = await $http.get(url + 'data-map/api/v1/verification-public-object?id=' + item.id);
        if (finded && finded.data && finded.data.item) {
          finded = finded.data.item;

          await Object.entries(finded).forEach(obj => (this.tempRequest[obj[0]] = obj[1]));

          const refStatuses = store.state.referenceStore.references.get('OBJECT_STATUS');
          if (Array.isArray(refStatuses)) {
            const states = await $http.get(url + 'data-map/api/postgres/References/GetStateList');
            if (Array.isArray(states.data)) {
              finded.state = states.data.find(obj => obj.id === finded.stateId);
              if (finded.state) {
                this.tempRequest.status = refStatuses.find(obj => obj.value === finded.state.name);
              }
            }
          }

          const refTypes = store.state.referenceStore.references.get('OBJECT_TYPE');
          if (Array.isArray(refTypes)) {
            const categories = await $http.get(url + 'data-map/api/postgres/References/GetObjectCategoryList');
            if (Array.isArray(categories.data)) {
              finded.category = categories.data.find(obj => obj.id === finded.objectCategoryId);
              if (finded.category) {
                this.tempRequest.type = refTypes.find(obj => obj.value === finded.category.name);
              }
            }

            if (!this.tempRequest.type) {
              this.tempRequest.type = refTypes[0];
            }
          }

          const refObjTypes = store.state.referenceStore.references.get('TKO_OBJECT_TYPE');
          if (Array.isArray(refObjTypes)) {
            const types = await $http.get(url + 'data-map/api/postgres/ObjectType/Get');
            if (Array.isArray(types.data)) {
              finded.type = types.data.find(obj => obj.id === finded.objectTypeId);
              if (finded.type) {
                this.tempRequest.tkoObjectType = refObjTypes.find(obj => obj.value === finded.type.name);
              }
            }
          }

          const refAreas = store.state.referenceStore.references.get('SUBJECT_AREA');
          if (Array.isArray(refAreas)) {
            const areas = await $http.get(url + 'ref/api/v3/area');
            if (Array.isArray(areas.data.items)) {
              finded.area = areas.data.items.find(obj => obj.id === finded.areaId);
              if (finded.area) {
                this.tempRequest.subjectAreaName = refAreas.find(obj => obj.value === finded.area.name);
              }
            }
          }

          const refGroro = store.state.referenceStore.references.get('GRORO');
          if (Array.isArray(refGroro)) {
            if (finded.numberGRORO) {
              this.tempRequest.numberGRORO = refGroro.find(obj => obj.value === finded.numberGRORO);
            }
          }
        }

        this.getTKONamesList();
      }
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';

.requests {
  &__pagination {
    text-align: left;
  }
}

.filter {
  &__row {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 25px;
  }

  &__search {
    margin-left: 15px;
    width: 40vw;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    position: relative;
    margin-left: 15px;

    button {
      margin: 2px;
    }
  }

  &__status {
    display: flex;
    align-items: center;

    img {
      margin-left: 10px;
      cursor: pointer;
    }

    select {
      max-width: 320px;
    }
  }

  &__divider {
    flex: 1 0 auto;
  }

  &__elem {
    display: inline-block;
  }
}

.btn-grey--clear {
  color: $colorText !important;
}
</style>
