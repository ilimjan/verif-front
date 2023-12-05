<template>
  <div v-if="oidcIsAuthenticated">
    <loader fullscreen :loading="loading"></loader>

    <div class="block block__header">
      <button class="btn btn-solid btn-primary" @click="save">
        <img left src="icons/Save.svg" />
        <span>Сохранить</span>
      </button>
    </div>

    <div class="block">
      <div class="block__content">
        <div v-for="(referenceInfo, j) in getReferenceInfo()" :key="j">
          <div class="reference-panel--indent">
            <div class="reference-panel--paragraph">
              <span class="reference-panel--title">{{
                referenceInfo.title
              }}</span>
              <!-- Почему не так? Не пришлось бы заполнять REFERENCE_INFO
                            <span class="reference-panel--title">Справочник "{{getDictionaryName().get(referenceInfo.type).displayName}}"</span>
                            -->

              <div
                v-for="(reference, i) in references
                  .filter(
                    element =>
                      element.type.name === referenceInfo.type &&
                      (element.finishTime === undefined ||
                        element.finishTime === null)
                  )
                  .filter(element => !referencesToDelete.includes(element))"
                :key="i"
                class="reference-panel--row"
              >
                <div class="custom-input">
                  <div class="custom-input__input">
                    <input
                      class="inp inp-block reference--inp reference--index"
                      v-model="reference.index"
                      @change="editIndex(reference)"
                    />
                    <input
                      class="inp inp-block reference--inp"
                      v-model="reference.value"
                      @change="editReference(reference)"
                    />
                    <button
                      class="btn btn-lg btn-transparent btn-grey reference--btn"
                      title="Нельзя удалить"
                      v-if="reference.indelible"
                    >
                      <img src="icons/Delete-grey.svg" />
                    </button>

                    <button
                      class="btn btn-lg btn-transparent btn-error reference--btn"
                      v-if="!reference.indelible"
                      title="Удалить"
                      @click="removeReference(reference)"
                    >
                      <img src="icons/Delete.svg" />
                    </button>
                  </div>
                </div>
              </div>
              <br />
              <div class="form-elem form-elem--indent">
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary reference--btn-add"
                  @click="
                    addReference(getDictionaryName().get(referenceInfo.type))
                  "
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить значение</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { $ReferenceService } from '../../services/reference.service';
import { $DialogService } from '../../services/dialog.service';
import Loader from '../components/Loader';

const DICTIONARY_NAME = new Map();
const REFERENCE_INFO = [
  { title: 'Справочник категории отходов', type: 'WASTE_CATEGORY' },
  { title: 'Справочник наименований', type: 'OBJECT_STATUS' },
  { title: 'Справочник категорий объектов', type: 'OBJECT_TYPE' },
  {
    title: 'Справочник типов объектов по обращению с ТКО',
    type: 'TKO_OBJECT_TYPE'
  },
  { title: 'Справочник федеральных округов', type: 'FEDERAL_DISTRICT' },
  {
    title:
      'Справочник категории объектов, оказывающих негативное воздействие на окружающую среду',
    type: 'NEGATIVE_OBJECT_CATEGORY'
  },
  {
    title: 'Справочник видов собственности на земельный участок',
    type: 'OWNERSHIP_TYPE'
  },
  { title: 'Справочник категории земель', type: 'LAND_CATEGORY' },
  {
    title: 'Справочник разрешенных использований земельного участка',
    type: 'ALLOWED_USING_TYPE'
  },
  {
    title: 'Справочник классификаций опасных производственных объектов',
    type: 'DANGER_TYPE'
  },
  { title: 'Справочник классов автомобильных дорог', type: 'ROAD_TYPE' },
  { title: 'Справочник классов опасности отходов', type: 'WASTE_DANGER_CLASS' },
  {
    title: 'Справочник систем защиты окружающей среды на объекте',
    type: 'TREATMENT_FACILITIES'
  },
  { title: 'Справочник видов покрытия дорог', type: 'ROAD_SURFACE_TYPE' },
  {
    title:
      'Справочник классификаторов ограждений по функциональному назначению',
    type: 'FENCE_FUNCTIONAL'
  },
  {
    title: 'Справочник классификаторов ограждений по степени мобильности',
    type: 'FENCE_MOBILITY'
  },
  {
    title: 'Справочник классификаторов ограждений по конструкции полотна',
    type: 'FENCE_CANVAS'
  },
  {
    title:
      'Справочник классификаторов ограждений по степени просматриваемости полотна',
    type: 'FENCE_VIEWABILITY'
  },
  {
    title:
      'Справочник классификаторов ограждений по материалу изготовления полотна',
    type: 'FENCE_FABRIC_MATERIAL'
  },
  {
    title: 'Справочник классификаторов ограждений по виду фундамента',
    type: 'FENCE_FOUNDATION'
  },
  {
    title:
      'Справочник классификаторов ограждений по материалу изготовления опор ограждения',
    type: 'FENCE_SUPPORTS_MATERIAL'
  },
  {
    title: 'Справочник типов освещения по функциональному назначению',
    type: 'LIGHTS_FUNCTIONAL_TYPE'
  },
  {
    title:
      'Справочник классификаторов источников услуг охраны, применяемых на объекте по обращению с ТКО',
    type: 'SECURITY_SOURCE'
  },
  {
    title:
      'Справочник систем мониторинга окружающей среды на объекте по обращению с ТКО',
    type: 'ENVIRONMENT_MONITORING_SYSTEM'
  },
  {
    title:
      'Справочник статусов проведения технического обследования (инвентаризации)',
    type: 'TECHNICAL_SURVEY_STATUS'
  },
  {
    title:
      'Справочник результатов проведения технического обследования (инвентаризации)',
    type: 'TECHNICAL_SURVEY_RESULT'
  },
  {
    title: 'Справочник видов обращения с отходами',
    type: 'WASTE_MANAGEMENT_TYPE'
  },
  { name: 'Справочник субъектов РФ', type: 'REGION' },
  {
    title:
      'Справочник «Описание закрепления точки на местности» (Способы закрепления точек границы на местности)',
    type: 'DOT_DESCRIPTION'
  },
  {
    title:
      'Справочник вторичных материальных ресурсов (ВМР), извлекаемых объектами по обращению с ТКО',
    type: 'SECONDARY_RESOURCES'
  },
  { title: 'Справочник видов утилизации', type: 'UTILIZATION_TYPE' },
  {
    title: 'Справочник типов гидроизоляции участка размещения отходов',
    type: 'WATERPROOFING_TYPE'
  },
  { title: 'Справочник статусов анкеты-заявки', type: 'OBJECT_REQUEST_STATUS' },
  { title: 'Справочник статусов импорта данных', type: 'IMPORT_STATUS' },
  { title: 'Справочник конвееров', type: 'CONVEYOR' },
  { title: 'Справочник сепараторов', type: 'SEPARATOR' },
  { title: 'Справочник прессов', type: 'PRESS' },
  {
    title: 'Справочник дополнительных оборудований',
    type: 'ADDITIONAL_EQUIPMENT'
  },
  {
    title: 'Справочник оборудований объектов размещения',
    type: 'PLACEMENT_OBJECT_EQUIPMENT'
  },
  {
    title: 'Справочник оборудований объектов утилизации',
    type: 'UTILIZATION_OBJECT_EQUIPMENT'
  },
  {
    title: 'Справочник оборудований объектов обезвреживания',
    type: 'NEUTRALIZATION_OBJECT_EQUIPMENT'
  },
  { title: 'Справочник видов оборудования', type: 'EQUIPMENT_KIND' }
];

export default {
  name: 'Dictionaries',
  components: { Loader },

  data() {
    return {
      filterTypes: [],
      filterValues: {},
      referencesToAdd: [],
      referencesToDelete: [],
      referencesToEdit: [],
      references: [],
      loading: false
    };
  },

  computed: {
    ...mapGetters('oidcStore', ['oidcIsAuthenticated'])
  },

  mounted() {
    this.loading = true;

    $ReferenceService.getReferenceTypes().then(
      typesResponse => {
        this.filterTypes = typesResponse.data;
        let typesLoadedCounter = 0;

        this.filterTypes.forEach(type => {
          $ReferenceService.getReference(type.name).then(
            valuesResponse => {
              typesLoadedCounter++;
              if (typesLoadedCounter === this.filterTypes.length) {
                this.loading = false;
              }

              this.$nextTick(() => {
                // fixme убрать
                // let j = 1;
                // for (let i = 1; i <= valuesResponse.data.length; i++) {
                //     if (valuesResponse.data[i - 1].finishTime) {
                //         continue;
                //     }
                //     valuesResponse.data[i - 1].index = j++;
                // }
                // fixme убрать
                valuesResponse.data.sort((el1, el2) => {
                  return el1.index - el2.index;
                });
                this.references.push(...valuesResponse.data);
                this.filterValues[type.name] = valuesResponse.data;
                this.getDictionaryName().set(type.name, type);
              });
            },
            error => {
              typesLoadedCounter++;
              if (typesLoadedCounter === this.filterTypes.length) {
                this.loading = false;
              }

              $DialogService.showErrorObj(error);
            }
          );
        });
      },
      error => {
        $DialogService.showErrorObj(error);
      }
    );
  },

  methods: {
    editIndex(reference) {
      let arr = this.references.filter(
        element =>
          element.type.name === reference.type.name &&
          (element.finishTime === undefined || element.finishTime === null)
      );

      if (reference.index <= arr.length) {
        this.references.splice(this.references.indexOf(reference), 1);
        arr = this.references.filter(
          element =>
            element.type.name === reference.type.name &&
            (element.finishTime === undefined || element.finishTime === null)
        );
        this.references.splice(
          this.references.indexOf(arr[reference.index - 1]),
          0,
          reference
        );
      } else {
        this.references.splice(this.references.indexOf(reference), 1);
        this.references.push(reference);
      }

      arr.push(reference);
      this.addToEditReferences(arr);

      this.recountReference();
    },

    addToEditReferences(arr) {
      for (let i = 0; i < arr.length; i++) {
        if (
          this.referencesToEdit.indexOf(arr[i]) === -1 &&
          this.referencesToAdd.indexOf(arr[i]) === -1
        ) {
          this.referencesToEdit.push(arr[i]);
        }
      }
    },

    recountReference() {
      for (let j = 0; j < this.getReferenceInfo().length; j++) {
        let arr = this.references.filter(
          element =>
            element.type.name === this.getReferenceInfo()[j].type &&
            (element.finishTime === undefined || element.finishTime === null)
        );
        for (let i = 0; i < arr.length; i++) {
          arr[i].index = i + 1;
        }
      }
    },

    getDictionaryName() {
      return DICTIONARY_NAME;
    },

    getReferenceInfo() {
      return REFERENCE_INFO;
    },

    addReference(type) {
      let element = {
        type: type,
        value: '',
        index:
          this.references.filter(
            element =>
              element.type.name === type.name &&
              (element.finishTime === undefined || element.finishTime === null)
          ).length + 1
      };
      this.references.push(element);
      this.referencesToAdd.push(element);
    },

    removeReference(element) {
      this.references.splice(this.references.indexOf(element), 1);
      if (this.referencesToAdd.indexOf(element) !== -1) {
        this.referencesToAdd.splice(this.referencesToAdd.indexOf(element), 1);
      } else {
        if (this.referencesToEdit.indexOf(element) !== -1) {
          this.referencesToEdit.splice(
            this.referencesToEdit.indexOf(element),
            1
          );
        }
        this.referencesToDelete.push(element);
      }

      this.addToEditReferences(
        this.references.filter(
          el =>
            el.type.name === element.type.name &&
            (el.finishTime === undefined || el.finishTime === null)
        )
      );
      this.recountReference();
    },

    editReference(element) {
      if (
        this.referencesToAdd.indexOf(element) === -1 &&
        this.referencesToEdit.indexOf(element) === -1
      ) {
        this.referencesToEdit.push(element);
      }
    },

    save() {
      // добавляем новые элементы в справочник
      for (let i = 0; i < this.referencesToAdd.length; i++) {
        $ReferenceService.saveReference(this.referencesToAdd[i]).then(
          response => {},
          error => {
            $DialogService.showErrorObj(error);
          }
        );
      }

      // удаляем элементы из справочника
      for (let i = 0; i < this.referencesToDelete.length; i++) {
        $ReferenceService.removeReference(this.referencesToDelete[i]).then(
          response => {},
          error => {
            $DialogService.showErrorObj(error);
          }
        );
      }

      // редактирование
      for (let i = 0; i < this.referencesToEdit.length; i++) {
        $ReferenceService.editReference(this.referencesToEdit[i]).then(
          response => {},
          error => {
            $DialogService.showErrorObj(error);
          }
        );
      }

      this.referencesToAdd = [];
      this.referencesToDelete = [];
      this.referencesToEdit = [];

      this.references = [];

      $ReferenceService.getReferenceTypes().then(
        typesResponse => {
          this.filterTypes = typesResponse.data;
          this.filterTypes.forEach(type => {
            $ReferenceService.getReference(type.name).then(
              valuesResponse => {
                this.$nextTick(() => {
                  valuesResponse.data.sort((el1, el2) => {
                    return el1.index - el2.index;
                  });
                  this.references.push(...valuesResponse.data);
                  this.filterValues[type.name] = valuesResponse.data;
                  this.getDictionaryName().set(type.name, type);
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
    }
  }
};
</script>
<style scoped lang="scss">
@import './../../assets/style/vars.scss';
@import './../../assets/style/block.scss';

.reference-panel {
  &--title {
    font-style: normal;
    font-weight: 600;
    font-size: 22px;
    line-height: 125%;
    color: #515151;
  }

  &--row {
    margin-top: 16px;
  }

  &--indent {
    margin-top: 32px;
    margin-right: 16px;
    margin-left: 16px;
  }

  &--paragraph {
    margin-left: 32px;
    margin-top: 32px;
  }
}

.reference {
  &--inp {
    width: 50%;
    float: left;
  }

  &--btn {
    margin-left: 11px;
  }

  &--btn-add {
    margin-top: 16px;
  }

  &--index {
    width: 50px;
    margin-right: 20px;
    padding: 11px 11px 11px 11px;
    justify-content: center;
    text-align: center;
  }
}
</style>
