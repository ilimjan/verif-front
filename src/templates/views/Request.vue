<template>
  <div v-if="oidcIsAuthenticated" class="request">
    <loader fullscreen :loading="loading"></loader>

    <h1
      title="Анкета-заявка на включение объекта по обращению с ТКО в Реестр объектов"
      class="position-sticky top-0 py-1 bg-white text-truncate"
      style="z-index: 11"
    >
      Анкета-заявка на включение объекта по обращению с ТКО в Реестр объектов
    </h1>

    <div class="divTable position-sticky py-1 bg-white text-truncate" style="top: 35px; z-index: 11">
      <div v-if="request.name" class="divRow">
        {{ request.name }}
      </div>
      <div v-if="request && request.type && request.type.value" class="divRow">
        {{ request.type.value }}
      </div>
      <div v-if="request.dataSource.uploadDate" class="divRow">
        {{ new Date(request.dataSource.uploadDate).toLocaleDateString("ru") }}
      </div>
      <div v-if="request && request.flowStatus && request.flowStatus.displayName" class="divRow">
        {{ request.flowStatus.displayName }}
      </div>
    </div>

    <div class="block block__header shadow-sm" style="top: 72px; z-index: 11">
      <button
        class="btn btn-transparent btn-error"
        v-if="isDeleteDraftAvailable"
        @click.prevent="
          showConfirmation(
            'Вы действительно хотите удалить черновик?',
            deleteDraft,
          )
        "
      >
        <img left src="icons/Delete.svg" />
        <span>Удалить черновик</span>
      </button>

      <button
        class="btn btn-transparent btn-grey"
        v-if="isSaveDraftAvailable"
        @click.prevent="submitDraft()"
      >
        <img left src="icons/File.svg" />
        <span>Сохранить черновик</span>
      </button>

      <button
        class="btn btn-solid btn-primary"
        v-if="isSendToTechicalSurveyBtnAvailable"
        @click.prevent="submit('SendToTechSurvey', false, true)"
      >
        <img left src="icons/Forward.svg" />
        <span>Отправить на техническое обследование</span>
      </button>

      <button
        class="btn btn-solid btn-primary"
        v-if="isSendToModerationBtnAvailable"
        @click.prevent="submit('SendToModeration', false, true)"
      >
        <img left src="icons/Forward.svg" />
        <span>Отправить на модерацию</span>
      </button>

      <button
        class="btn btn-solid btn-primary"
        v-if="isVerifyBtnAvailable"
        @click.prevent="
          showConfirmation(
            'Вы собираетесь верифицировать всю анкету объекта. Вы действительно хотите это сделать?',
            submit,
            ['SetVerified', false, true],
          )
        "
      >
        <img left src="icons/Forward.svg" />
        <span>Верифицировать</span>
      </button>

      <button
        class="btn btn-solid btn-primary"
        v-if="isRequestTechnicalSurveyFromOperatorBtnAvailable"
        @click.prevent="
          showConfirmation(
            'Вы собираетесь запросить отправку анкеты объекта на техническое обследование у оператора. Вы действительно хотите это сделать? Укажите причину:',
            submit,
            ['TechnicalSurveyRequested', false, false],
            true,
          )
        "
      >
        <img left src="icons/Forward.svg" />
        <span>Запросить отправку на техническое обследование у оператора</span>
      </button>

      <button
        class="btn btn-solid btn-primary"
        v-if="isRequestAuditBtnAvailable"
        @click.prevent="showRevision(submit, ['RequestAudit', false, false])"
      >
        <img left src="icons/Forward.svg" />
        <span>Запросить ревизию данных аналитиком</span>
      </button>

      <button
        class="btn btn-solid btn-secondary"
        v-if="isArchiveBtnAvailable"
        @click.prevent="submit('Archive', false, false)"
      >
        <img left src="icons/Forward.svg" />
        <span>Архивировать</span>
      </button>

      <button
        class="btn btn-solid btn-error"
        v-if="isRejectBtnAvailable"
        @click.prevent="
          showConfirmation(
            'Вы собираетесь отклонить анкету объекта. Вы действительно хотите это сделать? Укажите причину:',
            submit,
            ['Reject', false, false],
            true,
          )
        "
      >
        <img left src="icons/Close-white.svg" />
        <span>Отклонить</span>
      </button>
    </div>

    <div class="block">
      <div class="block__content">
        <div class="tabs">
          <div
            class="tab"
            @click="setTab('request')"
            :class="{ 'tab--active': tab === 'request' }"
          >
            Анкета-заявка
          </div>
          <div
            class="tab"
            @click="setTab('survey')"
            :class="{ 'tab--active': tab === 'survey' }"
            :disabled="!request.technicalSurvey || !request.technicalSurvey.id"
          >
            Сведения о проведении технического обследования
          </div>
          <div
            class="tab"
            @click="setTab('history')"
            :class="{ 'tab--active': tab === 'history' }"
          >
            История изменений
          </div>
        </div>

        <form class="form" v-show="tab === 'request'" @submit.stop.prevent="">
          <div class="row form-elem">
            <div class="col-50">
              <div class="form-elem__title">
                Наименование объекта по обращению с ТКО
              </div>
              <custom-input
                :disabled="disableFields"
                :select-field-disable="disableCheckboxes"
                :hide-checkbox="hideCheckbox"
                :select-fields-array="request.verifiedFields"
                select-field-name="name"
                :max-length="4000"
                required
                type="text"
                v-model="request.name"
              ></custom-input>
            </div>
            <div class="col-50">
              <div class="form-elem__title">ID объекта по обращению с ТКО</div>
              <custom-input
                :select-field-disable="disableCheckboxes"
                :hide-checkbox="hideCheckbox"
                :select-fields-array="request.verifiedFields"
                select-field-name="id"
                type="text"
                v-model="request.id"
                disabled
              ></custom-input>
            </div>
          </div>

          <div class="row form-elem">
            <div class="col-50">
              <div class="form-elem__title">Категория объекта</div>
              <custom-select
                :disabled="disableFields"
                :select-field-disable="disableCheckboxes"
                :hide-checkbox="hideCheckbox"
                :select-fields-array="request.verifiedFields"
                select-field-name="type"
                required
                v-model="request.type"
                reference-type="OBJECT_TYPE"
              ></custom-select>
            </div>
            <div class="col-50" v-if="request.federalSchemeId || request.federalSourceId">
              <div class="w-100 mb-2">
                <span>Идентификатор объекта в Федеральной схеме: </span>
                {{ request.federalSchemeId }}
              </div>
              <div class="w-100">
                <span>Внешний идентификатор объекта в Федеральной схеме: </span>
                {{ request.federalSourceId }}
              </div>
            </div>
            <div class="col-50 mt-2">
              <div class="row">
                <div class="col-50">
                  <div class="form-inline">
                    <span> Статус анкеты: </span>
                    <object-status :status="request.flowStatus"></object-status>
                  </div>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">Дата статуса</div>
                  <custom-input
                    disabled
                    type="date"
                    v-model="request.flowStatusChanged"
                  ></custom-input>
                </div>
              </div>
            </div>
          </div>

          <div class="form-elem" v-if="request.statusChangingReason">
            <div class="form-elem__title">Причина изменения статуса</div>
            <custom-input
              disabled
              type="textarea"
              :max-length="1000"
              v-model="request.statusChangingReason"
            ></custom-input>
          </div>

          <div class="row form-elem" v-if="request.revisionBefore">
            <div class="col-50">
              <div class="form-elem__title">Дата проведения ревизии</div>
              <custom-input
                disabled
                type="date"
                v-model="request.revisionBefore"
              />
            </div>
          </div>

          <div class="row form-elem">
            <div class="col-50"></div>
            <div class="col-50"></div>
          </div>

          <div class="form-group" id="blockDatasource">
            <h2
              v-b-toggle.collapse-1
              class="form-group__title position-relative"
            >
              Источники данных об объекте по обращению с ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-1">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">Дата загрузки</div>
                  <custom-input
                    disabled
                    type="date"
                    v-model="request.dataSource.uploadDate"
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Наименование структурного подразделения Оператора по обращению с
                  ТКО - поставщика сведений
                </div>
                <custom-input
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="dataSource.name"
                  required
                  type="text"
                  v-model="request.dataSource.name"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Наименование региона (субъекта РФ)
                </div>
                <custom-select
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="dataSource.subjectName"
                  required
                  v-model="request.dataSource.subjectName"
                  reference-type="REGION"
                  :values="regions"
                ></custom-select>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  ФИО уполномоченного сотрудника поставщика сведений
                </div>
                <custom-input
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="dataSource.representativeFio"
                  required
                  type="text"
                  :max-length="4000"
                  v-model="request.dataSource.representativeFio"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Должность уполномоченного сотрудника поставщика сведений
                </div>
                <custom-input
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="dataSource.representativePosition"
                  required
                  type="text"
                  :max-length="4000"
                  v-model="request.dataSource.representativePosition"
                ></custom-input>
              </div>

              <div class="form-elem" v-if="request.sourceInformation">
                <div class="form-elem__title">
                  Источник сведений:
                  <strong class="ms-2">{{ request.sourceInformation.displayName }}</strong>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" v-if="isAdmin" id="blockVerificationStatus">
            <h2
              v-b-toggle.collapse-2
              class="form-group__title position-relative"
            >
              Сведения о статусе верификации данных об объекте по обращению с
              ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-2">
              <div class="row form-elem">
                <div class="col-50">
                  <boolean-input
                    :disabled="disableAdminFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.verificationStatusInfo.isCardCreated"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="verificationStatusInfo.isCardCreated"
                    text="Создана карточка объекта по обращению с ТКО"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <boolean-input
                    :disabled="disableAdminFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.verificationStatusInfo.infoByOperator"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="verificationStatusInfo.infoByOperator"
                    text="Данные объекта по обращению с ТКО внесены оператором"
                  ></boolean-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <boolean-input
                    :disabled="disableAdminFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.verificationStatusInfo.isFromPpk"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="verificationStatusInfo.isFromPpk"
                    text="Данные объекта по обращению с ТКО содержат сведения об объекте, собранные ППК РЭО"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <boolean-input
                    :disabled="disableAdminFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.verificationStatusInfo.isVerifiedByOperator"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="verificationStatusInfo.isVerifiedByOperator"
                    text="Данные объекта по обращению с ТКО верифицированы оператором по обращению с ТКО в рамках технического обследования"
                  ></boolean-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <boolean-input
                    :disabled="disableAdminFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.verificationStatusInfo.isFromTerritorialScheme
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="verificationStatusInfo.isFromTerritorialScheme"
                    text="Данные объекта по обращению с ТКО получены из территориальной схемы субъекта РФ"
                  ></boolean-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">Комментарий</div>
                <custom-input
                  :disabled="disableAdminFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="verificationStatusInfo.comment"
                  type="textarea"
                  :max-length="4000"
                  v-model="request.verificationStatusInfo.comment"
                ></custom-input>
              </div>
            </b-collapse>
          </div>

          <!-- id="blockGeneralInfoWrapper" -->
          <div class="form-group" id="blockGeneralInfo">
            <h2
              v-b-toggle.collapse-3
              class="form-group__title position-relative"
            >
              Общие сведения об объекте по обращению с ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-3">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Статус объекта по обращению с ТКО
                  </div>
                  <custom-select
                    :disabled="disableFields"
                    has-other-value
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="status"
                    required
                    v-model="request.status"
                    reference-type="OBJECT_STATUS"
                  ></custom-select>
                </div>
                <div class="col-50">
                  <div v-if="isOtherSelected(request.status)">
                    <div class="form-elem__title">Иной статус</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="status"
                      required
                      type="text"
                      v-model="request.otherObjectStatusName"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">Вид обращения с отходами</div>
                  <!-- reference-type="WASTE_MANAGEMENT_TYPE" -->
                  <custom-select
                    required
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="wasteManagementType"
                    v-model="request.wasteManagementType"
                    :values="wasteManagementTypes"
                  ></custom-select>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Тип объекта по обращению с ТКО
                  </div>
                  <!-- reference-type="TKO_OBJECT_TYPE" -->
                  <custom-select
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="tkoObjectType"
                    required
                    v-model="request.tkoObjectType"
                    :values="objectTypes"
                  ></custom-select>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наименование правообладателя объекта по обращению с ТКО
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="ownerName"
                    required
                    type="text"
                    v-model="request.ownerName"
                    :max-length="4000"
                    :loading="innLoading"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    ИНН правообладателя объекта по обращению с ТКО
                    <hint
                      message="Заполните поле и нажмите на лупу. Связанные поля заполнятся значениями."
                    ></hint>
                  </div>
                  <!-- Может быть ИНН начинающийся с 0, а это не число -->
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="ownerInn"
                    required
                    type="text"
                    v-model="request.ownerInn"
                    action="icons/Search.svg"
                    :max-length="12"
                    @action="updateInnOwner"
                  >
                  </custom-input>
                </div>
              </div>
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">Категория отходов</div>
                  <custom-select
                    v-model="request.category"
                    reference-type="WASTE_CATEGORY"
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="category"
                    required
                    multi
                  ></custom-select>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" id="blockPropertyLocation">
            <h2
              v-b-toggle.collapse-4
              class="form-group__title position-relative"
            >
              Расположение объекта
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-4">
              <div class="form-elem">
                <div class="form-elem__title">
                  Наименование федерального округа
                </div>
                <!-- TODO: проверить -->
                <custom-select
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="federalDistrictName"
                  required
                  v-model="request.federalDistrictName"
                  reference-type="FEDERAL_DISTRICT"
                  :values="federalDistricts"
                  :loading="federalDistrictsLoading"
                  @input="federalDistrictChanged()"
                ></custom-select>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Наименование субъекта Российской Федерации, на территории
                  которого расположен объект
                </div>
                <custom-select
                  :disabled="disableFields || !request.federalDistrictName"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="subjectName"
                  required
                  v-model="request.subjectName"
                  reference-type="REGION"
                  :values="regions"
                  :loading="regionsLoading"
                  @input="regionChanged()"
                ></custom-select>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Наименование района субъекта Российской Федерации, на территории
                  которого расположен объект
                </div>
                <custom-select
                  :disabled="disableFields || !request.subjectName"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="subjectAreaName"
                  required
                  v-model="request.subjectAreaName"
                  :values="subjectAreas"
                  :loading="subjectAreasLoading"
                ></custom-select>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Текстовое описание адресного ориентира
                  <hint
                    message="Заполните поле и нажмите на лупу. Связанные поля заполнятся значениями."
                  ></hint>
                </div>
                <custom-input
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="addressDescription"
                  type="text"
                  v-model="request.addressDescription"
                  action="icons/Search.svg"
                  :max-length="4000"
                  @action="fiasSearch"
                ></custom-input>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Координаты объекта в WGS 84: широта
                    <hint
                      message="Заполните поле и нажмите на лупу. Связанные поля заполнятся значениями."
                    ></hint>
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="latitude"
                    required
                    type="number"
                    v-model="request.latitude"
                    action="icons/Search.svg"
                    :whole="3"
                    :fraction="13"
                    @action="fiasGeolocation"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Координаты объекта в WGS 84: долгота
                    <hint
                      message="Заполните поле и нажмите на лупу. Связанные поля заполнятся значениями."
                    ></hint>
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="longitude"
                    required
                    type="number"
                    v-model="request.longitude"
                    action="icons/Search.svg"
                    :whole="3"
                    :fraction="13"
                    @action="fiasGeolocation"
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Уникальный номер адреса объекта адресации в ФИАС
                  </div>
                  <custom-select
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="fiasId"
                    v-model="request.fiasId"
                    :values="fiasIds"
                    :loading="fiasLoading"
                    @input="fiasIdChanged()"
                  ></custom-select>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Код ОКТМО муниципального образования
                  </div>
                  <custom-select
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="oktmoCode"
                    v-model="request.oktmoCode"
                    :values="oktmoCodes"
                    :loading="fiasLoading"
                    @input="oktmoCodeChanged()"
                  ></custom-select>
                </div>
              </div>

              <div class="form-elem form-elem--indent" v-if="request.fiasAddress">
                <loader :loading="fiasLoading"></loader>

                <div class="form-value" v-if="request.fiasAddress.id">
                  <div class="form-value__title">
                    Уникальный номер адреса объекта адресации в ФИАС
                  </div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.id }}
                  </div>
                </div>

                <div class="form-value" v-if="request.fiasAddress.regionName">
                  <div class="form-value__title">Наименование региона</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.regionName }}
                  </div>
                </div>

                <div
                  class="form-value"
                  v-if="request.fiasAddress.municipalRegionName"
                >
                  <div class="form-value__title">Муниципальный район/округ</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.municipalRegionName }}
                  </div>
                </div>

                <div class="form-value" v-if="request.fiasAddress.city">
                  <div class="form-value__title">Город</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.city }}
                  </div>
                </div>

                <div
                  class="form-value"
                  v-if="request.fiasAddress.innerCityTerritory"
                >
                  <div class="form-value__title">Внутригородская территория</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.innerCityTerritory }}
                  </div>
                </div>

                <div class="form-value" v-if="request.fiasAddress.area">
                  <div class="form-value__title">Населенный пункт</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.area }}
                  </div>
                </div>

                <div
                  class="form-value"
                  v-if="request.fiasAddress.planningStructureElement"
                >
                  <div class="form-value__title">
                    Элемент планировочной структуры
                  </div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.planningStructureElement }}
                  </div>
                </div>

                <div
                  class="form-value"
                  v-if="request.fiasAddress.streetRoadElement"
                >
                  <div class="form-value__title">
                    Элемент улично-дорожной сети
                  </div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.streetRoadElement }}
                  </div>
                </div>

                <div class="form-value" v-if="request.fiasAddress.postalCode">
                  <div class="form-value__title">Почтовый индекс</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.postalCode }}
                  </div>
                </div>

                <div class="form-value" v-if="request.fiasAddress.buildingNumber">
                  <div class="form-value__title">Номер здания/сооружения</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.buildingNumber }}
                  </div>
                </div>

                <div class="form-value" v-if="request.fiasAddress.roomNumber">
                  <div class="form-value__title">Номер помещения</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.roomNumber }}
                  </div>
                </div>

                <div class="form-value" v-if="request.fiasAddress.landPlotNumber">
                  <div class="form-value__title">Номер земельного участка</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.landPlotNumber }}
                  </div>
                </div>

                <div class="form-value" v-if="request.fiasAddress.oktmo">
                  <div class="form-value__title">Код ОКТМО</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.oktmo }}
                  </div>
                </div>

                <div
                  class="form-value"
                  v-if="request.fiasAddress.cadastralNumber"
                >
                  <div class="form-value__title">Кадастровый номер (ОКС/ЗУ)</div>
                  <div class="form-value__divider"></div>
                  <div class="form-value__value">
                    {{ request.fiasAddress.cadastralNumber }}
                  </div>
                </div>
              </div>

              <!-- По результатам показа у Заказчика требуется удалить данный атрибут из раздела (возможно временно)
                          <h3>
                              Категория отходов / Количество отходов
                          </h3>

                          <div class="form-elem">
                              <div class="form-grid">
                                  <div class="form-grid__elem" v-for="category in wasteCategories"
                                      v-bind:key="category.id">
                                      <checkbox-input :disabled="disableFields"
                                                      :select-field-disable="disableCheckboxes"
                                                      :hide-checkbox="hideCheckbox"
                                                      v-model="wasteCategoriesShowInput[category.value]"
                                                      :text="category.value">
                                      </checkbox-input>

                                      <custom-input :disabled="disableFields"
                                                    :select-field-disable="disableCheckboxes"
                                                    :hide-checkbox="hideCheckbox"
                                                    :required="wasteCategoriesShowInput[category.value]" type="number"
                                                    class="form-grid__tail"
                                                    v-if="!!wasteCategoriesShowInput[category.value]"
                                                    v-model="wasteCategoriesInfo[category.id]"
                                                    text="Тонн" :select-fields-array="request.verifiedFields"
                                                    :select-field-name="'wasteCategoryInfos.' + category.id"
                                      >
                                      </custom-input>
                                  </div>
                              </div>
                          </div>
                          -->
            </b-collapse>
          </div>

          <div class="form-group" id="blockExploitation">
            <h2
              v-b-toggle.collapse-5
              class="form-group__title position-relative"
            >
              Эксплуатация
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-5">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Дата начала строительства объекта
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="constructionStartDate"
                    required
                    type="date"
                    v-model="request.constructionStartDate"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Наименование и реквизиты документа о вводе объекта в
                    эксплуатацию
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="exploitationStartActNumber"
                    required
                    type="text"
                    v-model="request.exploitationStartActNumber"
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Дата ввода объекта в эксплуатацию
                  </div>
                  <custom-input
                    :disabled="disableFields || !request.constructionStartDate"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="exploitationStartDate"
                    required
                    type="date"
                    :disabled-date="notBeforeConstructionStartDate"
                    v-model="request.exploitationStartDate"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Срок эксплуатации объекта, лет
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    integer
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="exploitationPeriod"
                    required
                    type="number"
                    :whole="20"
                    :fraction="3"
                    v-model="request.exploitationPeriod"
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">Дата вывода из эксплуатации</div>
                  <custom-input
                    :disabled="disableFields || !request.exploitationStartDate"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="exploitationEndDate"
                    type="date"
                    :disabled-date="notBeforeExploitationStartDate"
                    v-model="request.exploitationEndDate"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Акт о вводе объекта в эксплуатацию
                  </div>
                  <file-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.exploitationAct"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="exploitationAct"
                    :formats="['pdf']"
                    :size="30"
                    @onPdfView="onPdfView"
                  ></file-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.isInFederalOrRegionalPrograms"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="isInFederalOrRegionalPrograms"
                    text="Принадлежность объекта к федеральными региональным программам"
                  ></boolean-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="form-elem" v-if="request.isInFederalOrRegionalPrograms">
                <div class="form-elem__title">
                  Программы с указанием их реквизитов
                </div>
                <custom-input
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="programs"
                  :max-length="4000"
                  required
                  type="textarea"
                  v-model="request.programs"
                ></custom-input>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.hasSimilarObjectsInSubject"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="hasSimilarObjectsInSubject"
                    text="Наличие аналогичных объектов в рассматриваемом субъекте РФ"
                  ></boolean-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="condition" v-if="request.hasSimilarObjectsInSubject">
                <div class="form-elem">
                  <div class="form-elem__title">
                    Действующие и планируемые аналогичные объекты в
                    рассматриваемом субъекте РФ
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="currentAndPlannedSimilarObjects"
                    required
                    type="textarea"
                    :max-length="4000"
                    v-model="request.currentAndPlannedSimilarObjects"
                  ></custom-input>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" id="blockOperator">
            <h2
              v-b-toggle.collapse-6
              class="form-group__title position-relative"
            >
              Сведения об операторе объекта
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-6">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наименование оператора объекта по обращению с ТКО
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="operator.name"
                    required
                    type="text"
                    v-model="request.operator.name"
                    :max-length="400"
                    :loading="innLoadingOperator"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    ИНН оператора объекта по обращению с ТКО
                    <hint
                      message="Заполните поле и нажмите на лупу. Связанные поля заполнятся значениями."
                    ></hint>
                  </div>
                  <!-- Может быть ИНН начинающийся с 0, а это не число -->
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="operator.inn"
                    required
                    type="text"
                    v-model="request.operator.inn"
                    action="icons/Search.svg"
                    :max-length="12"
                    @action="updateInnOperator"
                  >
                  </custom-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    КПП оператора объекта по обращению с ТКО
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="operator.kpp"
                    required
                    type="number"
                    v-model="request.operator.kpp"
                    :whole="9"
                    :fraction="0"
                    :loading="innLoadingOperator"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    ОГРН оператора объекта по обращению с ТКО
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="operator.ogrn"
                    required
                    type="number"
                    v-model="request.operator.ogrn"
                    :loading="innLoadingOperator"
                    :whole="13"
                    :fraction="0"
                  ></custom-input>
                </div>
              </div>

              <!--                        <div class="row form-elem">-->
              <!--                            <div class="col-50">-->
              <!--                                <div class="form-elem__title">-->
              <!--                                    ОГРНИП оператора объекта по обращению с ТКО-->
              <!--                                </div>-->
              <!--                                <custom-input :disabled="disableFields"
  :select-field-disable="disableCheckboxes"
  :hide-checkbox="hideCheckbox"
  :select-fields-array="request.verifiedFields" select-field-name="operator.ogrnip"  type="number" v-model="request.operator.ogrnip"></custom-input>-->
              <!--                            </div>-->
              <!--                            <div class="col-50">-->
              <!--                            </div>-->
              <!--                        </div>-->
            </b-collapse>
          </div>

          <div class="form-group" id="blockContactInformation">
            <h2
              v-b-toggle.collapse-7
              class="form-group__title position-relative"
            >
              Контактная информация
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-7">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="row">
                    <div class="col-50">
                      <div class="form-elem__title">
                        Телефон/факс оператора объекта по обращению с ТКО
                      </div>
                      <custom-input
                        required
                        type="phone2"
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="operator.phone"
                        v-model="request.operator.phone"
                        :loading="innLoadingOperator"
                        :max-length="20"
                      ></custom-input>
                      <!--
                                          <div class="prompt">Введите значение в формате "+7 (хххх)ххххххх"</div>
                                          -->
                    </div>

                    <div class="col-50">
                      <div class="form-elem__title">
                        Сотовый телефон оператора объекта по обращению с ТКО
                      </div>
                      <custom-input
                        type="phone"
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="operator.mobile"
                        v-model="request.operator.mobile"
                        :loading="innLoadingOperator"
                      ></custom-input>
                      <!--
                                          <div class="prompt">Введите значение в формате "+7 (ххх) ххх - хх - хх"</div>
                                          -->
                    </div>
                  </div>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Электронная почта оператора объекта по обращению с ТКО
                  </div>
                  <custom-input
                    required
                    type="email"
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="operator.email"
                    v-model="request.operator.email"
                    :loading="innLoadingOperator"
                    :max-length="40"
                  ></custom-input>
                  <!--
                                  <div class="form-elem__prompt_hidden">-</div>
                                  -->
                </div>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Юридический адрес оператора объекта по обращению с ТКО
                </div>
                <custom-input
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="operator.legalAddress"
                  required
                  type="text"
                  v-model="request.operator.legalAddress"
                  :loading="innLoadingOperator"
                  :max-length="400"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Фактический адрес оператора объекта по обращению с ТКО
                </div>
                <custom-input
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="operator.actualAddress"
                  required
                  type="text"
                  v-model="request.operator.actualAddress"
                  :loading="innLoadingOperator"
                  :max-length="400"
                ></custom-input>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    ФИО генерального директора оператора объекта по обращению с
                    ТКО
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="operator.directorFio"
                    required
                    type="text"
                    :max-length="40"
                    v-model="request.operator.directorFio"
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    ФИО уполномоченного представителя оператора объекта по
                    обращению с ТКО
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="operator.representativeOfOperatorFio"
                    required
                    type="text"
                    :max-length="400"
                    v-model="request.operator.representativeOfOperatorFio"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Должность уполномоченного представителя оператора объекта по
                    обращению с ТКО
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="operator.representativeOfOperatorPosition"
                    required
                    type="text"
                    :max-length="400"
                    v-model="request.operator.representativeOfOperatorPosition"
                  ></custom-input>
                </div>
              </div>
            </b-collapse>
          </div>

          <!-- id="blockInvestmentsWrapper" -->
          <div
            class="form-group"
            v-if="statusIn([STATUS_PERSPECTIVE_ID, STATUS_INVESTMENT_ID])"
            id="blockInvestments"
          >
            <h2
              v-b-toggle.collapse-8
              class="form-group__title position-relative"
            >
              Инвестиции
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-8">
              <!--
                          <div class="row form-elem">
                              <div class="col-50">
                                  <boolean-input :disabled="disableFields"
                                                :select-field-disable="disableCheckboxes"
                                                :hide-checkbox="hideCheckbox"
                                                v-model="request.investment.hasInvestor"
                                                :select-fields-array="request.verifiedFields"
                                                select-field-name="investment.hasInvestor"
                                                text="Наличие инвестора"
                                  ></boolean-input>
                              </div>
                              <div class="col-50">
                              </div>
                          </div>
                          -->

              <div
                v-for="(investment, index) in request.investments"
                :key="'I-' + index"
              >
                <h4 class="row row--centered form-elem">
                  Инвестор {{ index + 1 }}

                  <span
                    @click.prevent="deleteElement('investments', investment)"
                    v-if="!disableFields"
                  >
                    <img src="icons/Check-error.svg" />
                  </span>
                </h4>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наименование инвестора объекта по обращению с ТКО
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="'investments[' + index + '].name'"
                      v-model="investment.name"
                      :max-length="400"
                      :loading="innLoadingInvestment"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      ИНН инвестора объекта по обращению с ТКО
                      <hint
                        message="Заполните поле и нажмите на лупу. Связанные поля заполнятся значениями."
                      ></hint>
                    </div>
                    <!-- Может быть ИНН начинающийся с 0, а это не число -->
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="'investments[' + index + '].inn'"
                      v-model="investment.inn"
                      action="icons/Search.svg"
                      :max-length="12"
                      @action="updateInnInvestment(investment)"
                    >
                    </custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      КПП инвестора объекта по обращению с ТКО
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="'investments[' + index + '].kpp'"
                      v-model="investment.kpp"
                      :whole="9"
                      :fraction="0"
                      :loading="innLoadingInvestment"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      ОГРН инвестора объекта по обращению с ТКО
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="'investments[' + index + '].ogrn'"
                      v-model="investment.ogrn"
                      :loading="innLoadingInvestment"
                      :whole="13"
                      :fraction="0"
                    ></custom-input>
                  </div>
                </div>

                <h3>Контактная информация</h3>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="row">
                      <div class="col-50">
                        <div class="form-elem__title">
                          Телефон/факс инвестора объекта по обращению с ТКО
                        </div>
                        <custom-input
                          required
                          type="phone2"
                          :disabled="disableFields"
                          :select-field-disable="disableCheckboxes"
                          :hide-checkbox="hideCheckbox"
                          :select-fields-array="request.verifiedFields"
                          :select-field-name="'investments[' + index + '].phone'"
                          v-model="investment.phone"
                          :loading="innLoadingInvestment"
                          :max-length="20"
                        ></custom-input>
                      </div>

                      <div class="col-50">
                        <div class="form-elem__title">
                          Сотовый телефон инвестора объекта по обращению с ТКО
                        </div>
                        <custom-input
                          type="phone"
                          :disabled="disableFields"
                          :select-field-disable="disableCheckboxes"
                          :hide-checkbox="hideCheckbox"
                          :select-fields-array="request.verifiedFields"
                          :select-field-name="'investments[' + index + '].mobile'"
                          v-model="investment.mobile"
                          :loading="innLoadingInvestment"
                        ></custom-input>
                      </div>
                    </div>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Электронная почта инвестора объекта по обращению с ТКО
                    </div>
                    <custom-input
                      required
                      type="email"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="'investments[' + index + '].email'"
                      v-model="investment.email"
                      :loading="innLoadingInvestment"
                      :max-length="40"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Интернет сайт инвестора объекта по обращению с ТКО
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="'investments[' + index + '].website'"
                      v-model="investment.website"
                      :max-length="40"
                    ></custom-input>
                  </div>
                  <div class="col-50"></div>
                </div>

                <div class="form-elem">
                  <div class="form-elem__title">
                    Юридический адрес инвестора объекта по обращению с ТКО
                  </div>
                  <custom-input
                    required
                    type="text"
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    :select-field-name="'investments[' + index + '].legalAddress'"
                    v-model="investment.legalAddress"
                    :loading="innLoadingInvestment"
                    :max-length="400"
                  ></custom-input>
                </div>

                <div class="form-elem">
                  <div class="form-elem__title">
                    Фактический адрес инвестора объекта по обращению с ТКО
                  </div>
                  <custom-input
                    required
                    type="text"
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    :select-field-name="
                      'investments[' + index + '].actualAddress'
                    "
                    v-model="investment.actualAddress"
                    :loading="innLoadingInvestment"
                    :max-length="400"
                  ></custom-input>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      ФИО руководителя инвестора объекта по обращению с ТКО
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'investments[' + index + '].directorFio'
                      "
                      v-model="investment.directorFio"
                      :max-length="40"
                    ></custom-input>
                  </div>
                  <div class="col-50"></div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      ФИО уполномоченного представителя инвестора объекта по
                      обращению с ТКО
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'investments[' + index + '].representatioveFio'
                      "
                      v-model="investment.representatioveFio"
                      :max-length="40"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Должность уполномоченного представителя инвестора объекта по
                      обращению с ТКО
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'investments[' + index + '].representatiovePosition'
                      "
                      v-model="investment.representatiovePosition"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>

                <div class="form-elem">
                  <div class="form-elem__title">
                    Опыт работы инвестора в сфере обращения с отходами
                  </div>
                  <custom-input
                    required
                    type="textarea"
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    :select-field-name="'investments[' + index + '].experience'"
                    v-model="investment.experience"
                    :max-length="400"
                    placeholder="Указывается успешный опыт реализованных инвестиционных проектов, продолжительность работы и т.д."
                  ></custom-input>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Полная сумма инвестиций для строительства и запуска объекта
                      в промышленную эксплуатацию
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'investments[' + index + '].fullInvestmentAmount'
                      "
                      v-model="investment.fullInvestmentAmount"
                      :fraction="2"
                      :whole="20"
                      :isErrorProp="!investment.fullInvestmentAmount"
                      text="Млн.руб."
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Сумма собственных вложений инвестора
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'investments[' + index + '].personalInvestmentAmount'
                      "
                      v-model="investment.personalInvestmentAmount"
                      :fraction="2"
                      :whole="20"
                      text="Млн.руб."
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Планируемый срок окупаемости объекта
                    </div>
                    <custom-input
                      required
                      type="number"
                      integer
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'investments[' + index + '].plannedPaybackPeriod'
                      "
                      v-model="investment.plannedPaybackPeriod"
                      :fraction="2"
                      :whole="20"
                      text="Лет"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Необходимая валовая выручка
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'investments[' + index + '].requiredGrossRevenue'
                      "
                      v-model="investment.requiredGrossRevenue"
                      :fraction="2"
                      :whole="20"
                      text="Млн.руб./год"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Реквизиты соглашения о намерениях
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'investments[' + index + '].agreementRequisites'
                      "
                      v-model="investment.agreementRequisites"
                      :max-length="4000"
                    ></custom-input>
                  </div>
                  <div class="col-50"></div>
                </div>

                <div class="form-elem">
                  <div class="form-elem__title">
                    Риски реализации проекта (в графе перечисляются потенциальные
                    риски реализации проекта)
                  </div>
                  <custom-input
                    required
                    type="textarea"
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    :select-field-name="'investments[' + index + '].risks'"
                    v-model="investment.risks"
                    :max-length="4000"
                  ></custom-input>
                </div>

                <div class="form-elem">
                  <div class="form-elem__title">
                    Конкурентные преимущества проекта (указать какие именно)
                  </div>
                  <custom-input
                    required
                    type="textarea"
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    :select-field-name="
                      'investments[' + index + '].competitiveAdvantages'
                    "
                    v-model="investment.competitiveAdvantages"
                    :max-length="4000"
                  ></custom-input>
                </div>
              </div>

              <div class="form-elem form-elem--indent">
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary"
                  :disabled="disableFields"
                  @click.prevent="addElement('investments')"
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить инвестора</span>
                </button>
              </div>
            </b-collapse>
          </div>

          <div
            class="form-group"
            v-if="statusIn([STATUS_PERSPECTIVE_ID, STATUS_INVESTMENT_ID])"
            id="blockCost"
          >
            <h2
              v-b-toggle.collapse-9
              class="form-group__title position-relative"
            >
              Сведения о стоимости объекта по обращению с ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-9">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">Стоимость объекта всего</div>
                  <custom-input
                    disabled
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="cost.total"
                    required
                    type="number"
                    v-model="request.cost.total"
                    :fraction="2"
                    :whole="20"
                    text="Млн.руб."
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">Стоимость оборудования всего</div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="cost.equipment"
                    required
                    type="number"
                    v-model="request.cost.equipment"
                    :fraction="2"
                    :whole="20"
                    :isErrorProp="!request.cost.equipment"
                    text="Млн.руб."
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Стоимость оборудования российского производства (всего)
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="cost.russianEquipment"
                    type="number"
                    v-model="request.cost.russianEquipment"
                    :fraction="2"
                    :whole="20"
                    text="Млн.руб."
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Стоимость монтажа и пусконаладки
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="cost.installation"
                    required
                    type="number"
                    v-model="request.cost.installation"
                    :fraction="2"
                    :whole="20"
                    :isErrorProp="!request.cost.installation"
                    text="Млн.руб."
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Стоимость монтажа и пусконаладки произведенного российской
                    компанией
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="cost.russianInstallation"
                    type="number"
                    v-model="request.cost.russianInstallation"
                    :fraction="2"
                    :whole="20"
                    text="Млн.руб."
                  ></custom-input>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" id="blockBorderLandPlot">
            <h2
              v-b-toggle.collapse-10
              class="form-group__title position-relative"
            >
              Сведения о земельном участке (земельных участках), в границах
              которого (которых) находится объект по обращению с ТКО, и
              размещенных на нем (на них) зданиях
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-10">
              <div class="row form-elem">
                <div class="col-50">
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.borderLandPlots[0].hasLandPlotForProjectRealization
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="borderLandPlots[0].hasLandPlotForProjectRealization"
                    text="Наличие земельного участка"
                  ></boolean-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div
                class="condition"
                v-if="request.borderLandPlots[0].hasLandPlotForProjectRealization"
              >
                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Вид собственности на земельный участок
                    </div>
                    <custom-select
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].ownershipType"
                      required
                      v-model="request.borderLandPlots[0].ownershipType"
                      reference-type="OWNERSHIP_TYPE"
                    ></custom-select>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Кадастровый номер земельного участка
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].cadastralNumber"
                      required
                      type="text"
                      v-model="request.borderLandPlots[0].cadastralNumber"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">Категория земель</div>
                    <custom-select
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].landCategory"
                      required
                      v-model="request.borderLandPlots[0].landCategory"
                      reference-type="LAND_CATEGORY"
                    ></custom-select>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Вид разрешенного использования земельного участка
                    </div>
                    <custom-select
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].allowedUsingType"
                      required
                      v-model="request.borderLandPlots[0].allowedUsingType"
                      reference-type="ALLOWED_USING_TYPE"
                    ></custom-select>
                  </div>
                </div>

                <div class="row form-elem">
                  <div v-if="landCategoryIs(ACTION_LAND_ID)" class="col-50">
                    <div class="form-elem__title">
                      Срок приведения в соответствие категории земли
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].compliancePeriod"
                      type="date"
                      required
                      v-model="request.borderLandPlots[0].compliancePeriod"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Выписка из ЕГРП в формате PDF
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.borderLandPlots[0].egrp"
                      :formats="['pdf']"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].egrp"
                      :size="20"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.borderLandPlots[0].hasUrbanDevelopmentPlan"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].hasUrbanDevelopmentPlan"
                      text="Наличие градостроительного плана земельного участка"
                    ></boolean-input>
                  </div>
                  <div class="col-50"></div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.borderLandPlots[0].hasSanityProtectionZone"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].hasSanityProtectionZone"
                      text="Наличие санитарно-защитной зоны"
                    ></boolean-input>
                  </div>
                  <div class="col-50">
                    <div
                      v-if="request.borderLandPlots[0].hasSanityProtectionZone"
                    >
                      <div class="form-elem__title">
                        Размер санитарно-защитной зоны
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="borderLandPlots[0].sanitaryProtectionZoneSize"
                        type="number"
                        v-model="
                          request.borderLandPlots[0].sanitaryProtectionZoneSize
                        "
                        text="Метров"
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наименование правоустанавливающего документа на земельный
                      участок
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].rightsGivingDocumentName"
                      required
                      type="text"
                      :max-length="100"
                      v-model="
                        request.borderLandPlots[0].rightsGivingDocumentName
                      "
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Дата выдачи правоустанавливающего документа на земельный
                      участок
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].rightsGivingDocumentStartDate"
                      required
                      type="date"
                      v-model="
                        request.borderLandPlots[0].rightsGivingDocumentStartDate
                      "
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Номер правоустанавливающего документа на земельный участок
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].rigthsGivingDocumentNumber"
                      required
                      type="text"
                      v-model="
                        request.borderLandPlots[0].rigthsGivingDocumentNumber
                      "
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Правоустанавливающий документ на земельный участок
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.borderLandPlots[0].rigthsGivingDocument"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].rigthsGivingDocument"
                      :formats="['pdf', 'xls', 'xlsx']"
                      :size="30"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                </div>

                <h3 id="blockCurrentLandPlot">
                  Координаты границ земельного участка, на котором расположен
                  объект
                  <div class="tooltip">
                    Координаты границ земельного участка возможно добавить с
                    помощью функциональной кнопки «добавить точку» либо
                    посредством импорта данных из файлов формата электронных
                    таблиц (.csv, .xlsx). Подробная информация об импорте данных
                    приведена в руководстве пользователя
                  </div>
                </h3>

                <div
                  v-for="(currentLandPlot, index) in request.currentLandPlots"
                  :key="'LP-' + index"
                >
                  <h4 class="row row--centered form-elem">
                    Участок {{ index + 1 }}

                    <span
                      @click.prevent="
                        deleteElement('currentLandPlots', currentLandPlot)
                      "
                      v-if="!disableFields"
                    >
                      <img src="icons/Check-error.svg" />
                    </span>
                  </h4>

                  <div class="row form-elem">
                    <div class="col-50">
                      <div class="form-elem__title">
                        Кадастровый номер земельного участка, на котором
                        расположен объект
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'currentLandPlots[' + index + '].cadastralNumber'
                        "
                        required
                        type="text"
                        v-model="currentLandPlot.cadastralNumber"
                      ></custom-input>
                    </div>
                    <div class="col-50">
                      <div class="form-elem__title">Система координат</div>
                      <custom-select
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'currentLandPlots[' + index + '].coordinatesSystem'
                        "
                        required
                        v-model="currentLandPlot.coordinatesSystem"
                        reference-type="COORDINATE_SYSTEM"
                      ></custom-select>
                    </div>
                  </div>

                  <div class="row form-elem">
                    <div class="col-50">
                      <div class="form-elem__title">Номер зоны</div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'currentLandPlots[' + index + '].zoneNumber'
                        "
                        required
                        type="text"
                        :max-length="32"
                        v-model="currentLandPlot.zoneNumber"
                      ></custom-input>
                    </div>
                    <div class="col-50">
                      <div class="form-elem__title">
                        Средняя квадратическая погрешность определения координат
                        характерных точек границ земельного участка
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'currentLandPlots[' + index + '].averageInnacuracy'
                        "
                        required
                        type="number"
                        v-model="currentLandPlot.averageInnacuracy"
                        :fraction="2"
                        :whole="20"
                        :isErrorProp="!currentLandPlot.averageInnacuracy"
                        text="Метр"
                      ></custom-input>
                    </div>
                  </div>

                  <div class="row form-elem">
                    <div class="col-50">
                      <div class="form-elem__title">
                        Документ схемы расположения земельного участка или земельных
                        участков на кадастровом плане территории
                      </div>
                      <file-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'currentLandPlots[' + index + '].scheme'
                        "
                        v-model="currentLandPlot.scheme"
                        :size="30"
                        text
                      ></file-input>
                    </div>
                    <div class="col-50">
                      <div class="form-elem__title">
                        Фотографии схемы расположения земельного участка или земельных
                        участков на кадастровом плане территории
                      </div>
                      <photos-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-field-name="
                          'currentLandPlots[' + index + '].schemePhotos'
                        "
                        :select-fields-array="request.verifiedFields"
                        v-model="currentLandPlot.schemePhotos"
                      ></photos-input>
                    </div>
                  </div>

                  <div class="form-elem form-elem--indent">
                    <table class="tbl">
                      <thead>
                        <tr>
                          <th>Номер точки</th>
                          <th>Координата точки X</th>
                          <th>Координата точки Y</th>
                          <th>Описание закрепления на местности</th>
                          <th class="border-end"></th>
                          <th>Номер точки (ЕГРН)</th>
                          <th>Координата точки X (ЕГРН)</th>
                          <th>Координата точки Y (ЕГРН)</th>
                          <th>Результаты сопоставления</th>
                          <th class="border-end"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(point, key) in getLandPlotPoints(currentLandPlot)" :key="key">
                          <td>
                            {{ point.number || '-' }}
                          </td>
                          <td>
                            {{ point.x || '-' }}
                          </td>
                          <td>
                            {{ point.y || '-' }}
                          </td>
                          <td>
                            {{ point.description ? point.description.value : '-' }}
                          </td>
                          <td class="border-end text-end">
                            <button
                              v-if="
                                point.x && point.y &&
                                (
                                  point.number !== point.imported.number ||
                                  (point.x !== point.imported.x && point.y !== point.imported.y)
                                )
                              "
                              type="button"
                              class="btn btn-transparent btn-grey"
                              :disabled="disableFields"
                              @click.prevent="editPoint(currentLandPlot, point)"
                            >
                              <img src="icons/Pen.svg" />
                            </button>
                            <button
                              v-if="
                                point.x && point.y &&
                                (
                                  point.number !== point.imported.number ||
                                  (point.x !== point.imported.x && point.y !== point.imported.y)
                                )
                              "
                              type="button"
                              class="btn btn-transparent btn-grey"
                              :disabled="disableFields"
                              @click.prevent="deletePoint(currentLandPlot, point)"
                            >
                              <img src="icons/Trash.svg" />
                            </button>
                          </td>
                          <td>
                            {{ point.imported.number || '-' }}
                          </td>
                          <td>
                            {{ point.imported.x || '-' }}
                          </td>
                          <td>
                            {{ point.imported.y || '-' }}
                          </td>
                          <td>
                            <span v-if="point.same" class="text-right text-success">
                              сопоставлено
                            </span>
                            <span v-else class="text-right text-danger">
                              не сопоставлено
                            </span>
                          </td>
                          <td class="border-end text-end">
                            <button
                              v-if="point.imported.x && point.imported.y"
                              type="button"
                              class="btn btn-transparent btn-grey"
                              :disabled="disableFields"
                              @click.prevent="deletePoint(currentLandPlot, point, true)"
                            >
                              <img src="icons/Trash.svg" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div class="form-elem form-elem--indent">
                      <button
                        v-if="!currentLandPlot.importedPoints || !currentLandPlot.importedPoints.length"
                        type="button"
                        class="btn btn-lg btn-transparent btn-secondary"
                        :disabled="disableFields"
                        @click.prevent="openPoint(currentLandPlot)"
                      >
                        <img left src="icons/Circle-plus.svg" />
                        <span>Добавить точку</span>
                      </button>

                      <button
                        type="button"
                        class="btn btn-lg btn-transparent btn-secondary"
                        @click="requestImportModal = currentLandPlot.id"
                      >
                        <img left src="icons/Circle-plus.svg" />
                        <span>Импорт точек из файла</span>
                      </button>

                      <import-modal
                        v-if="requestImportModal === currentLandPlot.id"
                        accept=".xml"
                        @close="requestImportModal = false"
                        @apply="(coords) => applyImportModal(coords, currentLandPlot)"
                      />
                    </div>

                    <div class="form-elem form-elem--hr"></div>
                  </div>
                </div>

                <div class="form-elem">
                  <button
                    type="button"
                    class="btn btn-lg btn-transparent btn-secondary"
                    :disabled="disableFields"
                    @click.prevent="
                      addElement('currentLandPlots', { points: [], importedPoints: [], created: new Date() })
                    "
                  >
                    <img left src="icons/Circle-plus.svg" />
                    <span>Добавить земельный участок</span>
                  </button>
                </div>
              </div>
              <div class="form-group" id="blockCharacteristicLandPlot">
                <h2 class="form-group__title">
                  Характеристика существующего/планируемого земельного участка
                </h2>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">Площадь земельного участка</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].landPotArea"
                      type="number"
                      v-model="request.borderLandPlots[0].landPotArea"
                      :fraction="3"
                      :whole="20"
                      text="Кв.м."
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Площадь участка пригодная для ведения хозяйственной
                      деятельности
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].suitableForExonomicActivitiesLandPloArea"
                      type="number"
                      v-model="
                        request.borderLandPlots[0]
                          .suitableForExonomicActivitiesLandPloArea
                      "
                      :fraction="3"
                      :whole="20"
                      text="Кв.м."
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наименование ближайшего населенного пункта
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].nearestSettlementName"
                      required
                      type="text"
                      :max-length="400"
                      v-model="request.borderLandPlots[0].nearestSettlementName"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Расстояние до ближайшего населенного пункта
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].distanceToNearestSettlement"
                      required
                      type="number"
                      v-model="
                        request.borderLandPlots[0].distanceToNearestSettlement
                      "
                      :fraction="3"
                      :whole="20"
                      :isErrorProp="!request.borderLandPlots[0].distanceToNearestSettlement"
                      text="Км"
                    ></custom-input>
                  </div>
                </div>

                <div class="form-elem">
                  <div class="form-elem__title">
                    Адрес здания (сооружения) на территории земельного участка, на
                    котором расположен объект
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="borderLandPlots[0].address"
                    type="text"
                    :max-length="400"
                    v-model="request.borderLandPlots[0].address"
                  ></custom-input>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Кадастровый номер здания (сооружения) на территории
                      земельного участка, на котором расположен объект
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].buildingCadastralNumber"
                      type="text"
                      v-model="request.borderLandPlots[0].buildingCadastralNumber"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Площадь здания (сооружения) на территории земельного
                      участка, на котором расположен объект
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].area"
                      type="number"
                      v-model="request.borderLandPlots[0].area"
                      :fraction="3"
                      :whole="20"
                      text="Кв.м."
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.borderLandPlots[0].hasPowerSupply"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].hasPowerSupply"
                      text="Наличие энергоснабжения"
                    ></boolean-input>
                  </div>
                  <div class="col-50">
                    <div v-if="request.borderLandPlots[0].hasPowerSupply">
                      <div class="form-elem__title">
                        Выделенная электрическая мощность
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="borderLandPlots[0].dedicatedElecricalPower"
                        type="number"
                        v-model="
                          request.borderLandPlots[0].dedicatedElecricalPower
                        "
                        :whole="20"
                        :fraction="3"
                        text="кВт"
                      ></custom-input>
                    </div>
                    <div v-else>
                      <div class="form-elem__title">
                        Срок подключения к электроснабжению
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="borderLandPlots[0].powerSupplyConnectionDate"
                        required
                        type="date"
                        v-model="
                          request.borderLandPlots[0].powerSupplyConnectionDate
                        "
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.borderLandPlots[0].hasWaterSupply"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].hasWaterSupply"
                      text="Наличие водоснабжения и водоотведения"
                      null-value="Не требуется"
                    ></boolean-input>
                  </div>
                  <div class="col-50">
                    <div v-if="request.borderLandPlots[0].hasWaterSupply">
                      <div class="form-elem__title">
                        Мощность водоснабжения и водоотведения
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="borderLandPlots[0].waterSupplyPower"
                        type="number"
                        text="Куб.м./час"
                        :whole="20"
                        :fraction="3"
                        v-model="request.borderLandPlots[0].waterSupplyPower"
                      ></custom-input>
                    </div>
                    <div
                      v-else-if="
                        request.borderLandPlots[0].hasWaterSupply === false
                      "
                    >
                      <div class="form-elem__title">
                        Срок подключения к водоснабжению
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="borderLandPlots[0].watterSupplyConnectionDate"
                        required
                        type="date"
                        v-model="
                          request.borderLandPlots[0].watterSupplyConnectionDate
                        "
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.borderLandPlots[0].hasGasSupply"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].hasGasSupply"
                      text="Наличие газоснабжения"
                      null-value="Не требуется"
                    ></boolean-input>
                  </div>
                  <div class="col-50">
                    <div v-if="request.borderLandPlots[0].hasGasSupply">
                      <div class="form-elem__title">Мощность газоснабжения</div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="borderLandPlots[0].gasSupplyPower"
                        type="number"
                        v-model="request.borderLandPlots[0].gasSupplyPower"
                        :whole="20"
                        :fraction="3"
                        text="Куб.м./час"
                      ></custom-input>
                    </div>
                    <div
                      v-else-if="
                        request.borderLandPlots[0].hasGasSupply === false
                      "
                    >
                      <div class="form-elem__title">
                        Срок подключения к газоснабжению
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="borderLandPlots[0].gasSupplyConnectionDate"
                        required
                        type="date"
                        v-model="
                          request.borderLandPlots[0].gasSupplyConnectionDate
                        "
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.borderLandPlots[0].hasHeatPipelinesConnection
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].hasHeatPipelinesConnection"
                      text="Наличие подключения к тепловым сетям"
                      null-value="Не требуется"
                    ></boolean-input>
                  </div>
                  <div class="col-50">
                    <div
                      v-if="request.borderLandPlots[0].hasHeatPipelinesConnection"
                    ></div>
                    <div
                      v-else-if="
                        request.borderLandPlots[0].hasHeatPipelinesConnection ===
                          false
                      "
                    >
                      <div class="form-elem__title">
                        Срок подключения к тепловым сетям
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="borderLandPlots[0].heatPipelinesConnectionStartDate"
                        required
                        type="date"
                        v-model="
                          request.borderLandPlots[0]
                            .heatPipelinesConnectionStartDate
                        "
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.borderLandPlots[0].hasAutomobileAccessRoads
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].hasAutomobileAccessRoads"
                      text="Наличие автомобильных подъездных путей"
                    ></boolean-input>
                  </div>
                  <div class="col-50">
                    <div
                      v-if="!request.borderLandPlots[0].hasAutomobileAccessRoads"
                    >
                      <div class="form-elem__title">
                        Срок организации подъездных путей
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="borderLandPlots[0].automobileAccessRoadsConnectionDate"
                        required
                        type="date"
                        v-model="
                          request.borderLandPlots[0]
                            .automobileAccessRoadsConnectionDate
                        "
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.borderLandPlots[0].hasRailway"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].hasRailway"
                      text="Наличие железнодорожных путей"
                    ></boolean-input>
                  </div>
                  <div class="col-50">
                    <div v-if="request.borderLandPlots[0].hasRailway">
                      <div class="form-elem__title">
                        Расстояние от объекта, до ближайшей действующей ж/д ветки
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="borderLandPlots[0].distanceToNearestRailway"
                        required
                        type="number"
                        v-model="
                          request.borderLandPlots[0].distanceToNearestRailway
                        "
                        :whole="20"
                        :fraction="3"
                        text="Км"
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div
                  class="condition"
                  v-if="request.borderLandPlots[0].hasRailway"
                >
                  <div class="row form-elem">
                    <div class="col-50"></div>
                    <div class="col-50">
                      <div class="form-elem__title">
                        Расстояние до действующего пункта перевалки на
                        железнодорожном транспорте
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        type="number"
                        select-field-name="borderLandPlots[0].distanceToNearestTransshipment"
                        v-model="
                          request.borderLandPlots[0]
                            .distanceToNearestTransshipment
                        "
                        :whole="20"
                        :fraction="3"
                        :isErrorProp="
                          !request.borderLandPlots[0]
                            .distanceToNearestTransshipment
                        "
                        required
                        text="Км"
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Расстояние до ближайшего аэропорта
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      required
                      type="number"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].distanceToNearestAirport"
                      v-model="
                        request.borderLandPlots[0].distanceToNearestAirport
                      "
                      :whole="20"
                      :fraction="3"
                      :isErrorProp="!request.borderLandPlots[0].distanceToNearestAirport"
                      text="Км"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">Наименование аэропорта</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      required
                      type="text"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="borderLandPlots[0].nearestAirportName"
                      v-model="request.borderLandPlots[0].nearestAirportName"
                    ></custom-input>
                  </div>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" id="blockAcceptanceDocumentation">
            <h2
              v-b-toggle.collapse-11
              class="form-group__title position-relative"
            >
              Сведения о проектно-разрешительной документации, разрешениях и
              заключениях на объект
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-11">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие финансово-экономического обоснования проекта
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    required
                    v-model="
                      request.acceptanceDocumentation.hasFinancialJustification
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasFinancialJustification"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="
                      request.acceptanceDocumentation.hasFinancialJustification
                    "
                  >
                    <div class="form-elem__title">
                      Финансово-экономическое обоснование проекта
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.acceptanceDocumentation.financialJustification
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.financialJustification"
                      :formats="['pdf', 'xls', 'xlsx']"
                      :size="30"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation
                        .hasFinancialJustification === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noJustificationReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation.noJustificationReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие финансовой модели проекта
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.acceptanceDocumentation.hasFinModel"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasFinModel"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.acceptanceDocumentation.hasFinModel">
                    <div class="form-elem__title">Финансовая модель проекта</div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.acceptanceDocumentation.finModel"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.finModel"
                      :formats="['pdf', 'xls', 'xlsx']"
                      :size="30"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation.hasFinModel === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noFinModelReason"
                      type="text"
                      v-model="request.acceptanceDocumentation.noFinModelReason"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие технического задания на проектирование
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.acceptanceDocumentation.hasTechnicalSpecification
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasTechnicalSpecification"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="
                      request.acceptanceDocumentation.hasTechnicalSpecification
                    "
                  >
                    <div class="form-elem__title">
                      Техническое задание на проектирование
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.acceptanceDocumentation.technicalSpecification
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.technicalSpecification"
                      :formats="['pdf', 'xls', 'xlsx']"
                      :size="30"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation
                        .hasTechnicalSpecification === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noTechnicalSpecificationReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation
                          .noTechnicalSpecificationReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие проектной документации
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.acceptanceDocumentation.hasProjectDocumentation
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasProjectDocumentation"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="request.acceptanceDocumentation.hasProjectDocumentation"
                  >
                    <div class="form-elem__title">
                      Проектная документация на объект по обращению с ТКО
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.acceptanceDocumentation.projectDocumentation
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.projectDocumentation"
                      :formats="['pdf', 'xls', 'xlsx']"
                      :size="30"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation.hasProjectDocumentation ===
                        false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noProjectDocumentationReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation
                          .noProjectDocumentationReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="condition"
                v-if="request.acceptanceDocumentation.hasProjectDocumentation"
              >
                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наименование проектной организации
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.projectOrganizationName"
                      required
                      type="text"
                      v-model="
                        request.acceptanceDocumentation.projectOrganizationName
                      "
                      :max-length="400"
                      :loading="innLoadingProjectOrganization"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      ИНН проектной организации
                      <hint
                        message="Заполните поле и нажмите на лупу. Связанные поля заполнятся значениями."
                      ></hint>
                    </div>
                    <!-- Может быть ИНН начинающийся с 0, а это не число -->
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.projectOrganizationInn"
                      required
                      type="text"
                      v-model="
                        request.acceptanceDocumentation.projectOrganizationInn
                      "
                      action="icons/Search.svg"
                      :max-length="12"
                      @action="updateInnProjectOrganization"
                    >
                    </custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие проведенных исследований по оценке воздействия на
                    окружающую среду
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.acceptanceDocumentation
                        .hasEnvironmentalImpactResearch
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasEnvironmentalImpactResearch"
                    null-value="Проведение не требуется"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="
                      request.acceptanceDocumentation
                        .hasEnvironmentalImpactResearch
                    "
                  >
                    <div class="form-elem__title">
                      Результаты исследований по оценке воздействия на окружающую
                      среду
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.acceptanceDocumentation
                          .environmentalImpactResearchResults
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.environmentalImpactResearchResults"
                      :formats="['pdf']"
                      :size="10"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation
                        .hasEnvironmentalImpactResearch === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noResearchReason"
                      type="text"
                      v-model="request.acceptanceDocumentation.noResearchReason"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие заключения Главгосэкспертизы
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.acceptanceDocumentation.hasGovernmentConclusion
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasGovernmentConclusion"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="request.acceptanceDocumentation.hasGovernmentConclusion"
                  >
                    <div class="form-elem__title">
                      Дата заключения Главгосэкспертизы
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      required
                      type="date"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.governmentConclusionDate"
                      v-model="
                        request.acceptanceDocumentation.governmentConclusionDate
                      "
                    ></custom-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation.hasGovernmentConclusion ===
                        false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noGovernmentConclusionReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation
                          .noGovernmentConclusionReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="condition"
                v-if="request.acceptanceDocumentation.hasGovernmentConclusion"
              >
                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наименование учреждения, выдавшего заключение
                      Главгосэкспертизы
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      type="text"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.governmentConclusionIssuer"
                      v-model="
                        request.acceptanceDocumentation.governmentConclusionIssuer
                      "
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Номер заключения Главгосэкспертизы
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      type="text"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.governmentConclusionNumber"
                      v-model="
                        request.acceptanceDocumentation.governmentConclusionNumber
                      "
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Заключение Главгосэкспертизы
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.acceptanceDocumentation.governmentConclusion
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.governmentConclusion"
                      :formats="['pdf']"
                      :size="10"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие проведенных публичных слушаний проектной документации
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.acceptanceDocumentation.publicHearingsCompleted
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.publicHearingsCompleted"
                    null-value="Проведение не требуется"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="request.acceptanceDocumentation.publicHearingsCompleted"
                  >
                    <div class="form-elem__title">
                      Результаты публичных слушаний проектной документации
                      (протокол)
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.acceptanceDocumentation.publicHearingsResults
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.publicHearingsResults"
                      :formats="['pdf']"
                      :size="10"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation.publicHearingsCompleted ===
                        false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noPublicHearingsReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation.noPublicHearingsReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие постановки на государственный учет объекта
                    оказывающего негативное воздействие на окружающую среду
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.acceptanceDocumentation.hasStateRegistration"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasStateRegistration"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="request.acceptanceDocumentation.hasStateRegistration"
                  >
                    <div class="form-elem__title">
                      Номер выдачи свидетельства о постановке на государственный
                      учет объекта оказывающего негативное воздействие на
                      окружающую среду
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.stateRegistrationNumber"
                      required
                      type="text"
                      v-model="
                        request.acceptanceDocumentation.stateRegistrationNumber
                      "
                    ></custom-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation.hasStateRegistration ===
                        false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noStateRegistrationReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation.noStateRegistrationReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                v-if="request.acceptanceDocumentation.hasStateRegistration"
                class="condition"
              >
                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Дата выдачи свидетельства о постановке на государственный
                      учет объекта оказывающего негативное воздействие на
                      окружающую среду
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.stateRegistrationDate"
                      required
                      type="date"
                      v-model="
                        request.acceptanceDocumentation.stateRegistrationDate
                      "
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Свидетельство о постановке на государственный учет объекта
                      оказывающего негативное воздействие на окружающую среду
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.acceptanceDocumentation.stateRegistration"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.stateRegistration"
                      :formats="['pdf']"
                      :size="10"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие заключения государственной экологической экспертизы
                    проектной документации
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.acceptanceDocumentation
                        .hasGovernmentEnvironmentalConclusion
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasGovernmentEnvironmentalConclusion"
                    null-value="Проведение не требуется"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="
                      request.acceptanceDocumentation
                        .hasGovernmentEnvironmentalConclusion
                    "
                  >
                    <div class="form-elem__title">
                      Результаты заключения государственной экологической
                      экспертизы проектной документации
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.acceptanceDocumentation
                          .governmentEnvironmentalConclusion
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.governmentEnvironmentalConclusion"
                      :formats="['pdf']"
                      :size="10"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation
                        .hasGovernmentEnvironmentalConclusion === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noGovernmentEnvironmentalConclusionReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation
                          .noGovernmentEnvironmentalConclusionReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Категория и код объекта о постановке на государственный учет
                  </div>
                  <custom-select
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.objectCategory"
                    required
                    v-model="request.acceptanceDocumentation.objectCategory"
                    reference-type="NEGATIVE_OBJECT_CATEGORY"
                  ></custom-select>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие комплексного экологического разрешения, декларации и
                    иных документов в части нормирования отходов.
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.acceptanceDocumentation
                        .hasIntegratedEnvironmentalPermission
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasIntegratedEnvironmentalPermission"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="
                      request.acceptanceDocumentation
                        .hasIntegratedEnvironmentalPermission
                    "
                  >
                    <div class="form-elem__title">
                      Документ комплексного экологического разрешения, декларации
                      и иных документов в части нормирования отходов
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.acceptanceDocumentation
                          .integratedEnvironmentalPermission
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.integratedEnvironmentalPermission"
                      :formats="['pdf']"
                      :size="10"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation
                        .hasIntegratedEnvironmentalPermission === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noIntegratedEnvironmentalPermissionReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation
                          .noIntegratedEnvironmentalPermissionReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие утвержденной инвестиционной и производственной
                    программы в области обращения с ТКО
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.acceptanceDocumentation.hasInvestmentProgram"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasInvestmentProgram"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="request.acceptanceDocumentation.hasInvestmentProgram"
                  >
                    <div class="form-elem__title">
                      Утвержденная инвестиционная и производственная программы в
                      области обращения с ТКО
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.acceptanceDocumentation.investmentProgram"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.investmentProgram"
                      :formats="['pdf']"
                      :size="10"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation.hasInvestmentProgram ===
                        false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noInvestmentProgramReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation.noInvestmentProgramReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие программы производственного экологического контроля
                    (ПЭК) и отчета об организации и о результатах осуществления
                    ПЭК
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.acceptanceDocumentation.hasEnvironmentControlProgram
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasEnvironmentControlProgram"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="
                      request.acceptanceDocumentation.hasEnvironmentControlProgram
                    "
                  >
                    <div class="form-elem__title">
                      Документ комплексного экологического разрешения, декларации
                      и иных документов в части нормирования отходов
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="
                        request.acceptanceDocumentation.environmentControlProgram
                      "
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.environmentControlProgram"
                      :formats="['pdf']"
                      :size="10"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation
                        .hasEnvironmentControlProgram === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noEnvironmentControlProgramReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation
                          .noEnvironmentControlProgramReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие санитарно-эпидемиологического заключения о
                    соответствии санитарным правилам зданий, строений, сооружений,
                    помещений, оборудования, которые планируется использовать для
                    выполнения заявленных работ, составляющих деятельность по
                    обращению с отходами
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.acceptanceDocumentation.hasSanPinConclusion"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasSanPinConclusion"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.acceptanceDocumentation.hasSanPinConclusion">
                    <div class="form-elem__title">
                      Санитарно-эпидемиологического заключения о соответствии
                      санитарным правилам зданий, строений, сооружений, помещений,
                      оборудования, которые планируется использовать для
                      выполнения заявленных работ, составляющих деятельность по
                      обращению с отходами
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.acceptanceDocumentation.sanPinConclusion"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.sanPinConclusion"
                      :formats="['pdf']"
                      :size="10"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation.hasSanPinConclusion ===
                        false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noSanPinConclusionReason"
                      type="text"
                      v-model="
                        request.acceptanceDocumentation.noSanPinConclusionReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие лицензии на осуществление деятельности по сбору,
                    транспортированию, обработке, утилизации, обезвреживанию,
                    размещению отходов I - IV классов опасности
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.acceptanceDocumentation.hasLicence"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasLicence"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.acceptanceDocumentation.hasLicence">
                    <div class="form-elem__title">
                      Номер лицензии на деятельность по сбору, транспортированию,
                      обработке, утилизации, обезвреживанию, размещению отходов I
                      - IV классов опасности (при наличии лицензии)
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.licenceNumber"
                      type="text"
                      v-model="request.acceptanceDocumentation.licenceNumber"
                    >
                    </custom-input>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation.hasLicence === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noSanPinConclusionReason"
                      type="text"
                      v-model="request.acceptanceDocumentation.noLicenceReason"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="condition"
                v-if="request.acceptanceDocumentation.hasLicence"
              >
                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Дата выдачи лицензии на деятельность по сбору,
                      транспортированию, обработке, утилизации, обезвреживанию,
                      размещению отходов I - IV классов опасности (при наличии
                      лицензии)
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.licenceStartDate"
                      type="date"
                      v-model="request.acceptanceDocumentation.licenceStartDate"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наименование органа, выдавшего лицензию на деятельность по
                      сбору, транспортированию, обработке, утилизации,
                      обезвреживанию, размещению отходов I - IV классов опасности
                      (при наличии лицензии)
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.licenceAuthor"
                      required
                      type="text"
                      :max-length="400"
                      v-model="request.acceptanceDocumentation.licenceAuthor"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="condition"
                v-if="!request.acceptanceDocumentation.hasLicence"
              >
                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Срок получения лицензии на осуществление деятельности по
                      сбору, транспортированию, обработке, утилизации,
                      обезвреживанию, размещению отходов I - IV классов опасности
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.licenceWillBeGivenDate"
                      required
                      type="date"
                      v-model="
                        request.acceptanceDocumentation.licenceWillBeGivenDate
                      "
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                v-if="typeIs(PLACING_ID)"
                class="row form-elem form-elem--indent form-elem--hr"
              >
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие включения объекта в Государственный реестр объектов
                    размещения отходов (ГРОРО)
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.acceptanceDocumentation.isInRegistry"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.isInRegistry"
                    null-value="Включение в ГРОРО не требуется"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.acceptanceDocumentation.isInRegistry">
                    <div class="form-elem__title">Номер объекта в ГРОРО</div>
                    <custom-select
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.groro"
                      required
                      v-model="request.acceptanceDocumentation.groro"
                      reference-type="GRORO"
                    ></custom-select>
                  </div>
                  <div
                    v-else-if="
                      request.acceptanceDocumentation.isInRegistry === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.noGroroReason"
                      type="text"
                      required
                      v-model="request.acceptanceDocumentation.noGroroReason"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="
                  request.acceptanceDocumentation.isInRegistry &&
                    typeIs(PLACING_ID)
                "
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Реквизиты приказа уполномоченного органа о включении объекта в
                    ГРОРО
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.groroRequestRequisites"
                    required
                    type="text"
                    :max-length="400"
                    v-model="
                      request.acceptanceDocumentation.groroRequestRequisites
                    "
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие объекта в территориальной схеме обращения с отходами
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.acceptanceDocumentation.isInTerritorialScheme
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.isInTerritorialScheme"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="request.acceptanceDocumentation.isInTerritorialScheme"
                  >
                    <div class="form-elem__title">
                      Реквизиты документа, закрепляющего включение объекта в
                      территориальную схему
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.territorialSchemeDocumentRequisites"
                      required
                      type="text"
                      :max-length="4000"
                      v-model="
                        request.acceptanceDocumentation
                          .territorialSchemeDocumentRequisites
                      "
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="request.acceptanceDocumentation.isInTerritorialScheme"
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Ссылка на раздел (страницу) действующей территориальной схемы,
                    в котором упомянут объект
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.territorialSchemeLink"
                    required
                    type="text"
                    :max-length="400"
                    v-model="
                      request.acceptanceDocumentation.territorialSchemeLink
                    "
                  ></custom-input>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="request.acceptanceDocumentation.isInTerritorialScheme"
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Ссылка на электронную модель территориальной схемы обращения с
                    отходами
                    <hint
                      message="Указать электронный ресурс, на котором размещена электронная модель
                                        территориальной схемы обращения с отходами"
                    ></hint>
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.territorialSchemeModelLink"
                    required
                    type="text"
                    :max-length="400"
                    v-model="
                      request.acceptanceDocumentation.territorialSchemeModelLink
                    "
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие специальных (геологических, гидрологических и иных)
                    изысканий (исследований)
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.acceptanceDocumentation.hasSpecialInvestigations
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasSpecialInvestigations"
                    null-value="Изыскания не требуются"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="
                      request.acceptanceDocumentation.hasSpecialInvestigations
                    "
                  >
                    <div class="form-elem__title">
                      Наименование органа, организации, проводившей специальные
                      изыскания (исследования)
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.specialInvestigator"
                      required
                      type="text"
                      :max-length="400"
                      v-model="
                        request.acceptanceDocumentation.specialInvestigator
                      "
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="request.acceptanceDocumentation.hasSpecialInvestigations"
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Период проведения специальных (геологических, гидрологических
                    и иных) изысканий (исследований)
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.specialInvestigationsDate"
                    required
                    type="date"
                    v-model="
                      request.acceptanceDocumentation.specialInvestigationsDate
                    "
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Земельный участок располагается в границах населенных пунктов,
                    лесопарковых, курортных, лечебно-оздоровительных,
                    рекреационных зон, а также водоохранных зон, на водосборных
                    площадях подземных водных объектов, которые используются в
                    целях питьевого и хозяйственно-бытового водоснабжения, в
                    местах залегания полезных ископаемых и ведения горных работ
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.acceptanceDocumentation.isOnBorder"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.isOnBorder"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Класс опасности предприятия (указывается в соответствии с
                    Федеральным законом от 21 июля 1997 г. № 116-ФЗ «О
                    промышленной безопасности опасных производственных объектов»)
                  </div>
                  <custom-select
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.dangerType"
                    :required="request.acceptanceDocumentation.isOnBorder"
                    v-model="request.acceptanceDocumentation.dangerType"
                    reference-type="DANGER_TYPE"
                  ></custom-select>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие результатов проб воды, воздуха, почвы
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.acceptanceDocumentation.hasSamples"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="acceptanceDocumentation.hasSamples"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.acceptanceDocumentation.hasSamples">
                    <div class="form-elem__title">
                      Результаты проб воды, воздуха, почвы
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.acceptanceDocumentation.samplesResults"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="acceptanceDocumentation.samplesResults"
                      :formats="['pdf']"
                      :size="10"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" id="blockSchedule">
            <h2
              v-b-toggle.collapse-12
              class="form-group__title position-relative"
            >
              Сведения о графике работы объекта по обращению с ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-12">
              <div class="form-elem">
                <schedule-input
                  required
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  select-field-name="workSchedule.scheduleJson"
                  v-model="request.workSchedule.scheduleJson"
                ></schedule-input>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Количество рабочих смен в сутки (указывается количество
                    рабочих смен)
                  </div>
                  <custom-input
                    required
                    type="number"
                    integer
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="workSchedule.shiftsPerDayCount"
                    :whole="20"
                    :fraction="0"
                    :isErrorProp="!request.workSchedule.shiftsPerDayCount"
                    v-model="request.workSchedule.shiftsPerDayCount"
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Количество рабочих дней в году (указывается без учёта плановых
                    остановок оборудования)
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    integer
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="workSchedule.daysPerYearCount"
                    required
                    type="number"
                    :isErrorProp="!request.workSchedule.daysPerYearCount"
                    v-model="request.workSchedule.daysPerYearCount"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Количество рабочих мест (указывается в количестве человек)
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    integer
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="workSchedule.workplacesCount"
                    required
                    type="number"
                    :isErrorProp="!request.workSchedule.workplacesCount"
                    v-model="request.workSchedule.workplacesCount"
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Количество управленческого персонала (указывается в количестве
                    человек)
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    integer
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="workSchedule.managersCount"
                    required
                    type="number"
                    :isErrorProp="!request.workSchedule.managersCount"
                    v-model="request.workSchedule.managersCount"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Количество производственного персонала (рабочих) (указывается
                    в количестве человек)
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    integer
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="workSchedule.workersCount"
                    required
                    type="number"
                    :isErrorProp="!request.workSchedule.workersCount"
                    v-model="request.workSchedule.workersCount"
                  ></custom-input>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" id="blockTariffs">
            <h2
              v-b-toggle.collapse-13
              class="form-group__title position-relative"
            >
              Сведения о тарифах объекта по обращению с ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-13">
              <div class="row form-elem">
                <!--                            <div class="col-50" v-if="typeIs(PLACING_ID)">-->
                <!--                                <div class="form-elem__title">-->
                <!--                                    Среднегодовой тариф на приём отходов на объекте (указывается за одну тонну в текущем-->
                <!--                                    году)-->
                <!--                                </div>-->
                <!--                                <custom-input type="number" required-->
                <!--                                              :disabled="disableFields"-->
                <!--                                              :select-field-disable="disableCheckboxes"-->
                <!--                                              :hide-checkbox="hideCheckbox"-->
                <!--                                              :select-fields-array="request.verifiedFields"-->
                <!--                                              select-field-name="tariffInfo.averageYearWasteReceiving"-->
                <!--                                              v-model="request.tariffInfo.averageYearWasteReceiving"-->
                <!--                                              :fraction="2" :whole="20"-->
                <!--                                              text="руб./т"-->
                <!--                                ></custom-input>-->
                <!--                            </div>-->
                <div class="col-50" v-if="!typeIs(PLACING_ID)">
                  <div class="form-elem__title" v-if="typeIs(RECYCLING_ID)">
                    Тариф на захоронение образованных объектом отходов
                    (указывается за одну тонну в текущем году)
                  </div>
                  <div class="form-elem__title" v-else>
                    Тариф на захоронение образованных объектом отходов
                    (указывается за одну тонну в первый год эксплуатации)
                  </div>
                  <custom-input
                    type="number"
                    required
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="tariffInfo.burial"
                    v-model="request.tariffInfo.burial"
                    :fraction="2"
                    :whole="20"
                    :isErrorProp="!request.tariffInfo.burial"
                    text="руб./т"
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <!-- Тарифы -->
              <div>
                <div
                  v-for="(tariff, index) in request.tariffInfo.tariffs"
                  :key="'TARIFF-' + index"
                >
                  <h4 class="row row--centered form-elem">
                    Тариф {{ index + 1 }}

                    <span
                      @click.prevent="
                        deleteUnit(request.tariffInfo.tariffs, unit, index)
                      "
                      v-if="!disableFields"
                    >
                      <img src="icons/Check-error.svg" />
                    </span>
                  </h4>

                  <div class="row form-elem">
                    <div class="col-50">
                      <div class="form-elem__title" v-if="typeIs(RECYCLING_ID)">
                        Предельный тариф на обработку твердых коммунальных отходов
                      </div>
                      <div
                        class="form-elem__title"
                        v-else-if="typeIs(UTILIZATION_ID)"
                      >
                        Предельный тариф на энергетическую утилизацию
                      </div>
                      <div
                        class="form-elem__title"
                        v-else-if="typeIs(NEUTRALIZATION_ID)"
                      >
                        Предельный тариф на обезвреживание твердых коммунальных
                        отходов
                      </div>
                      <div class="form-elem__title" v-else>
                        Предельный тариф на захоронение твердых коммунальных
                        отходов
                      </div>
                      <custom-input
                        required
                        type="number"
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'infrastructureObjectInfo.tariffInfo.tariffs[' +
                            index +
                            '].tariffPerTon'
                        "
                        v-model="tariff.tariffPerTon"
                        :fraction="2"
                        :whole="20"
                        :isErrorProp="!tariff.tariffPerTon"
                        text="руб./т"
                      ></custom-input>
                    </div>
                    <div class="col-50"></div>
                  </div>

                  <div class="row form-elem">
                    <div class="col-50">
                      <div class="form-elem__title">
                        Период действия тарифа с:
                      </div>
                      <custom-input
                        required
                        type="date"
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'infrastructureObjectInfo.tariffInfo.tariffs[' +
                            index +
                            '].tariffStartDate'
                        "
                        v-model="tariff.tariffStartDate"
                      ></custom-input>
                    </div>
                    <div class="col-50">
                      <div class="form-elem__title">
                        Период действия тарифа по:
                      </div>
                      <custom-input
                        required
                        type="date"
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'infrastructureObjectInfo.tariffInfo.tariffs[' +
                            index +
                            '].tariffEndDate'
                        "
                        v-model="tariff.tariffEndDate"
                      ></custom-input>
                    </div>
                  </div>

                  <div class="row form-elem">
                    <div class="col-50">
                      <div class="form-elem__title">
                        Документ об утвержденном тарифе
                      </div>
                      <photos-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'infrastructureObjectInfo.tariffInfo.tariffs[' +
                            index +
                            '].tariffDocumentPhotos'
                        "
                        v-model="tariff.tariffDocumentPhotos"
                      ></photos-input>
                      <file-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'infrastructureObjectInfo.tariffInfo.tariffs[' +
                            index +
                            '].tariffDocument'
                        "
                        v-model="tariff.tariffDocument"
                        :formats="['pdf']"
                        :size="20"
                        @onPdfView="onPdfView"
                      ></file-input>
                    </div>
                    <div class="col-50"></div>
                  </div>
                </div>

                <div class="form-elem form-elem--indent">
                  <button
                    type="button"
                    class="btn btn-lg btn-transparent btn-secondary"
                    :disabled="disableFields"
                    @click.prevent="addUnit(request.tariffInfo.tariffs)"
                  >
                    <img left src="icons/Circle-plus.svg" />
                    <span>Добавить тариф</span>
                  </button>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" id="blockIndicators">
            <h2
              v-b-toggle.collapse-14
              class="form-group__title position-relative"
            >
              Сведения о характеристиках, индикаторах (показателях)
              деятельности, технологической части объекта обработки, утилизации,
              обезвреживания и размещения ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-14">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Производственная мощность объекта
                    <hint
                      message="Указывается количество обрабатываемых отходов в год"
                    ></hint>
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.productionCapacity"
                    required
                    type="number"
                    v-model="request.indicator.productionCapacity"
                    :whole="20"
                    :fraction="3"
                    :isErrorProp="!request.indicator.productionCapacity"
                    text="Тыс. тонн"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <!--
                                  <div class="form-elem__title">
                                      Проектная мощность объекта, тыс. тонн в год
                                  </div>
                                  <custom-input :disabled="disableFields"
                                                :select-field-disable="disableCheckboxes"
                                                :hide-checkbox="hideCheckbox"
                                                :select-fields-array="request.verifiedFields"
                                                select-field-name="indicator.projectCapacity" required type="number"
                                                v-model="request.indicator.projectCapacity"
                                                :whole="20" :fraction="3"
                                                text="Тыс. тонн"
                                  ></custom-input>
                                  -->
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Свободная мощность объекта
                    <hint
                      message="Поле вычисляемое: «Свободная мощность» = «производственная мощность» – «масса принятых отходов»"
                    ></hint>
                  </div>
                  <custom-input
                    type="number"
                    required
                    disabled
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.freeCapacity"
                    v-model="request.indicator.freeCapacity"
                    :whole="20"
                    :fraction="3"
                    :isErrorProp="!request.indicator.freeCapacity"
                    text="Тыс. тонн"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Масса ТКО, принятых в предыдущем году
                  </div>
                  <custom-input
                    type="number"
                    required
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.previousYearTkoWeight"
                    v-model="request.indicator.previousYearTkoWeight"
                    :whole="20"
                    :fraction="2"
                    :isErrorProp="!request.indicator.previousYearTkoWeight"
                    text="Тыс. тонн"
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Масса других видов отходов (не ТКО), принятых в предыдущем
                    году
                  </div>
                  <custom-input
                    type="number"
                    required
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.previousYearNonTkoWeight"
                    v-model="request.indicator.previousYearNonTkoWeight"
                    :whole="20"
                    :fraction="2"
                    :isErrorProp="!request.indicator.previousYearNonTkoWeight"
                    text="Тыс. тонн"
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div
                class="row form-elem form-elem--indent form-elem--hr"
                v-if="typeIn([PLACING_ID, RECYCLING_ID])"
              >
                <div class="col-50" v-if="typeIs(PLACING_ID)">
                  <div class="form-elem__title">
                    Остаточная емкость для размещения отходов на начало следующего
                    года
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.nextYearFreeCapacity"
                    required
                    type="number"
                    v-model="request.indicator.nextYearFreeCapacity"
                    :whole="20"
                    :fraction="2"
                    :isErrorProp="!request.indicator.nextYearFreeCapacity"
                    text="Тыс. тонн"
                  ></custom-input>
                </div>
                <div class="col-50" v-if="typeIs(RECYCLING_ID)">
                  <div class="form-elem__title">
                    Проектная масса производимого вторичного сырья в год
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.secondaryRawMaterialsPerYear"
                    required
                    type="number"
                    v-model="request.indicator.secondaryRawMaterialsPerYear"
                    :whole="20"
                    :fraction="2"
                    :isErrorProp="!request.indicator.secondaryRawMaterialsPerYear"
                    text="Тыс. тонн"
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem" v-if="typeIs(UTILIZATION_ID)">
                <div class="col-50">
                  <div class="form-elem__title">Проектная доля утилизации</div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.utilizationPercent"
                    required
                    type="number"
                    v-model="request.indicator.utilizationPercent"
                    :whole="20"
                    :fraction="2"
                    :isErrorProp="!request.indicator.utilizationPercent"
                    text="%"
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">Общая площадь объекта</div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.area"
                    type="number"
                    v-model="request.indicator.area"
                    :whole="20"
                    :fraction="3"
                    text="Кв.м"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">Общие фотографии объекта</div>
                  <photos-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    select-field-name="indicator.photos"
                    :select-fields-array="request.verifiedFields"
                    v-model="request.indicator.photos"
                  ></photos-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Площадь производственной части объекта
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.productionPartArea"
                    type="number"
                    v-model="request.indicator.productionPartArea"
                    :whole="20"
                    :fraction="3"
                    text="Кв.м"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Фотографии производственной части объекта снаружи (здания,
                    сооружения и т.п.)
                  </div>
                  <photos-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    select-field-name="indicator.productionPartPhotos"
                    :select-fields-array="request.verifiedFields"
                    v-model="request.indicator.productionPartPhotos"
                  ></photos-input>
                </div>
              </div>

              <div class="row form-elem" v-show="!typeIs(PLACING_ID)">
                <div class="col-50">
                  <div class="form-elem__title">
                    Площадь зоны для разгрузки поступающих отходов
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.unloadingZoneArea"
                    type="number"
                    v-model="request.indicator.unloadingZoneArea"
                    :whole="20"
                    :fraction="3"
                    text="Кв.м"
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="row form-elem" v-show="!typeIs(PLACING_ID)">
                <div class="col-50">
                  <div class="form-elem__title">
                    Площадь цеха сортировки отходов
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.sortingZoneArea"
                    type="number"
                    v-model="request.indicator.sortingZoneArea"
                    :whole="20"
                    :fraction="3"
                    text="Кв.м"
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие участка компостирования отходов
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.indicator.hasCompostingZone"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.hasCompostingZone"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.indicator.hasCompostingZone">
                    <div class="form-elem__title">Мощность участка</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.compostingZoneCapacityPerYear"
                      required
                      type="number"
                      v-model="request.indicator.compostingZoneCapacityPerYear"
                      :whole="20"
                      :fraction="2"
                      :isErrorProp="!request.indicator.compostingZoneCapacityPerYear"
                      text="Тонн в год"
                    ></custom-input>
                  </div>
                  <div v-else-if="request.indicator.hasCompostingZone === false">
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.noCompostingZoneReason"
                      type="text"
                      v-model="request.indicator.noCompostingZoneReason"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="condition" v-if="request.indicator.hasCompostingZone">
                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наименование входящего материала для компостирования
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.compostingMaterialName"
                      required
                      type="text"
                      :max-length="400"
                      v-model="request.indicator.compostingMaterialName"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Назначение получаемого компоста
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.compostPurpose"
                      required
                      type="text"
                      :max-length="400"
                      v-model="request.indicator.compostPurpose"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие участка производства RDF (refuse derived fuel, твердое
                    вторичное топливо)
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.indicator.hasRdfZone"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.hasRdfZone"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.indicator.hasRdfZone">
                    <div class="form-elem__title">Мощность участка</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.rdfZoneCapacityPerYear"
                      required
                      type="number"
                      v-model="request.indicator.rdfZoneCapacityPerYear"
                      :whole="20"
                      :fraction="2"
                      :isErrorProp="!request.indicator.rdfZoneCapacityPerYear"
                      text="Тонн в год"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem" v-if="request.indicator.hasRdfZone">
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">Назначение получаемого RDF</div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.rdfPurpose"
                    required
                    type="text"
                    :max-length="400"
                    v-model="request.indicator.rdfPurpose"
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Технологическая схема движения отходов
                  </div>
                  <photos-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-field-name="'indicator.technologicalSchemePhotos'"
                    :select-fields-array="request.verifiedFields"
                    v-model="request.indicator.technologicalSchemePhotos"
                  ></photos-input>

                  <file-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.indicator.technologicalScheme"
                    :formats="['pdf']"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.technologicalScheme"
                    :size="20"
                    @onPdfView="onPdfView"
                  ></file-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">Общая схема объекта</div>
                  <photos-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-field-name="'indicator.generalSchemePhotos'"
                    :select-fields-array="request.verifiedFields"
                    v-model="request.indicator.generalSchemePhotos"
                  ></photos-input>

                  <file-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.indicator.generalScheme"
                    :formats="['pdf']"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.generalScheme"
                    :size="20"
                    @onPdfView="onPdfView"
                  ></file-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">Схема производственной части</div>
                  <photos-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-field-name="'indicator.productionZoneSchemePhotos'"
                    :select-fields-array="request.verifiedFields"
                    v-model="request.indicator.productionZoneSchemePhotos"
                  ></photos-input>

                  <file-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.indicator.productionZoneScheme"
                    :formats="['pdf']"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.productionZoneScheme"
                    :size="20"
                    @onPdfView="onPdfView"
                  ></file-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div
                class="row row--start form-elem form-elem--indent form-elem--hr"
              >
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие потребности в импортозамещении оборудования объекта
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.indicator.isImportSubstitutionNeeded"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.isImportSubstitutionNeeded"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.indicator.isImportSubstitutionNeeded">
                    <div class="form-elem__title">Тип оборудования</div>
                    <custom-input
                      required
                      type="textarea"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.equipmentType"
                      :max-length="400"
                      v-model="request.indicator.equipmentType"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Использование оборудования включенного в НДТ (наличие
                    включения основного и вспомогательного оборудования в
                    актуальные справочники наилучших доступных технологий)
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.indicator.isNdtEquipmentUsed"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.isNdtEquipmentUsed"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.indicator.isNdtEquipmentUsed">
                    <div class="form-elem__title">Тип оборудования</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.ndtEquipmentType"
                      required
                      type="text"
                      :max-length="400"
                      v-model="request.indicator.ndtEquipmentType"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="request.indicator.isNdtEquipmentUsed"
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">Наименование справочника НДТ</div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="indicator.ndtDictionaryName"
                    required
                    type="text"
                    :max-length="400"
                    v-model="request.indicator.ndtDictionaryName"
                  ></custom-input>
                </div>
              </div>

              <!-- Новое -->
              <div v-if="typeIs(PLACING_ID)">
                <div class="row form-elem form-elem--indent form-elem--hr">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Площадь тела объекта размещения отходов (указывается площадь
                      на которой планируется производить размещение отходов, в кв.
                      м)
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.placingArea"
                      v-model="request.indicator.placingArea"
                      :whole="20"
                      :fraction="3"
                      :isErrorProp="!request.indicator.placingArea"
                      text="Кв. м"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Полная проектная высота полигона (указывается в метрах)
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.projectHeight"
                      v-model="request.indicator.projectHeight"
                      :whole="20"
                      :fraction="3"
                      :isErrorProp="!request.indicator.projectHeight"
                      text="м"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem form-elem--indent form-elem--hr">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наличие проведенных маркшейдерских работ на объекте
                    </div>
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.hasMineSurveying"
                      v-model="request.indicator.hasMineSurveying"
                    ></boolean-input>
                  </div>
                  <div class="col-50" v-if="request.indicator.hasMineSurveying">
                    <div class="form-elem__title">
                      Наименование организации проводившей маркшейдерские работы
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.mineSurveyingOrganizationName"
                      v-model="request.indicator.mineSurveyingOrganizationName"
                      :loading="innLoadingMineSurveyingOrganization"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>

                <div
                  class="row form-elem"
                  v-if="request.indicator.hasMineSurveying"
                >
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      ИНН организации проводившей маркшейдерские работы
                      <hint
                        message="Заполните поле и нажмите на лупу. Связанные поля заполнятся значениями."
                      ></hint>
                    </div>
                    <!-- Может быть ИНН начинающийся с 0, а это не число -->
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.mineSurveyingOrganizationName"
                      required
                      type="text"
                      v-model="request.indicator.mineSurveyingOrganizationInn"
                      action="icons/Search.svg"
                      :max-length="12"
                      @action="updateInnMineSurveyingOrganization"
                    >
                    </custom-input>
                  </div>
                </div>

                <div
                  class="row form-elem"
                  v-if="request.indicator.hasMineSurveying"
                >
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Заключение организации проводившей маркшейдерские работы
                    </div>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.mineSurveyingConclusion"
                      v-model="request.indicator.mineSurveyingConclusion"
                      :formats="['pdf']"
                      :size="30"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                </div>

                <div
                  class="row form-elem form-elem--indent form-elem--hr"
                  v-if="request.indicator.hasMineSurveying"
                >
                  <div class="col-50">
                    <div class="form-elem__title">
                      Количество карт для размещения отходов
                    </div>
                    <custom-input
                      required
                      type="number"
                      integer
                      max="100"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.mapCount"
                      v-model="request.indicator.mapCount"
                      :whole="20"
                      :fraction="0"
                      @input="mapsCountChanged()"
                    ></custom-input>
                  </div>
                  <div class="col-50"></div>
                </div>

                <div
                  class="row form-elem"
                  v-if="request.indicator.hasMineSurveying"
                  v-for="(map, index) in request.indicator.maps"
                  :key="'MAP-' + index"
                >
                  <div class="col-50">
                    <div class="form-elem__title">
                      Размеры карты для размещения отходов {{ index + 1 }}
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="'indicator.maps[' + index + '].size'"
                      v-model="map.size"
                      :whole="20"
                      :fraction="2"
                      text="Кв. м"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Период ввода карты для размещения отходов {{ index + 1 }} в
                      эксплуатацию
                    </div>
                    <custom-input
                      required
                      type="month"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="'indicator.maps[' + index + '].period'"
                      v-model="map.period"
                    ></custom-input>
                  </div>
                </div>

                <div
                  class="row form-elem form-elem--indent form-elem--hr"
                  v-if="request.indicator.hasMineSurveying"
                >
                  <div class="col-50">
                    <div class="form-elem__title">
                      Тип гидроизоляции участка размещения отходов
                    </div>
                    <custom-select
                      has-other-value
                      required
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.waterproofingType"
                      v-model="request.indicator.waterproofingType"
                      reference-type="WATERPROOFING_TYPE"
                    ></custom-select>
                  </div>
                  <div class="col-50">
                    <div
                      v-if="isOtherSelected(request.indicator.waterproofingType)"
                    >
                      <div class="form-elem__title">
                        Иной тип гидроизоляции участка размещения отходов
                      </div>
                      <custom-input
                        required
                        type="text"
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="indicator.waterproofingType"
                        v-model="request.indicator.otherWaterproofingType"
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div
                  class="row form-elem"
                  v-if="request.indicator.hasMineSurveying"
                >
                  <div class="col-50">
                    <div class="form-elem__title">
                      Рельеф участка (указывается перепад высот на участке,
                      наличие заболоченных территорий, лесных массивов)
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.relief"
                      :max-length="400"
                      v-model="request.indicator.relief"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Глубина залегания грунтовых вод (указывается в метрах)
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.groundwaterDepth"
                      v-model="request.indicator.groundwaterDepth"
                      :whole="20"
                      :fraction="2"
                      text="м"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem form-elem--indent form-elem--hr">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Возможность подтопления участка
                    </div>
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.floodingPossibility"
                      v-model="request.indicator.floodingPossibility"
                    ></boolean-input>
                  </div>
                  <div class="col-50"></div>
                </div>

                <div class="row form-elem form-elem--indent form-elem--hr">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наличие уплотнителя отходов
                    </div>
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.hasWasteCompactor"
                      v-model="request.indicator.hasWasteCompactor"
                    ></boolean-input>
                  </div>
                  <div class="col-50" v-if="request.indicator.hasWasteCompactor">
                    <div class="form-elem__title">
                      Тип и модель уплотнителя отходов
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.wasteCompactorType"
                      v-model="request.indicator.wasteCompactorType"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>

                <div
                  class="row form-elem"
                  v-if="request.indicator.hasWasteCompactor"
                >
                  <div class="col-50">
                    <div class="form-elem__title">
                      Эксплуатационная масса уплотнителя отходов
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.wasteCompactorMass"
                      v-model="request.indicator.wasteCompactorMass"
                      :whole="20"
                      :fraction="2"
                      text="тонн"
                    ></custom-input>
                  </div>
                  <div class="col-50" v-if="request.indicator.hasWasteCompactor">
                    <div class="form-elem__title">
                      Фотографии уплотнителя отходов
                    </div>
                    <photos-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.wasteCompactorPhotos"
                      v-model="request.indicator.wasteCompactorPhotos"
                    ></photos-input>
                  </div>
                </div>
              </div>

              <div v-if="typeIn([UTILIZATION_ID, NEUTRALIZATION_ID])">
                <div class="row form-elem form-elem--indent form-elem--hr">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Краткое описание технологического процесса
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.techProcessDescription"
                      :max-length="400"
                      v-model="request.indicator.techProcessDescription"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наличие площадки временного накопления отходов
                    </div>
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.hasTemporaryWasteStorage"
                      v-model="request.indicator.hasTemporaryWasteStorage"
                    ></boolean-input>
                  </div>
                </div>

                <div
                  class="row form-elem"
                  v-if="request.indicator.hasTemporaryWasteStorage"
                >
                  <div class="col-50">
                    <div class="form-elem__title">
                      Площадь площадки (указывается в кв.м)
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.temporaryWasteStorageArea"
                      v-model="request.indicator.temporaryWasteStorageArea"
                      :whole="20"
                      :fraction="3"
                      text="Кв.м"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Виды отходов накапливаемых на площадке
                    </div>
                    <custom-input
                      required
                      type="text"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.temporaryWasteStorageWasteTypes"
                      v-model="request.indicator.temporaryWasteStorageWasteTypes"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div v-if="typeIs(UTILIZATION_ID)">
                <div class="row form-elem form-elem--indent form-elem--hr">
                  <div class="col-50">
                    <div class="form-elem__title">Вид утилизации</div>
                    <custom-select
                      required
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.utilizationType"
                      v-model="request.indicator.utilizationType"
                      reference-type="UTILIZATION_TYPE"
                    ></custom-select>
                  </div>
                  <div class="col-50"></div>
                </div>
              </div>

              <div v-if="typeIs(NEUTRALIZATION_ID)">
                <div class="row form-elem form-elem--indent form-elem--hr">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наличие выработки электроэнергии в процессе обезвреживания
                      отходов
                    </div>
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.hasThermalRecycling"
                      v-model="request.indicator.hasRecycling"
                    ></boolean-input>
                  </div>
                  <div class="col-50">
                    <div v-if="request.indicator.hasRecycling">
                      <div class="form-elem__title">
                        Мощность выработки электроэнергии в процессе
                        обезвреживания отходов
                      </div>
                      <custom-input
                        required
                        type="number"
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="indicator.thermalRecyclingPower"
                        v-model="request.indicator.recyclingPower"
                        :whole="20"
                        :fraction="3"
                        text="гКал"
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div class="row form-elem form-elem--indent form-elem--hr">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Наличие выработки электроэнергии в процессе обезвреживания
                      отходов термическим способом
                    </div>
                    <boolean-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="indicator.hasThermalRecycling"
                      v-model="request.indicator.hasThermalRecycling"
                    ></boolean-input>
                  </div>
                  <div class="col-50">
                    <div v-if="request.indicator.hasThermalRecycling">
                      <div class="form-elem__title">
                        Мощность выработки электроэнергии в процессе
                        обезвреживания отходов термическим способом
                      </div>
                      <custom-input
                        required
                        type="number"
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        select-field-name="indicator.thermalRecyclingPower"
                        v-model="request.indicator.thermalRecyclingPower"
                        :whole="20"
                        :fraction="3"
                        text="мВт"
                      ></custom-input>
                    </div>
                  </div>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" id="blockWasteTypes">
            <h2
              v-if="typeIs(PLACING_ID)"
              v-b-toggle.collapse-15
              class="form-group__title position-relative"
            >
              Сведения о видах отходов, размещаемых на объекте по обращению с
              ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>
            <h2
              v-else
              v-b-toggle.collapse-15
              class="form-group__title position-relative"
            >
              Сведения о видах отходов, принимаемых на объекте по обращению с
              ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-15">
              <!-- Виды отходов -->
              <div>
                <div
                  v-for="(wasteType, index) in request.wasteInfo.wasteTypes"
                  :key="'WT-' + index"
                >
                  <div class="row form-elem">
                    <div class="col-12 col-md-5">
                      <div class="form-elem__title" v-if="typeIs(PLACING_ID)">
                        Вид отходов, размещаемых на объекте (код ФККО)
                      </div>
                      <div class="form-elem__title" v-else>
                        Вид отходов, принимаемых на объекте (код ФККО)
                      </div>
                      <custom-select
                        required
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'wasteInfo.wasteTypes[' + index + '].wasteType'
                        "
                        v-model="wasteType.wasteType"
                        reference-type="WASTE_TYPE"
                      ></custom-select>
                    </div>
                    <div class="col-12 col-md-6" v-if="typeIs(NEUTRALIZATION_ID)">
                      <div class="form-elem__title">
                        Класс опасности отходов, которые перерабатываются на
                        объекте
                      </div>
                      <custom-select
                        required
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'wasteInfo.wasteTypes[' + index + '].dangerType'
                        "
                        v-model="wasteType.dangerType"
                        reference-type="DANGER_TYPE"
                        multi-checkbox
                      ></custom-select>
                    </div>

                    <div class="col-12 col-md-1">
                      <button
                        class="btn btn-transparent btn-grey"
                        v-if="!disableFields"
                        @click.prevent="
                          deleteUnit(
                            request.wasteInfo.wasteTypes,
                            wasteType,
                            index,
                          )
                        "
                        title="Удалить"
                      >
                        <img src="icons/Delete-grey.svg" />
                      </button>
                    </div>
                  </div>
                </div>

                <div class="form-elem form-elem--indent">
                  <button
                    type="button"
                    class="btn btn-lg btn-transparent btn-secondary"
                    :disabled="disableFields"
                    @click.prevent="addUnit(request.wasteInfo.wasteTypes)"
                  >
                    <img left src="icons/Circle-plus.svg" />
                    <span v-if="typeIs(PLACING_ID)"
                      >Вид отходов, размещаемых на объекте</span
                    >
                    <span v-else>Добавить вид принимаемых отходов</span>
                  </button>
                </div>
              </div>

              <div v-if="!typeIs(PLACING_ID)">
                <!-- Направления -->
                <div
                  v-for="(wasteDirection, index) in request.wasteInfo
                    .wasteDirections"
                  :key="'WD-' + index"
                >
                  <div class="row form-elem">
                    <div class="col-full">
                      <div v-if="typeIs(RECYCLING_ID)" class="form-elem__title">
                        Направление вывоза отходов образуемых объектом отходов
                        (указать координаты объектов или номера ГРОРО)
                      </div>
                      <div v-else class="form-elem__title">
                        Направление вывоза отходов после производства товаров и
                        услуг (указать координаты объектов или номер ГРОРО)
                      </div>
                      <custom-input
                        required
                        type="text"
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'wasteInfo.wasteDirections[' + index + '].coordsOrGroro'
                        "
                        v-model="wasteDirection.coordsOrGroro"
                      ></custom-input>
                    </div>
                    <div class="col">
                      <button
                        class="btn btn-transparent btn-grey"
                        v-if="!disableFields"
                        @click.prevent="
                          deleteUnit(
                            request.wasteInfo.wasteDirections,
                            wasteDirection,
                            index,
                          )
                        "
                        title="Удалить"
                      >
                        <img src="icons/Delete-grey.svg" />
                      </button>
                    </div>
                  </div>
                </div>

                <div class="form-elem form-elem--indent">
                  <button
                    type="button"
                    class="btn btn-lg btn-transparent btn-secondary"
                    :disabled="disableFields"
                    @click.prevent="addUnit(request.wasteInfo.wasteDirections)"
                  >
                    <img left src="icons/Circle-plus.svg" />
                    <span>Добавить направление вывоза отходов</span>
                  </button>
                </div>
              </div>

              <div v-if="!typeIs(UTILIZATION_ID)">
                <div class="form-elem form-elem--indent form-elem--hr">
                  <div class="form-elem__title">
                    Масса принятых отходов за текущий календарный год
                  </div>
                  <custom-input
                    required
                    type="number"
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="wasteInfo.wasteCount"
                    v-model="request.wasteInfo.wasteCount"
                    :whole="20"
                    :fraction="3"
                    :isErrorProp="!request.wasteInfo.wasteCount"
                    text="Тыс. тонн"
                  ></custom-input>
                </div>

                <!--
                              <div class="col-50">
                                  <div class="form-elem__title">
                                      Доля отходов по видам отходов
                                  </div>
                                  <custom-input required type="number"
                                                :disabled="disableFields"
                                                :select-field-disable="disableCheckboxes"
                                                :hide-checkbox="hideCheckbox"
                                                :select-fields-array="request.verifiedFields"
                                                select-field-name="wasteInfo.wastePrecentage"
                                                v-model="request.wasteInfo.wastePrecentage"
                                                text="%"
                                  ></custom-input>
                              </div>
                              -->

                <div class="row form-elem form-elem--indent">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Масса образуемых отходов от деятельности объекта
                      (указывается общая планируемая масса образуемых объектом
                      отходов за текущий год)
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="wasteInfo.wasteThisYear"
                      v-model="request.wasteInfo.wasteThisYear"
                      :isErrorProp="!request.wasteInfo.wasteThisYear"
                      text="Тыс. тонн в год"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Масса образуемых отходов от деятельности объекта
                      (указывается общая планируемая масса образуемых объектом
                      отходов за предыдущий год)
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="wasteInfo.wastePreviousYear"
                      v-model="request.wasteInfo.wastePreviousYear"
                      :isErrorProp="!request.wasteInfo.wastePreviousYear"
                      text="Тыс. тонн в год"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div v-else>
                <div class="row form-elem form-elem--indent form-elem--hr">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Масса планируемых к принятию ВМР в текущем году
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="wasteInfo.vmrThisYear"
                      v-model="request.wasteInfo.vmrThisYear"
                      :whole="20"
                      :fraction="3"
                      :isErrorProp="!request.wasteInfo.vmrThisYear"
                      text="Тыс. тонн в год"
                    ></custom-input>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Масса принятых ВМР в предыдущем году
                    </div>
                    <custom-input
                      required
                      type="number"
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="wasteInfo.vmrPreviousYear"
                      v-model="request.wasteInfo.vmrPreviousYear"
                      :whole="20"
                      :fraction="3"
                      :isErrorProp="!request.wasteInfo.vmrPreviousYear"
                      text="Тыс. тонн в год"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Среднегодовая стоимость приема ВМР по видам
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="wasteInfo.vmrCost"
                      required
                      type="number"
                      :isErrorProp="!request.wasteInfo.vmrCost"
                      v-model="request.wasteInfo.vmrCost"
                      text="Тыс. тонн в год"
                    ></custom-input>
                  </div>
                  <div class="col-50"></div>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" id="blockInfrastructureObjects">
            <h2
              v-b-toggle.collapse-16
              class="form-group__title position-relative"
            >
              Сведения об объектах инфраструктуры объекта по обращению с ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-16">
              <!-- Весовой контроль -->
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие весового контроля на объекте
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.infrastructureObjectInfo.hasWeightControl"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasWeightControl"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="!request.infrastructureObjectInfo.hasWeightControl">
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.noWeightControlReason"
                      type="text"
                      required
                      v-model="
                        request.infrastructureObjectInfo.noWeightControlReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                  <div v-else>
                    <div class="form-elem__title">
                      Количество оборудования весового контроля на объекте
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      integer
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.weightControlCount'
                      "
                      required
                      type="number"
                      v-model="
                        request.infrastructureObjectInfo.weightControlCount
                      "
                      :whole="20"
                      :fraction="2"
                      text="Единиц"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="condition"
                v-if="request.infrastructureObjectInfo.hasWeightControl"
                v-for="(unit, index) in request.infrastructureObjectInfo
                  .weightControls"
                :key="'U1-' + index"
              >
                <h4 class="row row--centered form-elem">
                  Весовой контроль {{ index + 1 }}

                  <span
                    @click.prevent="
                      deleteUnit(
                        request.infrastructureObjectInfo.weightControls,
                        unit,
                        index,
                      )
                    "
                    v-if="!disableFields"
                  >
                    <img src="icons/Check-error.svg" />
                  </span>
                </h4>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Производитель оборудования весового контроля на объекте
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.weightControls[' +
                          index +
                          '].manufacturer'
                      "
                      required
                      type="text"
                      :max-length="400"
                      v-model="unit.manufacturer"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Марка оборудования весового контроля на объекте
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.weightControls[' +
                          index +
                          '].brand'
                      "
                      required
                      type="text"
                      :max-length="400"
                      v-model="unit.brand"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Длина весовой платформы в метрах
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.weightControls[' +
                          index +
                          '].length'
                      "
                      required
                      type="number"
                      v-model="unit.length"
                      :whole="20"
                      :fraction="2"
                      :isErrorProp="!unit.length"
                      text="Метр"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Фотографии оборудования весового контроля на объекте
                    </div>
                    <photos-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-field-name="
                        'infrastructureObjectInfo.weightControls[' +
                          index +
                          '].photos'
                      "
                      :select-fields-array="request.verifiedFields"
                      v-model="unit.photos"
                    ></photos-input>
                  </div>
                </div>
              </div>

              <div
                class="form-elem form-elem--indent"
                v-if="request.infrastructureObjectInfo.hasWeightControl"
              >
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary"
                  :disabled="disableFields"
                  @click.prevent="
                    addUnit(request.infrastructureObjectInfo.weightControls)
                  "
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить весовой контроль</span>
                </button>
              </div>

              <!-- Мойка колес -->
              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">Наличие пункта мойки колес</div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.infrastructureObjectInfo.hasWheelsWashingPoint
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasWheelsWashingPoint"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="!request.infrastructureObjectInfo.hasWheelsWashingPoint"
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.noWheelsWashingPointReason"
                      type="text"
                      required
                      v-model="
                        request.infrastructureObjectInfo
                          .noWheelsWashingPointReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                  <div v-else>
                    <div class="form-elem__title">
                      Количество оборудования пункта мойки колес
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      integer
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.wheelsWashingPointCount'
                      "
                      required
                      type="number"
                      v-model="
                        request.infrastructureObjectInfo.wheelsWashingPointCount
                      "
                      :whole="20"
                      :fraction="2"
                      text="Единиц"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="condition"
                v-if="request.infrastructureObjectInfo.hasWheelsWashingPoint"
                v-for="(unit, index) in request.infrastructureObjectInfo
                  .wheelsWashingPoints"
                :key="'U2-' + index"
              >
                <h4 class="row row--centered form-elem">
                  Мойка колес {{ index + 1 }}

                  <span
                    @click.prevent="
                      deleteUnit(
                        request.infrastructureObjectInfo.wheelsWashingPoints,
                        unit,
                        index,
                      )
                    "
                    v-if="!disableFields"
                  >
                    <img src="icons/Check-error.svg" />
                  </span>
                </h4>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Производитель оборудования пункта мойки колес
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.wheelsWashingPoints[' +
                          index +
                          '].manufacturer'
                      "
                      required
                      type="text"
                      v-model="unit.manufacturer"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Марка оборудования пункта мойки колес
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.wheelsWashingPoints[' +
                          index +
                          '].brand'
                      "
                      required
                      type="text"
                      v-model="unit.brand"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Фотографии оборудования пункта мойки колес
                    </div>
                    <photos-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-field-name="
                        'infrastructureObjectInfo.wheelsWashingPoints[' +
                          index +
                          '].photos'
                      "
                      :select-fields-array="request.verifiedFields"
                      v-model="unit.photos"
                    ></photos-input>
                  </div>
                </div>
              </div>

              <div
                class="form-elem form-elem--indent"
                v-if="request.infrastructureObjectInfo.hasWheelsWashingPoint"
              >
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary"
                  :disabled="disableFields"
                  @click.prevent="
                    addUnit(request.infrastructureObjectInfo.wheelsWashingPoints)
                  "
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить пункт мойки колес</span>
                </button>
              </div>

              <!-- Системы видео наблюдения -->
              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие систем видеонаблюдения
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.infrastructureObjectInfo.hasVideoEquipment"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasVideoEquipment"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.infrastructureObjectInfo.hasVideoEquipment">
                    <div class="form-elem__title">
                      Количество систем видеонаблюдения
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      integer
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.videoEquipment.count"
                      required
                      type="number"
                      v-model="
                        request.infrastructureObjectInfo.videoEquipment.count
                      "
                      :whole="20"
                      :fraction="0"
                      :isErrorProp="!request.infrastructureObjectInfo.videoEquipment.count"
                      text="Единиц"
                    ></custom-input>
                  </div>
                  <div
                    v-else-if="
                      request.infrastructureObjectInfo.hasVideoEquipment === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.noVideoEquipmentReason"
                      type="text"
                      required
                      v-model="
                        request.infrastructureObjectInfo.noVideoEquipmentReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <!-- Локальные очистные сооружения -->
              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие локальных очистных сооружений
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.infrastructureObjectInfo.hasLocalTreatmentFacilities
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasLocalTreatmentFacilities"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="
                      !request.infrastructureObjectInfo
                        .hasLocalTreatmentFacilities
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.noLocalTreatmentFacilitiesReason"
                      type="text"
                      required
                      v-model="
                        request.infrastructureObjectInfo
                          .noLocalTreatmentFacilitiesReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                  <div v-else>
                    <div class="form-elem__title">
                      Количество локальных очистных сооружений
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      integer
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.localTreatmentFacilitiesCount'
                      "
                      required
                      type="number"
                      v-model="
                        request.infrastructureObjectInfo
                          .localTreatmentFacilitiesCount
                      "
                      :whole="20"
                      :fraction="0"
                      text="Единиц"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="condition"
                v-if="
                  request.infrastructureObjectInfo.hasLocalTreatmentFacilities
                "
                v-for="(unit, index) in request.infrastructureObjectInfo
                  .localTreatmentFacilities"
                :key="'U3-' + index"
              >
                <h4 class="row row--centered form-elem">
                  Локальные очистные сооружения {{ index + 1 }}

                  <span
                    @click.prevent="
                      deleteUnit(
                        request.infrastructureObjectInfo.localTreatmentFacilities,
                        unit,
                        index,
                      )
                    "
                    v-if="!disableFields"
                  >
                    <img src="icons/Check-error.svg" />
                  </span>
                </h4>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Мощность очистных сооружений
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.localTreatmentFacilities[' +
                          index +
                          '].capacity'
                      "
                      required
                      type="number"
                      v-model="unit.capacity"
                      :whole="20"
                      :fraction="3"
                      :isErrorProp="!unit.capacity"
                      text="Тыс. куб. м. в сутки"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Вид (тип) очистных сооружений
                    </div>
                    <custom-select
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.localTreatmentFacilities[' +
                          index +
                          '].type'
                      "
                      required
                      v-model="unit.type"
                      reference-type="TREATMENT_FACILITIES"
                    ></custom-select>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Фотографии оборудования очистных сооружений
                    </div>
                    <photos-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-field-name="
                        'infrastructureObjectInfo.localTreatmentFacilities[' +
                          index +
                          '].photos'
                      "
                      :select-fields-array="request.verifiedFields"
                      v-model="unit.photos"
                    ></photos-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Паспорт оборудования очистных сооружений
                    </div>
                    <photos-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-field-name="
                        'infrastructureObjectInfo.localTreatmentFacilities[' +
                          index +
                          '].passportPhotos'
                      "
                      :select-fields-array="request.verifiedFields"
                      v-model="unit.passportPhotos"
                    ></photos-input>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="unit.passport"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.localTreatmentFacilities[' +
                          index +
                          '].passport'
                      "
                      :formats="['pdf']"
                      :size="20"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                </div>
              </div>

              <div
                class="form-elem form-elem--indent"
                v-if="
                  request.infrastructureObjectInfo.hasLocalTreatmentFacilities
                "
              >
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary"
                  :disabled="disableFields"
                  @click.prevent="
                    addUnit(
                      request.infrastructureObjectInfo.localTreatmentFacilities,
                    )
                  "
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить локальные очистные сооружения</span>
                </button>
              </div>

              <!-- Радиационный контроль -->
              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие радиационного контроля
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.infrastructureObjectInfo.hasRadiationControl"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasRadiationControl"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="!request.infrastructureObjectInfo.hasRadiationControl"
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.noRadiationControlReason"
                      type="text"
                      required
                      v-model="
                        request.infrastructureObjectInfo.noRadiationControlReason
                      "
                    ></custom-input>
                  </div>
                  <div v-else>
                    <div class="form-elem__title">
                      Количество оборудования радиационного контроля
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      integer
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.radiationControlCount'
                      "
                      required
                      type="number"
                      v-model="
                        request.infrastructureObjectInfo.radiationControlCount
                      "
                      :whole="20"
                      :fraction="0"
                      text="Единиц"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="condition"
                v-if="request.infrastructureObjectInfo.hasRadiationControl"
                v-for="(unit, index) in request.infrastructureObjectInfo
                  .radiationControls"
                :key="'U4-' + index"
              >
                <h4 class="row row--centered form-elem">
                  Радиационный контроль {{ index + 1 }}

                  <span
                    @click.prevent="
                      deleteUnit(
                        request.infrastructureObjectInfo.radiationControls,
                        unit,
                        index,
                      )
                    "
                    v-if="!disableFields"
                  >
                    <img src="icons/Check-error.svg" />
                  </span>
                </h4>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Производитель оборудования радиационного контроля
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.radiationControls[' +
                          index +
                          '].manufacturer'
                      "
                      required
                      type="text"
                      v-model="unit.manufacturer"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Марка оборудования радиационного контроля
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.radiationControls[' +
                          index +
                          '].brand'
                      "
                      required
                      type="text"
                      v-model="unit.brand"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Фотографии оборудования радиационного контроля
                    </div>
                    <photos-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-field-name="
                        'infrastructureObjectInfo.radiationControls[' +
                          index +
                          '].photos'
                      "
                      :select-fields-array="request.verifiedFields"
                      v-model="unit.photos"
                    ></photos-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Паспорт оборудования радиационного контроля
                    </div>
                    <photos-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-field-name="
                        'infrastructureObjectInfo.radiationControls[' +
                          index +
                          '].passportPhotos'
                      "
                      :select-fields-array="request.verifiedFields"
                      v-model="unit.passportPhotos"
                    ></photos-input>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="unit.passport"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.radiationControls[' +
                          index +
                          '].passport'
                      "
                      :formats="['pdf']"
                      :size="20"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                </div>
              </div>

              <div
                class="form-elem form-elem--indent"
                v-if="request.infrastructureObjectInfo.hasRadiationControl"
              >
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary"
                  :disabled="disableFields"
                  @click.prevent="
                    addUnit(request.infrastructureObjectInfo.radiationControls)
                  "
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить радиационный контроль</span>
                </button>
              </div>

              <!-- Дороги -->
              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие обустроенной сети дорог на объекте
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.infrastructureObjectInfo.hasRoads"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasRoads"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.infrastructureObjectInfo.hasRoads">
                    <div class="form-elem__title">Вид покрытия дорог</div>
                    <custom-select
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.road.type"
                      required
                      v-model="request.infrastructureObjectInfo.road.type"
                      reference-type="ROAD_SURFACE_TYPE"
                    ></custom-select>
                  </div>
                  <div
                    v-else-if="
                      request.infrastructureObjectInfo.hasRoads === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      required
                      select-field-name="infrastructureObjectInfo.noRoadsReason"
                      type="text"
                      v-model="request.infrastructureObjectInfo.noRoadsReason"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="condition"
                v-if="request.infrastructureObjectInfo.hasRoads"
              >
                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Общая длина проезжей части дорог
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.road.length"
                      required
                      type="number"
                      v-model="request.infrastructureObjectInfo.road.length"
                      :whole="20"
                      :fraction="3"
                      :isErrorProp="!request.infrastructureObjectInfo.road.length"
                      text="Км"
                    ></custom-input>
                  </div>
                </div>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Схема движения транспорта на объекте по обращению с ТКО
                    </div>
                    <photos-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-field-name="
                        'infrastructureObjectInfo.road.schemePhotos'
                      "
                      :select-fields-array="request.verifiedFields"
                      v-model="request.infrastructureObjectInfo.road.schemePhotos"
                    ></photos-input>
                    <file-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      v-model="request.infrastructureObjectInfo.road.scheme"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.road.scheme"
                      :formats="['pdf']"
                      :size="20"
                      @onPdfView="onPdfView"
                    ></file-input>
                  </div>
                </div>
              </div>

              <!-- Схема -->
              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие ограждения по периметру объекта по обращению с ТКО
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.infrastructureObjectInfo.hasFences"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasFences"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.infrastructureObjectInfo.hasFences">
                    <div class="form-elem__title">
                      Тип ограждения объекта по обращению с ТКО
                    </div>
                    <custom-select
                      has-other-value
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      required
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.fence.type"
                      v-model="request.infrastructureObjectInfo.fence.type"
                      reference-type="FENCE_FUNCTIONAL"
                    ></custom-select>
                  </div>
                  <div
                    v-else-if="
                      request.infrastructureObjectInfo.hasFences === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.noFencesReason"
                      type="text"
                      required
                      v-model="request.infrastructureObjectInfo.noFencesReason"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="
                  request.infrastructureObjectInfo.hasFences &&
                    isOtherSelected(
                      request.infrastructureObjectInfo.fence.type,
                    )
                "
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Наименование иного ограждения
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.fence.type"
                    required
                    type="text"
                    v-model="request.infrastructureObjectInfo.fence.otherType"
                  ></custom-input>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="request.infrastructureObjectInfo.hasFences"
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Фотографии ограждения объекта по обращению с ТКО
                  </div>
                  <photos-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    select-field-name="infrastructureObjectInfo.fence.photos"
                    :select-fields-array="request.verifiedFields"
                    v-model="request.infrastructureObjectInfo.fence.photos"
                  ></photos-input>
                </div>
              </div>

              <!-- Освещение -->
              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие освещения на объекте для работы в темное время суток
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.infrastructureObjectInfo.hasLights"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasLights"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.infrastructureObjectInfo.hasLights">
                    <div class="form-elem__title">Тип освещения</div>
                    <custom-select
                      has-other-value
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      required
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.light.type"
                      v-model="request.infrastructureObjectInfo.light.type"
                      reference-type="LIGHTS_FUNCTIONAL_TYPE"
                    ></custom-select>
                  </div>
                  <div
                    v-else-if="
                      request.infrastructureObjectInfo.hasLights === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.noLightsReason"
                      type="text"
                      required
                      v-model="request.infrastructureObjectInfo.noLightsReason"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="
                  request.infrastructureObjectInfo.hasLights &&
                    isOtherSelected(
                      request.infrastructureObjectInfo.light.type,
                    )
                "
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Наименование иного освещения
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.light.type"
                    required
                    type="text"
                    v-model="request.infrastructureObjectInfo.light.otherType"
                  ></custom-input>
                </div>
              </div>

              <!-- Пункт охраны -->
              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">Наличие пункта охраны</div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.infrastructureObjectInfo.hasSecurity"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasSecurity"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.infrastructureObjectInfo.hasSecurity">
                    <div class="form-elem__title">
                      Ресурсы, привлекаемые для охраны объекта по обращению с ТКО
                    </div>
                    <custom-select
                      has-other-value
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      required
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.security.type"
                      v-model="request.infrastructureObjectInfo.security.type"
                      reference-type="SECURITY_SOURCE"
                    ></custom-select>
                  </div>
                  <div
                    v-else-if="
                      request.infrastructureObjectInfo.hasSecurity === false
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.noSecurityReason"
                      type="text"
                      required
                      v-model="request.infrastructureObjectInfo.noSecurityReason"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="
                  request.infrastructureObjectInfo.hasSecurity &&
                    isOtherSelected(
                      request.infrastructureObjectInfo.security.type,
                    )
                "
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Иные ресурсы, привлекаемые для охраны объекта по обращению с
                    ТКО
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.security.type"
                    required
                    type="text"
                    v-model="request.infrastructureObjectInfo.security.otherType"
                  ></custom-input>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="request.infrastructureObjectInfo.hasSecurity"
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Количество сотрудников, осуществляющих охрану
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    integer
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.security.count"
                    required
                    type="number"
                    v-model="request.infrastructureObjectInfo.security.count"
                    :whole="20"
                    :fraction="0"
                    :isErrorProp="!request.infrastructureObjectInfo.security.count"
                    text="Человек"
                  ></custom-input>
                </div>
              </div>

              <!-- АСУ -->
              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие автоматизированной системы управления (АСУ) объектом
                    по обращению с ТКО
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="request.infrastructureObjectInfo.hasAsu"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasAsu"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div v-if="request.infrastructureObjectInfo.hasAsu">
                    <div class="form-elem__title">Назначение системы АСУ</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      required
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.asu.purpose"
                      type="text"
                      v-model="request.infrastructureObjectInfo.asu.purpose"
                      :max-length="400"
                    ></custom-input>
                  </div>
                  <div
                    v-else-if="request.infrastructureObjectInfo.hasAsu === false"
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      required
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.noAsuReason"
                      type="text"
                      v-model="request.infrastructureObjectInfo.noAsuReason"
                      :max-length="400"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="row form-elem"
                v-if="request.infrastructureObjectInfo.hasAsu"
              >
                <div class="col-50"></div>
                <div class="col-50">
                  <div class="form-elem__title">Функции АСУ</div>
                  <custom-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    required
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.asu.functions"
                    type="text"
                    v-model="request.infrastructureObjectInfo.asu.functions"
                    :max-length="400"
                  ></custom-input>
                </div>
              </div>

              <!-- Системы мониторинга окружающей среды -->
              <div class="row form-elem form-elem--indent form-elem--hr">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие системы мониторинга окружающей среды на объекте по
                    обращению с ТКО
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    v-model="
                      request.infrastructureObjectInfo
                        .hasEnvironmentMonitoringSystem
                    "
                    :select-fields-array="request.verifiedFields"
                    select-field-name="infrastructureObjectInfo.hasEnvironmentMonitoringSystem"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div
                    v-if="
                      !request.infrastructureObjectInfo
                        .hasEnvironmentMonitoringSystem
                    "
                  >
                    <div class="form-elem__title">Причина отсутствия</div>
                    <custom-input
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      select-field-name="infrastructureObjectInfo.noEnvironmentMonitoringSystemReason"
                      type="text"
                      required
                      v-model="
                        request.infrastructureObjectInfo
                          .noEnvironmentMonitoringSystemReason
                      "
                      :max-length="400"
                    ></custom-input>
                  </div>
                  <div v-else>
                    <div class="form-elem__title">
                      Количество систем мониторинга окружающей среды на объекте
                    </div>
                    <custom-input
                      :disabled="disableFields"
                      integer
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.environmentMonitoringSystemCount'
                      "
                      required
                      type="number"
                      v-model="
                        request.infrastructureObjectInfo
                          .environmentMonitoringSystemCount
                      "
                      :whole="20"
                      :fraction="0"
                      text="Единиц"
                    ></custom-input>
                  </div>
                </div>
              </div>

              <div
                class="condition"
                v-if="
                  request.infrastructureObjectInfo.hasEnvironmentMonitoringSystem
                "
                v-for="(unit, index) in request.infrastructureObjectInfo
                  .environmentMonitoringSystems"
                :key="'U5-' + index"
              >
                <h4 class="row row--centered form-elem">
                  Система мониторинга окружающей среды {{ index + 1 }}

                  <span
                    @click.prevent="
                      deleteUnit(
                        request.infrastructureObjectInfo
                          .environmentMonitoringSystems,
                        unit,
                        index,
                      )
                    "
                    v-if="!disableFields"
                  >
                    <img src="icons/Check-error.svg" />
                  </span>
                </h4>

                <div class="row form-elem">
                  <div class="col-50"></div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Применяемые системы мониторинга окружающей среды на объекте
                      по обращению с ТКО
                    </div>
                    <custom-select
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'infrastructureObjectInfo.environmentMonitoringSystems[' +
                          index +
                          '].type'
                      "
                      required
                      v-model="unit.type"
                      reference-type="ENVIRONMENT_MONITORING_SYSTEM"
                    ></custom-select>
                  </div>
                </div>
              </div>

              <div
                class="form-elem form-elem--indent"
                v-if="
                  request.infrastructureObjectInfo.hasEnvironmentMonitoringSystem
                "
              >
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary"
                  :disabled="disableFields"
                  @click.prevent="
                    addUnit(
                      request.infrastructureObjectInfo
                        .environmentMonitoringSystems,
                    )
                  "
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить систему мониторинга окружающей среды</span>
                </button>
              </div>
            </b-collapse>
          </div>

          <div
            class="form-group"
            v-if="typeIn([RECYCLING_ID, UTILIZATION_ID, NEUTRALIZATION_ID])"
            id="blockEquipment"
          >
            <h2
              v-b-toggle.collapse-17
              class="form-group__title position-relative"
            >
              Сведения об оборудовании объекта по обращению с ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-17">
              <div
                class="row form-elem"
                v-if="typeIn([UTILIZATION_ID, NEUTRALIZATION_ID])"
              >
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие основного производственного оборудования
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="hasCoreEquipment"
                    v-model="request.hasCoreEquipment"
                  ></boolean-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Наличие вспомогательного производственного оборудования
                  </div>
                  <boolean-input
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="hasAuxiliaryEquipment"
                    v-model="request.hasAuxiliaryEquipment"
                  ></boolean-input>
                </div>
              </div>

              <div
                class="form-elem"
                v-if="!typeIn([UTILIZATION_ID, NEUTRALIZATION_ID])"
              >
                <div class="form-elem__title">
                  {{
                    typeIn([RECYCLING_ID])
                      ? 'Всего оборудования'
                      : 'Количество оборудования'
                  }}
                </div>
                <custom-input
                  type="number"
                  required
                  integer
                  :disabled="disableFields"
                  :select-field-disable="disableCheckboxes"
                  :hide-checkbox="hideCheckbox"
                  :select-fields-array="request.verifiedFields"
                  :select-field-name="'equipmentCount'"
                  v-model="request.equipmentCount"
                  text="Единиц"
                  :whole="20"
                  :fraction="0"
                ></custom-input>
              </div>

              <!-- Конвееры -->
              <div
                v-for="(equipment, index) in request.equipment"
                :key="'EQUIPMENT - ' + equipment.id"
              >
                <h4 class="row row--centered form-elem">
                  {{
                    typeIn([UTILIZATION_ID, NEUTRALIZATION_ID])
                      ? equipment.kind.value + ' производственное оборудование'
                      : isOtherSelected(equipment.type)
                      ? equipment.otherType
                      : equipment.type
                      ? equipment.type.value
                      : ''
                  }}

                  <span
                    @click.prevent="deleteEquipment(equipment)"
                    v-if="!disableFields"
                  >
                    <img src="icons/Check-error.svg" />
                  </span>
                </h4>

                <div class="row row--start">
                  <div class="col-50">
                    <!--                                    Убрал, потому что теперь имя иного указывается при создании-->
                    <!--                                    <div class="form-elem" v-if="equipment.type.value === 'Иной конвейер'">-->
                    <!--                                        <div class="form-elem__title">-->
                    <!--                                            Наименование конвейера-->
                    <!--                                        </div>-->
                    <!--                                        <custom-input :disabled="disableFields"-->
                    <!--                                                      :select-field-disable="disableCheckboxes"
                                      :hide-checkbox="hideCheckbox"-->
                    <!--                                                      :select-fields-array="request.verifiedFields"-->
                    <!--                                                      :select-field-name="'equipment[' + index + '].name'" required-->
                    <!--                                                      type="text"-->
                    <!--                                                      v-model="equipment.name"></custom-input>-->
                    <!--                                    </div>-->

                    <div class="form-elem">
                      <div
                        class="form-elem__title"
                        v-if="
                          equipment.kind && equipment.kind.value === 'Конвейеры'
                        "
                      >
                        Тип конвейера
                      </div>
                      <div class="form-elem__title" v-else>Тип оборудования</div>
                      <custom-select
                        has-other-value
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'equipment[' + index + '].type'"
                        required
                        v-model="equipment.type"
                        :reference-type="equipmentReferenceType(equipment)"
                        :max-length="400"
                      ></custom-select>
                    </div>
                    <div class="form-elem" v-if="isOtherSelected(equipment.type)">
                      <div class="form-elem__title">
                        Наименование оборудования
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'equipment[' + index + '].type'"
                        required
                        type="text"
                        v-model="equipment.otherType"
                      ></custom-input>
                    </div>

                    <div class="form-elem">
                      <div class="form-elem__title">
                        Производитель оборудования
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'equipment[' + index + '].manufacturer'
                        "
                        required
                        type="text"
                        :max-length="400"
                        v-model="equipment.manufacturer"
                      ></custom-input>
                    </div>

                    <div class="form-elem">
                      <div class="form-elem__title">Марка оборудования</div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'equipment[' + index + '].brand'"
                        required
                        type="text"
                        :max-length="400"
                        v-model="equipment.brand"
                      ></custom-input>
                    </div>

                    <div v-if="typeIn([UTILIZATION_ID, NEUTRALIZATION_ID])">
                      <div class="form-elem">
                        <div class="form-elem__title">
                          Проектная мощность оборудования
                        </div>
                        <custom-input
                          :disabled="disableFields"
                          :select-field-disable="disableCheckboxes"
                          :hide-checkbox="hideCheckbox"
                          :select-fields-array="request.verifiedFields"
                          :select-field-name="
                            'equipment[' + index + '].projectPower'
                          "
                          required
                          type="number"
                          text="Тыс. тонн"
                          :whole="20"
                          :fraction="3"
                          :isErrorProp="!equipment.projectPower"
                          v-model="equipment.projectPower"
                        ></custom-input>
                      </div>
                      <div class="form-elem">
                        <div class="form-elem__title">
                          Краткое описание технологического процесса
                        </div>
                        <custom-input
                          :disabled="disableFields"
                          :select-field-disable="disableCheckboxes"
                          :hide-checkbox="hideCheckbox"
                          :select-fields-array="request.verifiedFields"
                          :select-field-name="
                            'equipment[' + index + '].processDescription'
                          "
                          required
                          type="text"
                          :max-length="400"
                          v-model="equipment.processDescription"
                        ></custom-input>
                      </div>
                      <div class="form-elem">
                        <div class="form-elem__title">Выпускаемая продукция</div>
                        <custom-input
                          :disabled="disableFields"
                          :select-field-disable="disableCheckboxes"
                          :hide-checkbox="hideCheckbox"
                          :select-fields-array="request.verifiedFields"
                          :select-field-name="
                            'equipment[' + index + '].production'
                          "
                          required
                          type="text"
                          v-model="equipment.production"
                        ></custom-input>
                      </div>
                    </div>

                    <div
                      class="row form-elem"
                      v-if="
                        equipment.kind && equipment.kind.value === 'Конвейеры'
                      "
                    >
                      <div class="col-50">
                        <div class="form-elem__title">Длина конвейера</div>
                        <custom-input
                          :disabled="disableFields"
                          :select-field-disable="disableCheckboxes"
                          :hide-checkbox="hideCheckbox"
                          :select-fields-array="request.verifiedFields"
                          :select-field-name="'equipment[' + index + '].length'"
                          required
                          type="number"
                          v-model="equipment.length"
                          :whole="20"
                          :fraction="3"
                          text="Метр"
                        ></custom-input>
                      </div>
                      <div class="col-50">
                        <div class="form-elem__title">Ширина конвейера</div>
                        <custom-input
                          :disabled="disableFields"
                          :select-field-disable="disableCheckboxes"
                          :hide-checkbox="hideCheckbox"
                          :select-fields-array="request.verifiedFields"
                          :select-field-name="'equipment[' + index + '].width'"
                          required
                          type="number"
                          v-model="equipment.width"
                          :whole="20"
                          :fraction="3"
                          text="Метр"
                        ></custom-input>
                      </div>
                    </div>

                    <div class="form-elem" v-if="typeIn([RECYCLING_ID])">
                      <div class="form-elem__title">Количество оборудования</div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'equipment[' + index + '].count'"
                        required
                        type="number"
                        integer
                        :whole="20"
                        :fraction="0"
                        v-model="equipment.count"
                      ></custom-input>
                    </div>
                  </div>

                  <div class="col-50">
                    <div
                      class="form-elem"
                      v-if="
                        equipment.kind && equipment.kind.value === 'Конвейеры'
                      "
                    >
                      <div class="form-elem__title">
                        Рабочая скорость линии конвейера
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'equipment[' + index + '].speed'"
                        required
                        type="number"
                        v-model="equipment.speed"
                        :whole="20"
                        :fraction="3"
                        text="м./мин"
                      ></custom-input>
                    </div>

                    <div
                      class="form-elem"
                      v-if="
                        equipment.type &&
                          equipment.type.value === 'Подающий конвейер'
                      "
                    >
                      <div class="form-elem__title">
                        Механизм загрузки отходов на подающий конвейер
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'equipment[' + index + '].loadingMechanism'
                        "
                        required
                        type="text"
                        :max-length="400"
                        v-model="equipment.loadingMechanism"
                      ></custom-input>
                    </div>

                    <div
                      class="form-elem"
                      v-if="
                        equipment.type &&
                          equipment.type.value === 'Сортировочный конвейер'
                      "
                    >
                      <div class="form-elem__title">
                        Толщина слоя отходов, подающихся на конвейер
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'equipment[' + index + '].wasteWidth'"
                        required
                        type="number"
                        v-model="equipment.wasteWidth"
                        :whole="20"
                        :fraction="3"
                        text="См."
                      ></custom-input>
                    </div>

                    <div
                      class="form-elem"
                      v-if="
                        equipment.type &&
                          equipment.type.value === 'Сортировочный конвейер'
                      "
                    >
                      <div class="form-elem__title">
                        Количество постов сортировки
                      </div>
                      <custom-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="
                          'equipment[' + index + '].sortingPostsCount'
                        "
                        required
                        type="number"
                        v-model="equipment.sortingPostsCount"
                        :whole="20"
                        :fraction="0"
                        text="Шт."
                      ></custom-input>
                    </div>

                    <div class="form-elem">
                      <div class="form-elem__title">Фотографии оборудования</div>
                      <photos-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-field-name="'equipment[' + index + '].photos'"
                        :select-fields-array="request.verifiedFields"
                        v-model="equipment.photos"
                      ></photos-input>
                    </div>

                    <div class="form-elem">
                      <div class="form-elem__title">Паспорт оборудования</div>
                      <photos-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-field-name="
                          'equipment[' + index + '].passportPhotos'
                        "
                        :select-fields-array="request.verifiedFields"
                        v-model="equipment.passportPhotos"
                      ></photos-input>
                      <file-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-field-name="'equipment[' + index + '].passport'"
                        :select-fields-array="request.verifiedFields"
                        v-model="equipment.passport"
                        :formats="['pdf']"
                        :size="20"
                        @onPdfView="onPdfView"
                      ></file-input>
                    </div>
                  </div>
                </div>

                <div class="form-elem"></div>
                <div class="form-elem--hr"></div>
              </div>

              <div class="form-elem form-elem--indent">
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary"
                  :disabled="disableFields"
                  @click.prevent="openEquipment()"
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить оборудование</span>
                </button>
              </div>
            </b-collapse>
          </div>

          <div
            class="form-group"
            v-if="typeIs(RECYCLING_ID)"
            id="blockSecondaryResources"
          >
            <h2
              v-b-toggle.collapse-18
              class="form-group__title position-relative"
            >
              Сведения о вторичных материальных ресурсах (ВМР), извлекаемых
              объектом по обращению с ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-18">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Процент извлекаемых вторичных материальных ресурсов по массе
                  </div>
                  <custom-input
                    :max="100"
                    :disabled="disableFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="secondaryResources.extractPercent"
                    required
                    type="number"
                    v-model="request.secondaryResources.extractPercent"
                    :whole="20"
                    :fraction="2"
                    text="%"
                  ></custom-input>
                </div>
              </div>

              <div
                v-for="(option, index) in request.secondaryResources.types"
                :key="index"
              >
                <div class="row form-elem">
                  <div class="col-50">
                    <div class="form-elem__title">
                      Вторичный материал №{{ index + 1 }}
                      <span
                        @click.prevent="removeSecondaryResource(option)"
                        v-if="!disableFields"
                      >
                        <img src="icons/Check-error.svg" />
                      </span>
                    </div>
                    <custom-select
                      has-other-value
                      :is-error-prop="!isSecondaryMaterialReferenceUnique(option)"
                      :select-fields-array="request.verifiedFields"
                      :select-field-name="
                        'secondaryResources.types[' + index + '].reference'
                      "
                      required
                      :disabled="disableFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      reference-type="SECONDARY_RESOURCES"
                      v-model="option.reference"
                    ></custom-select>
                  </div>
                  <div class="col-50">
                    <div class="form-elem__title">
                      Процент от массы входного потока
                    </div>
                    <custom-input
                      :select-fields-array="request.verifiedFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-field-name="
                        'secondaryResources.types[' + index + '].percent'
                      "
                      :is-error-prop="!isSecondaryMaterialPercentValid(option)"
                      required
                      type="number"
                      v-model="option.percent"
                      text="%"
                    ></custom-input>
                  </div>
                </div>
                <div
                  class="row form-elem"
                  v-if="isOtherSelected(option.reference)"
                >
                  <div class="col-50">
                    <div class="form-elem__title">Иной тип материала</div>
                    <custom-input
                      :select-fields-array="request.verifiedFields"
                      :select-field-disable="disableCheckboxes"
                      :hide-checkbox="hideCheckbox"
                      :select-field-name="
                        'secondaryResources.types[' + index + '].reference'
                      "
                      required
                      type="text"
                      v-model="option.otherSecondaryResourceTypeName"
                    ></custom-input>
                  </div>
                  <div class="col-50"></div>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Не указанные вторичные материальные ресурсы
                  </div>
                  <custom-input
                    disabled
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="secondaryResources.notSpecifiedSecondaryResourcesPercent"
                    type="number"
                    :value="notSpecifiedSecondaryResourcesPercent"
                    text="%"
                  ></custom-input>
                </div>
              </div>

              <div class="form-elem form-elem--indent">
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary"
                  :disabled="disableFields"
                  @click.prevent="addSecondaryResource()"
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить вторичный материал</span>
                </button>
              </div>
            </b-collapse>
          </div>

          <div
            class="form-group"
            v-if="typeIn([UTILIZATION_ID, NEUTRALIZATION_ID])"
            id="blockProducts"
          >
            <h2
              v-b-toggle.collapse-19
              class="form-group__title position-relative"
            >
              Сведения о выпускаемых объектом по обращению с ТКО товарах
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-19">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Общее количество выпускаемых товаров в год
                  </div>
                  <custom-input
                    :disabled="disableFields"
                    integer
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="productsInfo.totalCountPerYear"
                    required
                    type="number"
                    text="тыс. тонн/год"
                    :whole="20"
                    :fraction="2"
                    v-model="request.productsInfo.totalCountPerYear"
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <div
                v-for="(product, index) in request.productsInfo.products"
                :key="'PRODUCT - ' + index"
              >
                <h4 class="row row--centered form-elem">
                  Выпускаемый товар №{{ index + 1 }}
                  <span
                    @click.prevent="removeProduct(product)"
                    v-if="!disableFields"
                  >
                    <img src="icons/Check-error.svg" />
                  </span>
                </h4>

                <div class="row row--start">
                  <div class="col-50">
                    <div class="form-elem">
                      <div class="form-elem__title">
                        Наименование выпускаемого товара
                      </div>
                      <custom-input
                        type="text"
                        required
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'product[' + index + '].name'"
                        :hide-checkbox="hideCheckbox"
                        :max-length="4000"
                        v-model="product.name"
                      ></custom-input>
                    </div>

                    <div class="form-elem">
                      <div class="form-elem__title">
                        Объем выпускаемого товара
                      </div>
                      <custom-input
                        type="number"
                        required
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'product[' + index + '].volume'"
                        text="тыс. тонн/год"
                        :whole="20"
                        :fraction="2"
                        v-model="product.volume"
                      ></custom-input>
                    </div>
                  </div>

                  <div class="col-50">
                    <div class="form-elem">
                      <div class="form-elem__title">Фотографии товара</div>
                      <photos-input
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'product[' + index + '].photos'"
                        v-model="product.photos"
                      ></photos-input>
                    </div>
                  </div>
                </div>

                <div class="form-elem"></div>
                <div class="form-elem--hr"></div>
              </div>

              <div class="form-elem form-elem--indent">
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary"
                  :disabled="disableFields"
                  @click.prevent="addProduct()"
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить товар</span>
                </button>
              </div>

              <div
                v-for="(service, index) in request.productsInfo.providedServices"
                :key="'SERVICE - ' + index"
              >
                <h4 class="row row--centered form-elem">
                  Предоставляемая услуга №{{ index + 1 }}
                  <span
                    @click.prevent="removeService(service)"
                    v-if="!disableFields"
                  >
                    <img src="Check-error.svg" />
                  </span>
                </h4>

                <div class="row row--start">
                  <div class="col-50">
                    <div class="form-elem">
                      <div class="form-elem__title">
                        Наименование предоставлемой услуги
                      </div>
                      <custom-input
                        type="text"
                        required
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'service[' + index + '].name'"
                        :max-length="4000"
                        v-model="service.name"
                      ></custom-input>
                    </div>
                  </div>

                  <div class="col-50">
                    <div class="form-elem">
                      <div class="form-elem__title">
                        Объем предоставляемой услуги
                      </div>
                      <custom-input
                        type="number"
                        required
                        :disabled="disableFields"
                        :select-field-disable="disableCheckboxes"
                        :hide-checkbox="hideCheckbox"
                        :select-fields-array="request.verifiedFields"
                        :select-field-name="'service[' + index + '].volume'"
                        :whole="20"
                        :fraction="2"
                        v-model="service.volume"
                      ></custom-input>
                    </div>
                  </div>
                </div>

                <div class="form-elem"></div>
                <div class="form-elem--hr"></div>
              </div>

              <div class="form-elem form-elem--indent">
                <button
                  type="button"
                  class="btn btn-lg btn-transparent btn-secondary"
                  :disabled="disableFields"
                  @click.prevent="addService()"
                >
                  <img left src="icons/Circle-plus.svg" />
                  <span>Добавить услугу</span>
                </button>
              </div>
            </b-collapse>
          </div>

          <div class="form-group" v-if="isAdmin" id="blockRegionalOperator">
            <h2
              v-b-toggle.collapse-20
              class="form-group__title position-relative"
            >
              Сведения о региональном операторе, в зону деятельности которого
              попадает объект по обращению с ТКО
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-20">
              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Наименование регионального оператора
                  </div>
                  <custom-input
                    type="text"
                    required
                    :disabled="disableAdminFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="roInfo.name"
                    v-model="request.roInfo.name"
                    :loading="roInfoLoading"
                    :max-length="4000"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">ID регионального оператора</div>
                  <custom-input
                    type="text"
                    disabled
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="roInfo.roId"
                    v-model="request.roInfo.roId"
                    :loading="roInfoLoading"
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    ИНН регионального оператора
                    <hint
                      message="Заполните поле и нажмите на лупу. Связанные поля заполнятся значениями."
                    ></hint>
                  </div>
                  <!-- Может быть ИНН начинающийся с 0, а это не число -->
                  <custom-input
                    required
                    type="text"
                    :disabled="disableAdminFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="roInfo.inn"
                    v-model="request.roInfo.inn"
                    :loading="roInfoLoading"
                    action="icons/Search.svg"
                    @action="updateInnRo"
                    :max-length="12"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Наименование зоны деятельности регионального оператора
                  </div>
                  <custom-select
                    v-if="roZones && roZones.length"
                    required
                    :disabled="disableAdminFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="roInfo.zoneName"
                    v-model="request.roInfo.zoneName"
                    :values="roZones"
                    :loading="roInfoLoading"
                  ></custom-select>
                  <custom-input
                    v-else
                    type="text"
                    required
                    :disabled="disableAdminFields"
                    :select-field-disable="disableCheckboxes"
                    :hide-checkbox="hideCheckbox"
                    :select-fields-array="request.verifiedFields"
                    select-field-name="roInfo.zoneName"
                    v-model="request.roInfo.zoneName"
                    :loading="roInfoLoading"
                  ></custom-input>
                </div>
              </div>
            </b-collapse>
          </div>

          <div class="form-elem form-elem--indent">
            <checkbox-input
              :disabled="disableFields"
              v-model="request.approved"
              text="Анкета-заявка по включению объекта по обращению с ТКО в Реестр объектов по обращению с ТКО полностью сформирована"
            >
            </checkbox-input>
          </div>
        </form>

        <form
          class="form"
          v-show="tab === 'survey'"
          v-if="request.technicalSurvey"
        >
          <div class="row form-elem">
            <div class="col-50">
              <div class="form-elem__title">
                Наименование региона (субъекта РФ)
              </div>
              <custom-select
                disabled
                v-model="request.dataSource.subjectName"
                reference-type="REGION"
              ></custom-select>
            </div>
            <div class="col-50">
              <div class="form-elem__title">ID технического обследования</div>
              <custom-input
                type="text"
                v-model="request.technicalSurvey.id"
                disabled
              ></custom-input>
            </div>
          </div>

          <div class="form-elem">
            <div class="form-elem__title">
              Наименование объекта по обращению с ТКО, осуществляющего
              проведения технического обследования
            </div>
            <custom-input
              type="text"
              disabled
              v-model="request.name"
              :max-length="4000"
            ></custom-input>
          </div>

          <div class="form-elem">
            <div class="form-elem__title">
              Текстовое описание адресного ориентира
            </div>
            <custom-input
              type="text"
              disabled
              v-model="request.addressDescription"
              :max-length="4000"
            ></custom-input>
          </div>

          <div class="form-group" id="blockTechnicalSurvey">
            <h2
              v-b-toggle.collapse-21
              class="form-group__title position-relative"
            >
              Техническое обследование
              <b-icon
                icon="chevron-right"
                scale="1.2"
                class="position-absolute top-0 end-0"
              />
            </h2>

            <b-collapse visible id="collapse-21">
              <div class="form-elem">
                <div class="form-elem__title">
                  ФИО уполномоченного лица оператора объекта по обращению с ТКО,
                  осуществляющего проведение технического обследования
                </div>
                <custom-input
                  type="text"
                  :disabled="disableFields"
                  v-model="request.technicalSurvey.operatorRepresentativeName"
                  :max-length="40"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Должность уполномоченного лица оператора объекта по обращению с
                  ТКО, осуществляющего проведение технического обследования
                </div>
                <custom-input
                  type="text"
                  :disabled="disableFields"
                  v-model="request.technicalSurvey.operatorRepresentativePosition"
                  :max-length="100"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Наименование регионального оператора
                </div>
                <custom-input
                  type="text"
                  v-model="request.roInfo.name"
                  :max-length="4000"
                  disabled
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  ФИО уполномоченного лица регионального оператора, участвующего в
                  проведении технического обследования
                </div>
                <custom-input
                  type="text"
                  :disabled="disableFields"
                  v-model="request.technicalSurvey.roRepresentativeName"
                  :max-length="40"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Должность уполномоченного лица регионального оператора,
                  участвующего в проведении технического обследования
                </div>
                <custom-input
                  type="text"
                  :disabled="disableFields"
                  v-model="request.technicalSurvey.roRepresentativePosition"
                  :max-length="100"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Наименование органа местного самоуправления (ОМСУ) населенного
                  пункта, на территории которого расположен объект, участвующего в
                  проведении технического обследования
                </div>
                <custom-input
                  type="text"
                  :disabled="disableFields"
                  v-model="request.technicalSurvey.omsuName"
                  :max-length="100"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  ФИО уполномоченного лица ОМСУ, участвующего в проведении
                  технического обследования
                </div>
                <custom-input
                  type="text"
                  :disabled="disableFields"
                  v-model="request.technicalSurvey.omsuRepresentativeName"
                  :max-length="40"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Должность уполномоченного лица ОМСУ, участвующего в проведении
                  технического обследования
                </div>
                <custom-input
                  type="text"
                  :disabled="disableFields"
                  v-model="request.technicalSurvey.omsuRepresentativePosition"
                  :max-length="100"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Наименование иного органа исполнительной власти, участвующего в
                  проведении технического обследования
                </div>
                <custom-input
                  type="text"
                  :disabled="disableFields"
                  v-model="request.technicalSurvey.otherParticipantName"
                  :max-length="100"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  ФИО уполномоченного лица иного органа исполнительной власти,
                  участвующего в проведении технического обследования
                </div>
                <custom-input
                  type="text"
                  :disabled="disableFields"
                  v-model="
                    request.technicalSurvey.otherParticipantRepresentativeName
                  "
                  :max-length="40"
                ></custom-input>
              </div>

              <div class="form-elem">
                <div class="form-elem__title">
                  Должность уполномоченного лица иного органа исполнительной
                  власти, участвующего в проведении технического обследования
                </div>
                <custom-input
                  type="text"
                  :disabled="disableFields"
                  v-model="
                    request.technicalSurvey.otherParticipantRepresentativePosition
                  "
                  :max-length="100"
                ></custom-input>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Дата начала проведения технического обследования
                  </div>
                  <custom-input
                    class="toCapitalizeWeekDay"
                    type="datetime"
                    required
                    :disabled="disableFields"
                    v-model="request.technicalSurvey.startDate"
                  ></custom-input>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Дата завершения проведения технического обследования
                  </div>
                  <custom-input
                    class="toCapitalizeWeekDay"
                    type="datetime"
                    required
                    :disabled="disableFields"
                    :disabled-date="notBeforeTechnicalSurveyStartDate"
                    v-model="request.technicalSurvey.endDate"
                  ></custom-input>
                </div>
              </div>

              <div class="row form-elem">
                <div class="col-50">
                  <div class="form-elem__title">
                    Результаты проведения технического обследования
                  </div>
                  <custom-select
                    has-other-value
                    :disabled="disableFields"
                    v-model="request.technicalSurvey.result"
                    reference-type="TECHNICAL_SURVEY_RESULT"
                  ></custom-select>
                </div>
                <div class="col-50">
                  <div class="form-elem__title">
                    Статус проведения технического осмотра
                  </div>
                  <custom-select
                    :disabled="disableFields"
                    v-model="request.technicalSurvey.status"
                    :values="technicalSurveyStatuses"
                    field-name="displayName"
                  ></custom-select>
                </div>
              </div>
              <div
                class="row form-elem"
                v-if="isOtherSelected(request.technicalSurvey.otherResult)"
              >
                <div class="col-50">
                  <div class="form-elem__title">
                    Иные результаты проведения технического обследования
                  </div>
                  <custom-input
                    type="text"
                    required
                    :disabled="disableFields"
                    v-model="request.technicalSurvey.otherResult"
                  ></custom-input>
                </div>
                <div class="col-50"></div>
              </div>

              <!-- С файлами непонятно пока
                          <div class="row form-elem">
                              <div class="col-50">
                                  <div class="form-elem__title">
                                      Загрузить акт ТО
                                  </div>
                                  <file-input :disabled="disableFields"
                                              v-model="request.technicalSurvey.act"
                                              :formats="['pdf']"
                                              :size="20"
                                  ></file-input>
                              </div>
                              <div class="col-50">
                              </div>
                          </div>
                          -->
            </b-collapse>
          </div>
        </form>

        <request-history v-if="tab === 'history'" :request-id="request.id" />

        <div v-if="tab !== 'history'">
          <button
            class="btn btn-transparent btn-grey"
            v-if="isSaveDraftAvailable"
            @click.prevent="submitDraft()"
          >
            <img left src="icons/File.svg" />
            <span>Сохранить черновик</span>
          </button>

          <button
            class="btn btn-solid btn-primary"
            v-if="isSendToTechicalSurveyBtnAvailable"
            @click.prevent="submit('SendToTechSurvey', false, true)"
          >
            <img left src="icons/Forward.svg" />
            <span>Отправить на техническое обследование</span>
          </button>

          <button
            class="btn btn-solid btn-primary"
            v-if="isSendToModerationBtnAvailable"
            @click.prevent="submit('SendToModeration', false, true)"
          >
            <img left src="icons/Forward.svg" />
            <span>Отправить на модерацию</span>
          </button>

          <button
            class="btn btn-solid btn-primary"
            v-if="isVerifyBtnAvailable"
            @click.prevent="
              showConfirmation(
                'Вы собираетесь верифицировать всю анкету объекта. Вы действительно хотите это сделать?',
                submit,
                ['SetVerified', false, true],
              )
            "
          >
            <img left src="icons/Forward.svg" />
            <span>Верифицировать</span>
          </button>

          <button
            class="btn btn-solid btn-primary"
            v-if="isRequestTechnicalSurveyFromOperatorBtnAvailable"
            @click.prevent="
              showConfirmation(
                'Вы собираетесь запросить отправку анкеты объекта на техническое обследование у оператора. Вы действительно хотите это сделать? Укажите причину:',
                submit,
                ['TechnicalSurveyRequested', false, true],
                true,
              )
            "
          >
            <img left src="icons/Forward.svg" />
            <span
              >Запросить отправку на техническое обследование у оператора</span
            >
          </button>

          <button
            class="btn btn-solid btn-primary"
            v-if="isRequestAuditBtnAvailable"
            @click.prevent="submit('RequestAudit', false, false)"
          >
            <img left src="icons/Forward.svg" />
            <span>Запросить ревизию данных аналитиком</span>
          </button>

          <button
            class="btn btn-solid btn-secondary"
            v-if="isArchiveBtnAvailable"
            @click.prevent="submit('Archive', false, false)"
          >
            <img left src="icons/Forward.svg" />
            <span>Архивировать</span>
          </button>

          <button
            class="btn btn-solid btn-error"
            v-if="isRejectBtnAvailable"
            @click.prevent="
              showConfirmation(
                'Вы собираетесь отклонить анкету объекта. Вы действительно хотите это сделать? Укажите причину:',
                submit,
                ['Reject', false, false],
                true,
              )
            "
          >
            <img left src="icons/Close-white.svg" />
            <span>Отклонить</span>
          </button>
        </div>
      </div>

      <div class="block__sidebar">
        <div class="sidebar__wrapper" style="top: 122px">
          <div
            v-for="(item, index) in sidebarElements"
            :key="index + item.title"
            v-if="!item.hideFun()"
            class="sidebar-elem"
          >
            <div
              class="sidebar-elem__wrapper sidebar-elem--title"
              :class="{
                'sidebar-elem--first': item.id === getCurrentSidebarElementId,
                'sidebar-elem--open': item.opened,
              }"
              @click.stop="
                item.subItems ? toggleSidebarElement(item) : navigateTo(item)
              "
            >
              <div class="sidebar-elem__arrow">
                <img v-if="item.subItems" src="icons/Arrow-dark.svg" />
              </div>
              <div class="sidebar-elem__text">
                {{ item.title }}
              </div>
              <div class="sidebar-elem__checked">
                <img
                  v-if="item.checkedFun()"
                  src="icons/Check-yes.svg"
                  height="24"
                  width="24"
                />
                <img
                  v-if="!item.checkedFun()"
                  src="icons/Check-warn.svg"
                  height="24"
                  width="24"
                />
              </div>
            </div>

            <div
              v-if="item.opened && item.subItems && !subItem.hideFun()"
              v-for="subItem in item.subItems"
              :key="index + subItem.title"
              class="sidebar-elem"
            >
              <div
                class="sidebar-elem__wrapper"
                :class="{
                  'sidebar-elem--first':
                    subItem.id === getCurrentSidebarElementId,
                }"
                @click.stop="
                  subItem.subItems
                    ? toggleSidebarElement(subItem)
                    : navigateTo(subItem)
                "
              >
                <div class="sidebar-elem__arrow">
                  <img v-if="subItem.subItems" src="icons/Arrow-dark.svg" />
                </div>
                <div class="sidebar-elem__text">
                  {{ subItem.title }}
                </div>
                <div class="sidebar-elem__checked">
                  <img
                    v-if="subItem.checkedFun()"
                    src="icons/Check-yes.svg"
                    height="24"
                    width="24"
                  />
                  <img
                    v-if="!subItem.checkedFun()"
                    src="icons/Check-warn.svg"
                    height="24"
                    width="24"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <modal-window
      v-if="showPointModal"
      @close="showPointModal = false"
      @apply="addPoint(tempCurrentLandPlot, tempPoint)"
    >
      <div slot="header">Добавить точку</div>
      <div slot="body" class="w-100">
        <div class="form">
          <div class="form-elem">
            <div class="form-elem__title">Номер точки</div>
            <custom-input
              :prop-dirty="isPointRequestButtonPressed"
              required
              type="number"
              integer
              v-model="tempPoint.number"
            ></custom-input>
          </div>

          <div class="form-elem">
            <div class="form-elem__title">Координата точки X</div>
            <custom-input
              :prop-dirty="isPointRequestButtonPressed"
              required
              type="number"
              :fraction="6"
              :whole="20"
              v-model="tempPoint.x"
            ></custom-input>
          </div>

          <div class="form-elem">
            <div class="form-elem__title">Координата точки Y</div>
            <custom-input
              :prop-dirty="isPointRequestButtonPressed"
              required
              type="number"
              :fraction="6"
              :whole="20"
              v-model="tempPoint.y"
            ></custom-input>
          </div>

          <div class="form-elem">
            <div class="form-elem__title">
              Описание закрепления на местности
            </div>
            <custom-select
              :prop-dirty="isPointRequestButtonPressed"
              required
              v-model="tempPoint.description"
              reference-type="DOT_DESCRIPTION"
            ></custom-select>
          </div>
        </div>
      </div>
    </modal-window>

    <modal-window
      v-if="showEquipmentModal"
      @close="showEquipmentModal = false"
      @apply="addEquipment(tempEquipment)"
    >
      <div slot="header">Выбрать оборудование</div>
      <div slot="body">
        <div class="form">
          <div class="form-elem">
            <div class="form-elem__title">
              {{
                typeIn([UTILIZATION_ID, NEUTRALIZATION_ID])
                  ? 'Вид оборудования основное/вспомогательное'
                  : 'Вид оборудования'
              }}
            </div>
            <custom-select
              :prop-dirty="isAddEquipmentButtonPressed"
              required
              v-model="tempEquipment.kind"
              :reference-type="
                typeIn([UTILIZATION_ID, NEUTRALIZATION_ID])
                  ? 'UTILIZATION_OBJECT_EQUIPMENT_KIND'
                  : 'EQUIPMENT_KIND'
              "
            ></custom-select>
          </div>

          <div class="form-elem">
            <div class="form-elem__title">Модификация оборудования</div>
            <custom-select
              has-other-value
              :prop-dirty="isAddEquipmentButtonPressed"
              required
              v-model="tempEquipment.type"
              :reference-type="equipmentReferenceType()"
            ></custom-select>
          </div>

          <div class="form-elem" v-if="isOtherSelected(tempEquipment.type)">
            <div class="form-elem__title">Иная модификация</div>
            <custom-input
              :prop-dirty="isAddEquipmentButtonPressed"
              required
              v-model="tempEquipment.otherType"
              type="text"
            ></custom-input>
          </div>
        </div>
      </div>
    </modal-window>

    <modal-window
      v-if="showConfirmationModal"
      @close="showConfirmationModal = false"
      @apply="applyConfirmation()"
    >
      <div slot="header">Подтвердите</div>
      <div slot="body">
        <div class="row row--centered">
          <div class="col">
            <img left src="icons/Check-yes.svg" height="48" width="48" />
          </div>
          <div class="col-full">
            {{ confirmationMessage }}
          </div>
        </div>
        <div class="col-50" v-if="showReason">
          <div style="margin-top: 5px"></div>
          <custom-input
            required
            type="textarea"
            v-model="statusChangingReason"
            :max-length="1000"
          ></custom-input>
        </div>
      </div>
    </modal-window>
    <modal-window
      v-if="revision.show"
      @close="revision.show = false"
      @apply="applyRevision()"
    >
      <div slot="header">Запросить ревизию данных</div>
      <div slot="body">
        <div class="form">
          <div class="form-elem">
            <div class="form-elem__title">Дата проведения ревизии</div>
            <custom-input
              required
              type="date"
              v-model="request.revisionBefore"
              :isErrorProp="!request.revisionBefore"
            />
          </div>
        </div>
      </div>
    </modal-window>
    <modal-window
      v-show="pdfObj.file"
      full-display
      @close="pdfObj.file = null"
    >
      <div slot="header">
        {{ pdfObj.name }}
      </div>
      <div slot="body">
        <link rel="resource" type="application/l10n" href="viewer.properties">
        <vue-pdf-app
          :pdf="pdfObj.file"
          :file-name="pdfObj.name"
          theme="light"
          style="height: 80vh"
          :config="{
            toolbar: {
              toolbarViewerLeft: {
                findbar: false,
                previous: false,
                next: false
              },
              toolbarViewerRight: {
                presentationMode: false,
                openFile: false,
                viewBookmark: false
              }
            }
          }"
        >
        </vue-pdf-app>
      </div>
      <div slot="footer"></div>
    </modal-window>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CustomInput from '../components/forms/CustomInput';
import BooleanInput from '../components/forms/BooleanInput';
import CustomSelect from '../components/forms/CustomSelect';
import CheckboxInput from '../components/forms/CheckboxInput';
import FileInput from '../components/forms/FileInput';
import ModalWindow from '../components/modal/ModalWindow';
import { $ObjectUtils } from '../../services/utils.service';
import PhotosInput from '../components/forms/PhotosInput';
import { $DialogService } from '../../services/dialog.service';
import store from '../../plugins/store/store';
import { $InfrastructureObjectService } from '../../services/infrastructureobject.service';
import { $FiasService } from '../../services/fias.service';
import Loader from '../components/Loader';
import { $ReferenceService } from '../../services/reference.service';
import { $PpkService } from '../../services/ppk.service';
import ObjectStatus from '../components/ObjectStatus';
import Hint from '../components/Hint';
import ScheduleInput from '../components/forms/ScheduleInput';
import VuePdfApp from 'vue-pdf-app';
import 'vue-pdf-app/dist/icons/main.css';
import RequestHistory from './RequestHistory';
import ImportModal from '../components/modal/ImportModal.vue';

export default {
  name: 'Request',
  components: {
    ScheduleInput,
    Hint,
    ObjectStatus,
    Loader,
    PhotosInput,
    ModalWindow,
    FileInput,
    CheckboxInput,
    CustomSelect,
    BooleanInput,
    CustomInput,
    VuePdfApp,
    RequestHistory,
    ImportModal
  },

  data() {
    return {
      tab: 'request',
      isPointRequestButtonPressed: false,
      isAddEquipmentButtonPressed: false,
      loading: false,
      saving: true,
      requestImportModal: false,
      request: {
        secondaryResources: {},
        cost: {
          total: 0,
          equipment: 0,
          russianEquipment: 0,
          installation: 0,
          russianInstallation: 0
        }
      },
      wasteCategoriesInfo: {},
      wasteCategoriesShowInput: {},
      pdfObj: {
        file: null,
        name: null
      },
      roZones: [],
      roInfoLoading: false,
      fiasEntities: [],
      fiasIds: [],
      oktmoCodes: [],
      fiasLoading: false,

      innLoading: false,
      innLoadingOperator: false,
      innLoadingInvestment: false,
      innLoadingProjectOrganization: false,
      innLoadingMineSurveyingOrganization: false,

      sidebarElements: [
        this.createSidebarElement(
          'blockDatasource',
          'Источники данных об объекте по обращению с ТКО',
          () => this.isDatasourceValid
        ),
        // this.createSidebarElement(
        //     'blockVerificationStatus',
        //     'Сведения о статусе верификации данных',
        //     () => this.isVerificationStatusValid,
        //     undefined,
        //     () => !this.isAdmin
        // ),
        this.createSidebarElement(
          'blockGeneralInfo',
          'Общие сведения об объекте',
          () => this.isGeneralInfoValid,
          undefined,
          () => false
        ),
        this.createSidebarElement(
          'blockPropertyLocation',
          'Расположение объекта',
          () => this.isPropertyLocationValid
        ),
        this.createSidebarElement(
          'blockExploitation',
          'Эксплуатация',
          () => this.isExploitationValid
        ),
        this.createSidebarElement(
          'blockOperator',
          'Сведения об операторе объекта',
          () => this.isOperatorValid
        ),
        this.createSidebarElement(
          'blockContactInformation',
          'Контактная информация',
          () => this.isOperatorContactInformationValid
        ),
        this.createSidebarElement(
          'blockInvestmentsWrapper',
          'Инвестиции',
          () => this.isInvestmentsValid && this.isCostValid,
          [
            this.createSidebarElement(
              'blockInvestments',
              'Инвестиции',
              () => this.isInvestmentsValid
            ),
            this.createSidebarElement(
              'blockCost',
              'Сведения о стоимости объекта',
              () => this.isCostValid
            )
          ],
          () =>
            !this.statusIn([
              this.STATUS_PERSPECTIVE_ID,
              this.STATUS_INVESTMENT_ID
            ])
        ),
        this.createSidebarElement(
          'blockBorderLandPlotWrapper',
          'Сведения о земельном участке (земельных участках), в границах которого (которых) находится объект по обращению с ТКО, и размещенных на нем (на них) зданиях',
          () =>
            this.isBorderLandPlotValid &&
            this.isCurrentLandPlotCoordinatesValid &&
            this.isCharacteristicLandPlotValid,
          [
            this.createSidebarElement(
              'blockBorderLandPlot',
              'Сведения о земельном участке (земельных участках), в границах которого (которых) находится объект по обращению с ТКО, и размещенных на нем (на них) зданиях',
              () => this.isBorderLandPlotValid
            ),
            this.createSidebarElement(
              'blockCurrentLandPlot',
              'Координаты границ земельного участка, на котором расположен объект',
              () => this.isCurrentLandPlotCoordinatesValid,
              undefined,
              () =>
                !this.request.borderLandPlots[0]
                  .hasLandPlotForProjectRealization
            ),
            this.createSidebarElement(
              'blockCharacteristicLandPlot',
              'Характеристика существующего/планируемого земельного участка',
              () => this.isCharacteristicLandPlotValid
            )
          ]
        ),
        this.createSidebarElement(
          'blockAcceptanceDocumentation',
          'Сведения о проектно-разрешительной документации, разрешениях и заключениях',
          () => this.isAcceptanceDocumentationValid
        ),
        this.createSidebarElement(
          'blockSchedule',
          'Сведения о графике работы объекта',
          () => this.isScheduleValid
        ),
        this.createSidebarElement(
          'blockTariffs',
          'Сведения о тарифах объекта',
          () => this.isTariffValid
        ),
        this.createSidebarElement(
          'blockIndicators',
          'Сведения о характеристиках, индикаторах (показателях) деятельности, технологической части объекта',
          () => this.isIndicatorValid
        ),
        this.createSidebarElement(
          'blockWasteTypes',
          'Сведения о видах отходов на объекте',
          () => this.isWasteTypesValid
        ),
        this.createSidebarElement(
          'blockInfrastructureObjects',
          'Сведения об объектах инфраструктуры объекта',
          () => this.isInfrastructureObjectInfoValid
        ),
        this.createSidebarElement(
          'blockEquipment',
          'Сведения об оборудовании объекта по обращению с ТКО',
          () => this.isEquipmentValid,
          undefined,
          () =>
            !this.typeIn([
              this.RECYCLING_ID,
              this.UTILIZATION_ID,
              this.NEUTRALIZATION_ID
            ])
        ),
        this.createSidebarElement(
          'blockSecondaryResources',
          'Сведения о вторичных материальных ресурсах (ВМР), извлекаемых объектом',
          () => this.isSecondaryResourcesValid,
          undefined,
          () => !this.typeIs(this.RECYCLING_ID)
        ),
        this.createSidebarElement(
          'blockProducts',
          'Сведения о выпускаемых объектом по обращению с ТКО товарах',
          () => this.isProductsInfoValid,
          undefined,
          () => !this.typeIn([this.UTILIZATION_ID, this.NEUTRALIZATION_ID])
        ),
        this.createSidebarElement(
          'blockRegionalOperator',
          'Сведения о региональном операторе, в зону деятельности которого попадает объект',
          () => this.isRegionalOperatorValid,
          undefined,
          () => !this.isAdmin
        ),
        this.createSidebarElement(
          'blockTechnicalSurvey',
          'Техническое обследование',
          () => this.isTechnicalSurveyValid,
          undefined,
          () =>
            !this.request.technicalSurvey || !this.request.technicalSurvey.id
        )
      ],
      currentSidebarElementId: undefined,
      sidebarElementsOffset: 30,
      sidebarElementsMinOffset: undefined,
      navigatedToError: false,

      // Модальное окно точки
      showPointModal: false,
      tempCurrentLandPlot: undefined,
      tempPoint: {},
      // Новая точка добавляется или изменяется существуюая
      isNewPoint: true,

      // Модальное окно оборудования
      showEquipmentModal: false,
      tempEquipment: {},

      // Модальное окно подтверждения
      showConfirmationModal: false,
      confirmationMessage: '',
      confirmationFunction: undefined,
      showReason: false,
      statusChangingReason: '',

      // Модальное окно ревизии
      revision: {
        show: false,
        func: null,
        args: null
      },

      // Регионы, районы
      federalDistricts: [],
      federalDistrictsLoading: false,
      regions: [],
      regionsLoading: false,
      subjectAreas: [],
      subjectAreasLoading: false,

      // Черновик
      draftIntervalId: undefined,
      draftPeriod: 1000 * 30,

      // Техническое обследование
      technicalSurveyStatuses: [],

      // Типы объектов (после фильтрации)
      objectTypes: [],
      wasteManagementTypes: [],

      // IDs
      RECYCLING_ID: '1ec1e9f9-b27f-435d-8914-24f9793a9ece',
      UTILIZATION_ID: 'b988586c-a56c-4622-b7a2-d0f1a62279ca',
      NEUTRALIZATION_ID: '9aec93b5-182f-4b7c-98db-0fbba6e77213',
      PLACING_ID: '2cc6f41a-0bb8-4bc1-aea5-4ceda8e59441',

      STATUS_PERSPECTIVE_ID: '72290dbd-bd58-4d28-89f4-5b8d7d7af0bc',
      STATUS_ACTIVE_ID: '08ebe7d6-92d4-4fc8-a5e7-842df357d6bc',
      STATUS_INACTIVE_ID: '48c43465-d171-459e-9b9c-8e0990dd6413',
      STATUS_BUILDING_ID: 'b2d9bf90-4904-4420-bb15-efffbb68cb0a',
      STATUS_INVESTMENT_ID: '9d2d962c-61d2-4671-bdf8-22f21c5a2476',

      ACTION_RECYCLING_ID: '4d8cd9ad-5e0f-4277-b15c-c1ff111c2e41',
      ACTION_UTILIZATION_ID: 'd2a15470-525d-45eb-acdd-ad2259bc6a4f',
      ACTION_NEUTRALIZATION_ID: '94c47925-8add-482a-8818-f0970bf5ad51',
      ACTION_PLACING_ID: '202cd4d3-d56d-4043-9801-b66bf29275eb',

      ACTION_LAND_ID: 'afc26a9a-9d54-4843-916d-18a668464c4c',

      TYPE_POLYGON_GRORO: 'fe87a270-a839-4197-97be-3a51279c6a00',
      TYPE_POLYGON_TEMP: '6e359927-ebae-494a-be45-9028f0a1bf46',
      TYPE_NOT_USED: '3e8ed617-f430-4d4b-a79b-ca4a7c7d0f8b',
      TYPE_SORTING: '3cd2517f-7fc9-4558-9be3-2a834f895f1d',
      TYPE_NEUTRALIZATION: '7cefdca7-cdc8-4ece-9a5d-79fcf3b4a50f',
      TYPE_INCINERATOR: 'bb8ed9e4-1f97-4228-add6-83ce8b2f3429',
      TYPE_UTILIZATION_ENERGY: 'c2f6e3d3-56f5-4ba2-8767-d20e9ae91494',
      TYPE_UTILIZATION: '9dea9a09-d5bf-439c-8b49-4e76da371dc6',
      TYPE_PLACING: 'bd62c4d0-1814-432f-b6b6-1598a5f0a451',
      TYPE_BURY: '744a1874-e1ba-4693-b3ff-bbac5c7e8ca6',

      RECYCLING_TYPES: [],
      UTILIZATION_TYPES: [],
      NEUTRALIZATION_TYPES: [],
      PLACING_TYPES: []
    };
  },

  computed: {
    ...mapGetters('oidcStore', ['oidcIsAuthenticated', 'oidcUser']),

    getCurrentSidebarElementId: function() {
      return this.currentSidebarElementId;
    },

    notSpecifiedSecondaryResourcesPercent: function() {
      const secondaryResources = this.request.secondaryResources;
      if (
        secondaryResources.extractPercent ||
        secondaryResources.extractPercent === 0
      ) {
        if (secondaryResources.types && secondaryResources.types.length) {
          let result = secondaryResources.extractPercent;
          for (let i = 0; i < secondaryResources.types.length; i++) {
            if (secondaryResources.types[i].percent) {
              result -= secondaryResources.types[i].percent;
            }
          }
          return result;
        }
        return secondaryResources.extractPercent;
      }

      return 0;
    },

    requestId: function() {
      return this.$route.query.requestId;
    },

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

    isSendToTechicalSurveyBtnAvailable: function() {
      if (this.loading || !this.request || !this.request.flowStatus) {
        return false;
      }

      return (
        !this.isAdmin &&
        !this.isAnalyst &&
        this.request.flowStatus.name === 'TECHNICAL_SURVEY_REQUESTED'
      );
    },

    isSendToModerationBtnAvailable: function() {
      if (this.loading || !this.request) {
        return false;
      }

      return (
        !this.isAdmin &&
        !this.isAnalyst &&
        (!this.request.flowStatus ||
          !this.request.flowStatus.name ||
          this.request.flowStatus.name === 'DRAFT' ||
          this.request.flowStatus.name === 'TECHNICAL_SURVEY_ENDED' ||
          this.request.flowStatus.name === 'REJECTED')
      );
    },

    isVerifyBtnAvailable: function() {
      if (this.loading || !this.request || !this.request.flowStatus) {
        return false;
      }

      if (!this.request.flowStatus) {
        return false;
      }

      if (this.isAdmin) {
        return this.request.flowStatus.name === 'MODERATION';
      }

      if (this.isAnalyst) {
        return this.request.flowStatus.name === 'AUDIT';
      }

      return this.isAdmin && this.request.flowStatus.name === 'MODERATION';
    },

    isRequestTechnicalSurveyFromOperatorBtnAvailable: function() {
      if (this.loading || !this.request || !this.request.flowStatus) {
        return false;
      }

      if (!this.request.flowStatus) {
        return false;
      }

      if (this.isAdmin) {
        return this.request.flowStatus.name === 'MODERATION';
      }

      if (this.isAnalyst) {
        return this.request.flowStatus.name === 'AUDIT';
      }

      return false;
    },

    isRequestAuditBtnAvailable: function() {
      if (this.loading || !this.request || !this.request.flowStatus) {
        return false;
      }
      return (
        this.isAdmin &&
        this.request.flowStatus &&
        this.request.flowStatus.name === 'MODERATION'
      );
    },

    isArchiveBtnAvailable: function() {
      if (this.loading || !this.request || !this.request.flowStatus) {
        return false;
      }

      return (
        this.isAdmin &&
        this.request.flowStatus &&
        this.request.flowStatus.name === 'VERIFIED'
      );
    },

    isRejectBtnAvailable: function() {
      if (this.loading || !this.request || !this.request.flowStatus) {
        return false;
      }

      if (this.isAdmin) {
        return this.request.flowStatus.name === 'MODERATION';
      }

      if (this.isAnalyst) {
        return this.request.flowStatus.name === 'AUDIT';
      }
    },

    isDeleteDraftAvailable: function() {
      return (
        this.request &&
        this.request.flowStatus &&
        this.request.flowStatus.name === 'DRAFT'
      );
    },

    isSaveDraftAvailable: function() {
      return (
        this.request.name &&
        (this.isSendToTechicalSurveyBtnAvailable ||
          this.isSendToModerationBtnAvailable)
      );
    },

    disableFields: function() {
      if (!this.request || !this.request.flowStatus) {
        return false;
      }

      if (this.isAdmin || this.isAnalyst) {
        return true;
      } else {
        return (
          this.request.flowStatus.name === 'MODERATION' ||
          this.request.flowStatus.name === 'TECHNICAL_SURVEY_CREATED' ||
          this.request.flowStatus.name === 'VERIFIED' ||
          this.request.flowStatus.name === 'ARCHIVE'
        );
      }
    },

    disableAdminFields: function() {
      if (!this.request || !this.request.flowStatus) {
        return false;
      }

      if (this.isAdmin) {
        return this.request.flowStatus.name !== 'MODERATION';
      }

      if (this.isAnalyst) {
        return this.request.flowStatus.name !== 'AUDIT';
      }

      return true;
    },

    disableCheckboxes: function() {
      if (!this.request || !this.request.flowStatus) {
        return true;
      }
      if (this.isAdmin) {
        if (
          this.request.flowStatus.name === 'DRAFT' ||
          this.request.flowStatus.name === 'TECHNICAL_SURVEY_REQUESTED' ||
          this.request.flowStatus.name === 'VERIFIED' ||
          this.request.flowStatus.name === 'TECHNICAL_SURVEY_ENDED' ||
          this.request.flowStatus.name === 'TECHNICAL_SURVEY_CREATED' ||
          this.request.flowStatus.name === 'ARCHIVE' ||
          this.request.flowStatus.name === 'AUDIT' ||
          this.request.flowStatus.name === 'REJECTED'
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (this.isAnalyst) {
        return this.request.flowStatus.name !== 'AUDIT';
      }

      return true;
    },

    hideCheckbox: function() {
      if (
        !this.request ||
        !this.request.flowStatus ||
        (this.isOperator &&
          (this.request.flowStatus.name === 'MODERATION' ||
            this.request.flowStatus.name === 'DRAFT'))
      ) {
        return true;
      } else {
        return false;
      }
    },

    wasteCategories: function() {
      return store.state.referenceStore.references.get('WASTE_CATEGORY');
    },

    isDatasourceValid: function() {
      const dataSource = this.request.dataSource;
      return (
        dataSource &&
        dataSource.name &&
        dataSource.subjectName &&
        dataSource.representativeFio &&
        dataSource.representativePosition
      );
    },

    isVerificationStatusValid: function() {
      return this.request.verificationStatusInfo;
    },

    isGeneralInfoValid: function() {
      const isGeneralPartValid =
        this.request.wasteManagementType &&
        this.request.type &&
        this.request.tkoObjectType &&
        this.request.ownerName &&
        this.request.ownerInn;

      if (!this.request.status && !this.request.otherObjectStatusName) {
        return false;
      }

      if (!this.request.wasteCategoryInfos) {
        return false;
      }

      if (!this.request.category) {
        return false;
      }

      let isValid = true;
      if (this.request.wasteCategoryInfos && this.request.wasteCategoryInfos) {
        this.request.wasteCategoryInfos.forEach(info => {
          if (!info.count || !info.wasteCategory) {
            isValid = false;
            // return false;
          }
        });
      }

      if (this.wasteCategories) {
        this.wasteCategories.forEach(category => {
          if (this.wasteCategoriesShowInput[category.value]) {
            if (!this.wasteCategoriesInfo[category.id]) {
              isValid = false;
              // return false;
            }
          }
        });
      }

      return isGeneralPartValid && isValid;
    },

    isPropertyLocationValid: function() {
      return (
        this.request.subjectName &&
        this.request.subjectAreaName &&
        this.request.latitude &&
        this.request.longitude
      );
    },

    isExploitationValid: function() {
      if (
        this.request.isInFederalOrRegionalPrograms &&
        !this.request.programs
      ) {
        return false;
      }
      if (this.request.hasSimilarObjectsInSubject) {
        if (!this.request.currentAndPlannedSimilarObjects) {
          return false;
        }
      }

      return (
        this.request.constructionStartDate &&
        this.request.exploitationStartActNumber &&
        this.request.exploitationStartDate &&
        this.request.exploitationPeriod !== null &&
        this.request.exploitationPeriod !== undefined
      );
    },

    isOperatorValid: function() {
      const operator = this.request.operator;
      return (
        operator &&
        operator.name &&
        operator.inn &&
        operator.kpp &&
        operator.ogrn
      );
    },

    isOperatorContactInformationValid: function() {
      const operator = this.request.operator;

      if (operator.email && !operator.email.match(/[\w.-]+@[\w.-]+\.[a-z]{2,3}$/)) {
        return false;
      }

      return (
        operator &&
        operator.phone &&
        operator.email &&
        operator.legalAddress &&
        operator.actualAddress &&
        operator.directorFio &&
        operator.representativeOfOperatorFio &&
        operator.representativeOfOperatorPosition
      );
    },

    isBorderLandPlotValid: function() {
      const borderLandPlot = this.request.borderLandPlots[0];

      if (!borderLandPlot) {
        return false;
      }

      if (!borderLandPlot.hasLandPlotForProjectRealization) {
        return true;
      }

      if (
        !(
          borderLandPlot.ownershipType &&
          borderLandPlot.cadastralNumber &&
          borderLandPlot.landCategory &&
          borderLandPlot.allowedUsingType &&
          (!this.landCategoryIs(this.ACTION_LAND_ID) ||
            borderLandPlot.compliancePeriod)
        )
      ) {
        return false;
      }

      if (
        !(
          borderLandPlot.rightsGivingDocumentName &&
          borderLandPlot.rightsGivingDocumentStartDate &&
          borderLandPlot.rigthsGivingDocumentNumber
        )
      ) {
        return false;
      }

      return true;
    },

    isCharacteristicLandPlotValid: function() {
      const borderLandPlot = this.request.borderLandPlots[0];

      if (!borderLandPlot) {
        return false;
      }

      if (
        (!borderLandPlot.hasPowerSupply &&
          !borderLandPlot.powerSupplyConnectionDate) ||
        (borderLandPlot.hasWaterSupply === false &&
          !borderLandPlot.watterSupplyConnectionDate) ||
        (borderLandPlot.hasGasSupply === false &&
          !borderLandPlot.gasSupplyConnectionDate) ||
        (borderLandPlot.hasHeatPipelinesConnection === false &&
          !borderLandPlot.heatPipelinesConnectionStartDate) ||
        (!borderLandPlot.hasAutomobileAccessRoads &&
          !borderLandPlot.automobileAccessRoadsConnectionDate)
      ) {
        return false;
      }

      if (borderLandPlot.hasRailway) {
        if (
          !borderLandPlot.distanceToNearestRailway ||
          !borderLandPlot.distanceToNearestTransshipment
        ) {
          return false;
        }
      }

      if (
        !borderLandPlot.distanceToNearestAirport ||
        !borderLandPlot.nearestAirportName
      ) {
        return false;
      }

      return (
        borderLandPlot.nearestSettlementName &&
        borderLandPlot.distanceToNearestSettlement
      );
    },

    isCurrentLandPlotCoordinatesValid: function() {
      if (
        !this.request.borderLandPlots ||
        !this.request.borderLandPlots.length ||
        !this.request.borderLandPlots[0]
      ) {
        return false;
      }

      if (!this.request.borderLandPlots[0].hasLandPlotForProjectRealization) {
        return true;
      }

      if (
        !this.request.currentLandPlots ||
        !this.request.currentLandPlots.length
      ) {
        return false;
      }

      let isValid = true;
      this.request.currentLandPlots.forEach(plot => {
        const isPlotValid =
          plot &&
          plot.cadastralNumber &&
          plot.coordinatesSystem &&
          plot.zoneNumber &&
          plot.averageInnacuracy;
        if (!isPlotValid) {
          isValid = false;
        }
      });
      return isValid;
    },

    isInvestmentsValid: function() {
      if (
        !this.statusIn([this.STATUS_PERSPECTIVE_ID, this.STATUS_INVESTMENT_ID])
      ) {
        // Блок отключен
        return true;
      }

      const investments = this.request.investments;
      if (!investments) {
        return false;
      }

      let isValid = true;
      investments.forEach(investment => {
        if (investment.email && !investment.email.match(/[\w.-]+@[\w.-]+\.[a-z]{2,3}$/)) {
          isValid = false;
          return;
        }

        const isInvestmentValid =
          investment.name &&
          investment.inn &&
          investment.kpp &&
          investment.ogrn &&
          investment.phone &&
          investment.email &&
          investment.website &&
          investment.legalAddress &&
          investment.actualAddress &&
          investment.directorFio &&
          investment.representatioveFio &&
          investment.representatiovePosition &&
          investment.experience &&
          investment.fullInvestmentAmount &&
          investment.risks &&
          investment.agreementRequisites &&
          investment.competitiveAdvantages;
        if (!isInvestmentValid) {
          isValid = false;
        }
      });

      return isValid;
    },

    isCostValid: function() {
      if (
        !this.statusIn([this.STATUS_PERSPECTIVE_ID, this.STATUS_INVESTMENT_ID])
      ) {
        // Блок отключен
        return true;
      }

      const cost = this.request.cost;

      if (!cost) {
        return false;
      }

      return cost.total && cost.equipment && cost.installation;
    },

    isAcceptanceDocumentationValid: function() {
      const documentation = this.request.acceptanceDocumentation;
      if (!documentation) {
        return false;
      }

      if (documentation.hasProjectDocumentation) {
        if (
          !documentation.projectOrganizationName ||
          !documentation.projectOrganizationInn
        ) {
          return false;
        }
      }

      if (documentation.hasStateRegistration) {
        if (
          !documentation.stateRegistrationDate ||
          !documentation.stateRegistrationNumber
        ) {
          return false;
        }
      }

      if (documentation.hasLicence) {
        if (!documentation.licenceAuthor) {
          return false;
        }
      } else {
        if (!documentation.licenceWillBeGivenDate) {
          return false;
        }
      }

      if (this.request.type.id === this.PLACING_ID) {
        //if (!documentation.groroNumber || !documentation.groroRequestRequisites) {
        if (
          documentation.isInRegistry &&
          !documentation.groroRequestRequisites
        ) {
          return false;
        }

        if (documentation.isInRegistry === false && !documentation.noGroroReason) {
          return false;
        }
      }

      if (documentation.hasGovernmentConclusion && !documentation.governmentConclusionDate) {
        return false;
      }

      if (documentation.isInTerritorialScheme) {
        if (
          !documentation.territorialSchemeDocumentRequisites ||
          !documentation.territorialSchemeLink ||
          !documentation.territorialSchemeModelLink
        ) {
          return false;
        }
      }

      if (documentation.hasSpecialInvestigations) {
        if (
          !documentation.specialInvestigator ||
          !documentation.specialInvestigationsDate
        ) {
          return false;
        }
      }

      if (documentation.isOnBorder && !documentation.dangerType) {
        return false;
      }

      return !!documentation.objectCategory;
    },

    isScheduleValid: function() {
      const schedule = this.request.workSchedule;

      if (!schedule) {
        return false;
      }

      const scheduleJson = JSON.parse(schedule.scheduleJson || '{}');
      let isScheduleValid = true;
      if (scheduleJson.everyDay) {
        if (
          (scheduleJson.schedule && !scheduleJson.schedule.from) ||
          (scheduleJson.schedule && !scheduleJson.schedule.to) ||
          (scheduleJson.break && !scheduleJson.break.from) ||
          (scheduleJson.break && !scheduleJson.break.to)
        ) {
          isScheduleValid = false
        }
      } else if (scheduleJson.days) {
        scheduleJson.days.forEach((v) => {
          if (v && v.working) {
            if (
              (v.schedule && !v.schedule.from) ||
              (v.schedule && !v.schedule.to) ||
              (v.break && !v.break.from) ||
              (v.break && !v.break.to)
            ) {
              isScheduleValid = false
            }
          }
        });
      }

      return (
        schedule.scheduleJson &&
        isScheduleValid &&
        //schedule.scheduleStart &&
        //schedule.scheduleEnd &&
        schedule.daysPerYearCount &&
        schedule.workplacesCount &&
        schedule.managersCount &&
        schedule.workersCount &&
        schedule.shiftsPerDayCount
      );
    },

    isTariffValid: function() {
      const tariffInfo = this.request.tariffInfo;

      if (!tariffInfo) {
        return false;
      }

      for (let i = 0; i < tariffInfo.tariffs.length; i++) {
        let tariff = tariffInfo.tariffs[i];
        if (
          !tariff.tariffPerTon ||
          !tariff.tariffStartDate ||
          !tariff.tariffEndDate
        ) {
          return false;
        }
      }

      return this.typeIs(this.PLACING_ID) ? true : tariffInfo.burial;
    },

    isIndicatorValid: function() {
      const indicator = this.request.indicator;

      if (!indicator) {
        return false;
      }

      if (indicator.hasCompostingZone) {
        if (
          !indicator.compostingZoneCapacityPerYear ||
          !indicator.compostingMaterialName ||
          !indicator.compostPurpose
        ) {
          return false;
        }
      }

      if (indicator.hasRdfZone) {
        if (!indicator.rdfZoneCapacityPerYear || !indicator.rdfPurpose) {
          return false;
        }
      }

      if (indicator.isImportSubstitutionNeeded && !indicator.equipmentType) {
        return false;
      }

      if (indicator.isNdtEquipmentUsed) {
        if (!indicator.ndtEquipmentType || !indicator.ndtDictionaryName) {
          return false;
        }
      }

      if (indicator.hasThermalRecycling) {
        if (!indicator.thermalRecyclingPower) {
          return false;
        }
      }

      // indicator.projectCapacity &&
      return (
        indicator.productionCapacity &&
        indicator.freeCapacity &&
        indicator.previousYearTkoWeight &&
        indicator.previousYearNonTkoWeight &&
        (!(
          this.typeIs(this.UTILIZATION_ID) ||
          this.typeIs(this.NEUTRALIZATION_ID)
        ) ||
          indicator.techProcessDescription) &&
        (!this.typeIs(this.UTILIZATION_ID) || indicator.utilizationPercent) &&
        (!this.typeIs(this.PLACING_ID) || indicator.nextYearFreeCapacity) &&
        (!this.typeIs(this.PLACING_ID) || indicator.placingArea) &&
        (!this.typeIs(this.PLACING_ID) || indicator.projectHeight) &&
        (!this.typeIs(this.RECYCLING_ID) ||
          indicator.secondaryRawMaterialsPerYear)
      );
    },

    isWasteTypesValid: function() {
      const wasteInfo = this.request.wasteInfo;
      if (!wasteInfo) {
        return false;
      }

      for (let i = 0; i < wasteInfo.wasteTypes.length; i++) {
        let wasteType = wasteInfo.wasteTypes[i];
        if (
          !wasteType.wasteType ||
          !(!this.typeIs(this.NEUTRALIZATION_ID) || wasteType.dangerType)
        ) {
          return false;
        }
      }

      if (this.typeIs(this.UTILIZATION_ID)) {
        return (
          wasteInfo.vmrThisYear &&
          wasteInfo.vmrPreviousYear &&
          wasteInfo.vmrCost
        );
      } else {
        if (!this.typeIs(this.PLACING_ID)) {
          for (let i = 0; i < wasteInfo.wasteDirections.length; i++) {
            let wasteDirection = wasteInfo.wasteDirections[i];

            if (!wasteDirection.coordsOrGroro) {
              return false;
            }
          }
        }

        return (
          wasteInfo.wasteCount &&
          wasteInfo.wasteThisYear &&
          wasteInfo.wastePreviousYear
        );
      }
    },

    isInfrastructureObjectInfoValid: function() {
      const info = this.request.infrastructureObjectInfo;

      if (!info) {
        return false;
      }

      if (info.hasWeightControl) {
        if (!info.weightControlCount && info.weightControlCount !== 0) {
          return false;
        }
        if (info.weightControls && info.weightControls.length) {
          for (let i = 0; i < info.weightControls.length; i++) {
            if (
              !info.weightControls[i].manufacturer ||
              !info.weightControls[i].brand ||
              !info.weightControls[i].length
            ) {
              return false;
            }
          }
        }
      } else {
        if (!info.noWeightControlReason) {
          return false;
        }
      }

      if (info.hasWheelsWashingPoint) {
        if (
          !info.wheelsWashingPointCount &&
          info.wheelsWashingPointCount !== 0
        ) {
          return false;
        }
        if (info.wheelsWashingPoints && info.wheelsWashingPoints.length) {
          for (let i = 0; i < info.wheelsWashingPoints.length; i++) {
            if (
              !info.wheelsWashingPoints[i].manufacturer ||
              !info.wheelsWashingPoints[i].brand
            ) {
              return false;
            }
          }
        }
      } else {
        if (!info.noWheelsWashingPointReason) {
          return false;
        }
      }

      if (info.hasVideoEquipment) {
        if (!info.videoEquipment || !info.videoEquipment.count) {
          return false;
        }
      } else {
        if (!info.noVideoEquipmentReason) {
          return false;
        }
      }

      if (info.hasLocalTreatmentFacilities) {
        if (
          !info.localTreatmentFacilitiesCount &&
          info.localTreatmentFacilitiesCount !== 0
        ) {
          return false;
        }
        if (
          info.localTreatmentFacilities &&
          info.localTreatmentFacilities.length
        ) {
          for (let i = 0; i < info.localTreatmentFacilities.length; i++) {
            if (
              !info.localTreatmentFacilities[i].capacity ||
              !info.localTreatmentFacilities[i].type
            ) {
              return false;
            }
          }
        }
      } else {
        if (!info.noLocalTreatmentFacilitiesReason) {
          return false;
        }
      }

      if (info.hasRadiationControl) {
        if (!info.radiationControlCount && info.radiationControlCount !== 0) {
          return false;
        }
        if (info.radiationControls && info.radiationControls.length) {
          for (let i = 0; i < info.radiationControls.length; i++) {
            if (
              !info.radiationControls[i].manufacturer ||
              !info.radiationControls[i].brand
            ) {
              return false;
            }
          }
        }
      } else {
        if (!info.noRadiationControlReason) {
          return false;
        }
      }

      if (info.hasRoads) {
        if (!info.road.type || !info.road.length) {
          return false;
        }
      } else {
        if (!info.noRoadsReason) {
          return false;
        }
      }

      if (info.hasFences) {
        if (
          info.fence &&
          info.fence.type &&
          info.fence.type.value === 'Иное' &&
          !info.fence.otherType
        ) {
          return false;
        }
        if (!info.fence || !info.fence.type) {
          return false;
        }
      } else {
        if (!info.noFencesReason) {
          return false;
        }
      }

      if (info.hasLights) {
        if (
          info.light &&
          info.light.type &&
          info.light.type.value === 'Иное' &&
          !info.light.otherType
        ) {
          return false;
        }
        if (!info.light || !info.light.type) {
          return false;
        }
      } else {
        if (!info.noLightsReason) {
          return false;
        }
      }

      if (info.hasSecurity) {
        if (
          info.security &&
          info.security.type &&
          info.security.type.value === 'Иное' &&
          !info.security.otherType
        ) {
          return false;
        }
        if (!info.security || !info.security.type || !info.security.count) {
          return false;
        }
      } else {
        if (!info.noSecurityReason) {
          return false;
        }
      }

      if (info.hasAsu) {
        if (!info.asu || !info.asu.purpose || !info.asu.functions) {
          return false;
        }
      } else {
        if (!info.noAsuReason) {
          return false;
        }
      }

      if (info.hasEnvironmentMonitoringSystem) {
        if (
          !info.environmentMonitoringSystemCount &&
          info.environmentMonitoringSystemCount !== 0
        ) {
          return false;
        }
        if (
          info.environmentMonitoringSystems &&
          info.environmentMonitoringSystems.length
        ) {
          for (let i = 0; i < info.environmentMonitoringSystems.length; i++) {
            if (!info.environmentMonitoringSystems[i].type) {
              return false;
            }
          }
        }
      } else {
        if (!info.noEnvironmentMonitoringSystemReason) {
          return false;
        }
      }

      return true;
    },

    isEquipmentValid: function() {
      if (
        !this.typeIn([
          this.RECYCLING_ID,
          this.UTILIZATION_ID,
          this.NEUTRALIZATION_ID
        ])
      ) {
        // Блок отключен
        return true;
      }

      if (!this.typeIn([this.UTILIZATION_ID, this.NEUTRALIZATION_ID])) {
        if (!this.request.equipmentCount && this.request.equipmentCount !== 0) {
          return false;
        }
      }

      const equipment = this.request.equipment;
      if (!equipment) {
        return false;
      }

      if (equipment.length === 0) {
        return true;
      }

      for (let i = 0; i < equipment.length; i++) {
        const e = equipment[i];
        if (
          (!e.manufacturer ||
            !e.brand ||
            !e.projectPower ||
            !e.processDescription ||
            !e.production) &&
          (this.typeIn(this.UTILIZATION_ID) ||
            this.typeIn(this.NEUTRALIZATION_ID))
        ) {
          return false;
        }

        if ((!e.manufacturer || !e.brand) && this.typeIn(this.RECYCLING_ID)) {
          return false;
        }

        if (this.typeIn([this.RECYCLING_ID])) {
          if (!e.count && e.count !== 0) {
            return false;
          }
          if (!e.speed && e.speed !== 0) {
            return false;
          }
          if (!e.loadingMechanism) {
            return false;
          }
          if (!e.length && e.length !== 0) {
            return false;
          }
          if (!e.width && e.width !== 0) {
            return false;
          }
        }

        if (e.type && e.type.value === 'Иное' && !e.otherType) {
          return false;
        }
      }

      return true;
    },

    isSecondaryResourcesValid: function() {
      if (!this.typeIs(this.RECYCLING_ID)) {
        // Блок отключен
        return true;
      }

      const resources = this.request.secondaryResources;
      if (
        !resources ||
        (!resources.extractPercent && resources.extractPercent !== 0) ||
        this.notSpecifiedSecondaryResourcesPercent < 0
      ) {
        return false;
      }

      if (resources.types && resources.types.length) {
        for (let i = 0; i < resources.types.length; i++) {
          const type = resources.types[i];
          if (!type.reference || (!type.percent && type.percent !== 0)) {
            return false;
          }
          if (
            type.reference &&
            type.reference.value === 'Иное' &&
            !type.otherSecondaryResourceTypeName
          ) {
            return false;
          }
          if (!this.isSecondaryMaterialReferenceUnique(type)) {
            return false;
          }
        }
      }
      return true;
    },

    isProductsInfoValid: function() {
      if (!this.typeIn([this.UTILIZATION_ID, this.NEUTRALIZATION_ID])) {
        // Блок отключен
        return true;
      }

      const info = this.request.productsInfo;
      if (!info || !info.products || !info.providedServices) {
        return false;
      }

      if (!info.totalCountPerYear && info.totalCountPerYear !== 0) {
        return false;
      }

      if (info.products.length) {
        for (let i = 0; i < info.products.length; i++) {
          const product = info.products[i];
          if (!product.name || (!product.volume && product.volume !== 0)) {
            return false;
          }
        }
      }

      if (info.providedServices.length) {
        for (let i = 0; i < info.providedServices.length; i++) {
          const service = info.providedServices[i];
          if (!service.name || !service.volume) {
            return false;
          }
        }
      }

      return true;
    },

    isRegionalOperatorValid: function() {
      const operator = this.request.roInfo;

      if (!operator) {
        return false;
      }

      return operator.name && operator.inn && operator.zoneName;
    },

    isTechnicalSurveyValid: function() {
      const technicalSurvey = this.request.technicalSurvey;
      if (
        !technicalSurvey ||
        !technicalSurvey.startDate ||
        !technicalSurvey.endDate
      ) {
        return false;
      }
      return true;
    }
  },

  mounted() {
    store.dispatch('validationReset');

    this.RECYCLING_TYPES = [this.TYPE_SORTING];
    this.UTILIZATION_TYPES = [
      this.TYPE_UTILIZATION,
      this.TYPE_UTILIZATION_ENERGY,
      this.TYPE_INCINERATOR
    ];
    this.NEUTRALIZATION_TYPES = [this.TYPE_NEUTRALIZATION];
    this.PLACING_TYPES = [
      this.TYPE_POLYGON_GRORO,
      this.TYPE_POLYGON_TEMP,
      this.TYPE_NOT_USED
    ];

    this.waitForDictionariesLoaded();

    if (this.requestId) {
      //this.$set(this.request, 'id', this.requestId);
      this.loading = true;
      $InfrastructureObjectService
        .loadInfrastructureObject(this.requestId)
        .then(
          response => {
            this.loading = false;
            this.fillFromLoadedRequest(response.data);
          },
          error => {
            this.loading = false;
            $DialogService.showErrorObj(error);
          }
        );
    }

    // Сохранение черновика каждые n секунд
    this.draftIntervalId = window.setInterval(() => {
      if (this.isSaveDraftAvailable && this.saving && this.tab !== 'history') {
        this.submitDraft();
      }
    }, this.draftPeriod);

    // Отлавливаем скролл
    window.addEventListener('scroll', this.handleScroll);

    $InfrastructureObjectService.getTechnicalSurveyStatuses().then(
      responce => {
        this.technicalSurveyStatuses = responce.data;
      },
      error => {
        $DialogService.showError(
          'Ошибка при загрузке статусов технического обследования'
        );
      }
    );

    const params = this.$route.params;
    if (params.data) {
      Object.entries(params.data).forEach(obj => {
        if (obj[0] && obj[1]) {
          switch (obj[0]) {
            case 'id':
              this.$set(this.request, 'federalSchemeId', obj[1]);
              break;
            case 'sourceId':
              this.$set(this.request, 'federalSourceId', obj[1]);
              break;
            case 'address':
              this.$set(this.request, 'addressDescription', obj[1]);
              break;
            case 'companyINN':
              this.$set(this.request.operator, 'inn', obj[1]);
              break;
            case 'companyKPP':
              this.$set(this.request.operator, 'kpp', obj[1]);
              break;
            case 'power':
              this.$set(this.request.indicator, 'productionCapacity', obj[1]);
              break;
            case 'cadastralNumber':
              this.$set(this.request.borderLandPlots[0], 'hasLandPlotForProjectRealization', true);
              this.$set(this.request.borderLandPlots[0], obj[0], obj[1]);
              break;
            case 'numberGRORO':
              this.$set(this.request.acceptanceDocumentation, 'isInRegistry', true);
              this.$set(this.request.acceptanceDocumentation, 'groro', obj[1]);
              break;
            default:
              this.$set(this.request, obj[0], obj[1]);
          }
        }
      });
    }

    setTimeout(() => {
      if (store.state.referenceStore && store.state.referenceStore.referencesLoaded) {
        const regions = store.state.referenceStore.references.get('REGION');
        if (Array.isArray(regions) && this.oidcUser.region_id) {
          const region = regions.find(obj => obj.regionId + '' === this.oidcUser.region_id + '');
          if (region) {
            const federalDistricts = store.state.referenceStore.references.get('FEDERAL_DISTRICT');
            if (Array.isArray(federalDistricts)) {
              const federalDistrict = federalDistricts.find(obj => obj.id === region.parent.id);
              if (federalDistrict) {
                this.federalDistricts = [federalDistrict];
                this.regions = [region];
                if (!this.request.subjectName || !this.request.dataSource.subjectName) {
                  this.request.federalDistrictName = federalDistrict;
                  this.request.subjectName = region;
                  this.request.dataSource.subjectName = region;
                }
              }
            }
          }
        }
      }
    }, 500);
  },

  created() {
    this.fillRequest(this.request);
  },

  destroyed() {
    window.clearInterval(this.draftIntervalId);
    window.removeEventListener('scroll', this.handleScroll);
  },

  watch: {
    'request.exploitationStartDate': function() {
      this.calculateExploitationPeriod();
    },

    'request.exploitationEndDate': function() {
      this.calculateExploitationPeriod();
    },

    'request.secondaryResources.extractPercent': function() {
      if (this.request.secondaryResources.extractPercent > 100) {
        this.$nextTick(() => {
          this.$set(this.request.secondaryResources, 'extractPercent', 100);
        });
      }
    },

    'request.cost.equipment': function() {
      this.calculateTotalCost();
    },
    'request.cost.russianEquipment': function() {
      this.calculateTotalCost();
    },
    'request.cost.installation': function() {
      this.calculateTotalCost();
    },
    'request.cost.russianInstallation': function() {
      this.calculateTotalCost();
    },

    'request.indicator.productionCapacity': function() {
      this.calculateFreeCapacity();
    },
    'request.indicator.previousYearTkoWeight': function() {
      this.calculateFreeCapacity();
    },

    'request.type': function() {
      if (this.request.type && store.state.referenceStore.referencesLoaded) {
        this.$nextTick(() => {
          if (this.request.type.id === this.RECYCLING_ID) {
            this.objectTypes = store.state.referenceStore.references
              .get('TKO_OBJECT_TYPE')
              .filter(element => this.RECYCLING_TYPES.includes(element.id));
            this.wasteManagementTypes = store.state.referenceStore.references
              .get('WASTE_MANAGEMENT_TYPE')
              .filter(element => element.id === this.ACTION_RECYCLING_ID);
          } else if (this.request.type.id === this.UTILIZATION_ID) {
            this.objectTypes = store.state.referenceStore.references
              .get('TKO_OBJECT_TYPE')
              .filter(element => this.UTILIZATION_TYPES.includes(element.id));
            this.wasteManagementTypes = store.state.referenceStore.references
              .get('WASTE_MANAGEMENT_TYPE')
              .filter(element => element.id === this.ACTION_UTILIZATION_ID);
          } else if (this.request.type.id === this.NEUTRALIZATION_ID) {
            this.objectTypes = store.state.referenceStore.references
              .get('TKO_OBJECT_TYPE')
              .filter(element =>
                this.NEUTRALIZATION_TYPES.includes(element.id)
              );
            this.wasteManagementTypes = store.state.referenceStore.references
              .get('WASTE_MANAGEMENT_TYPE')
              .filter(element => element.id === this.ACTION_NEUTRALIZATION_ID);
          } else if (this.request.type.id === this.PLACING_ID) {
            this.objectTypes = store.state.referenceStore.references
              .get('TKO_OBJECT_TYPE')
              .filter(element => this.PLACING_TYPES.includes(element.id));
            this.wasteManagementTypes = store.state.referenceStore.references
              .get('WASTE_MANAGEMENT_TYPE')
              .filter(element => element.id === this.ACTION_PLACING_ID);
          } else {
            this.objectTypes = store.state.referenceStore.references.get(
              'TKO_OBJECT_TYPE'
            );
            this.wasteManagementTypes = store.state.referenceStore.references.get(
              'WASTE_MANAGEMENT_TYPE'
            );
          }

          if (this.objectTypes.length === 1) {
            this.$set(this.request, 'tkoObjectType', this.objectTypes[0]);
          }

          if (this.wasteManagementTypes.length === 1) {
            this.$set(
              this.request,
              'wasteManagementType',
              this.wasteManagementTypes[0]
            );
          }
        });
      }
    },

    showPointModal(value) {
      if (value) {
        this.saving = false;
      } else {
        this.saving = true;
      }
    },
    showEquipmentModal(value) {
      if (value) {
        this.saving = false;
      } else {
        this.saving = true;
      }
    },
    showConfirmationModal(value) {
      if (value) {
        this.saving = false;
      } else {
        this.saving = true;
      }
    },
    requestImportModal(value) {
      if (value) {
        this.saving = false;
      } else {
        this.saving = true;
      }
    }
  },

  methods: {
    equipmentReferenceType: function(equipment) {
      let target = this.tempEquipment;
      if (equipment) {
        target = equipment;
      }
      if (target && target.kind && target.kind.value) {
        if (this.typeIn([this.UTILIZATION_ID, this.NEUTRALIZATION_ID])) {
          switch (target.kind.id) {
            // основное
            case '309a641b-6aca-415a-bac9-d79ace1ed381':
              return 'CORE_EQUIPMENT_TYPE';
            // вспомогательное
            case 'd0c65af6-3a2b-4c82-b493-618b6be1e360':
              return 'AUXILIARY_EQUIPMENT_TYPE';
          }
        }
        switch (target.kind.value) {
          case 'Конвейеры':
            return 'CONVEYOR';
          case 'Сепараторы':
            return 'SEPARATOR';
          case 'Прессы':
            return 'PRESS';
          case 'Дополнительное оборудование':
            return 'ADDITIONAL_EQUIPMENT';
        }
      }
      return '';
    },

    isOtherSelected(field) {
      return field && field.value === 'Иное';
    },

    calculateExploitationPeriod() {
      if (
        this.request.exploitationStartDate &&
        this.request.exploitationEndDate
      ) {
        const differenceInMillis =
          this.request.exploitationEndDate - this.request.exploitationStartDate;
        if (differenceInMillis > 0) {
          const yearsDiff =
            new Date(differenceInMillis).getUTCFullYear() - 1970;
          this.$set(this.request, 'exploitationPeriod', yearsDiff);
          return;
        }
      }
      this.$set(this.request, 'exploitationPeriod', 0);
    },

    calculateTotalCost() {
      const cost = this.request.cost;
      this.request.cost.total =
        Number(cost.equipment) +
        Number(cost.russianEquipment) +
        Number(cost.installation) +
        Number(cost.russianInstallation);
    },

    calculateFreeCapacity() {
      if (
        this.request.indicator &&
        this.request.indicator.productionCapacity &&
        this.request.indicator.previousYearTkoWeight
      ) {
        this.request.indicator.freeCapacity = (
          this.request.indicator.productionCapacity -
          this.request.indicator.previousYearTkoWeight
        ).toFixed(
          this.numberOfDecimalSigns(
            this.request.indicator.productionCapacity.toString()
          ) >
            this.numberOfDecimalSigns(
              this.request.indicator.previousYearTkoWeight.toString()
            )
            ? this.numberOfDecimalSigns(
                this.request.indicator.productionCapacity.toString()
              )
            : this.numberOfDecimalSigns(
                this.request.indicator.previousYearTkoWeight.toString()
              )
        );
      }
    },

    numberOfDecimalSigns(decimalNumber) {
      let commaIndex =
        decimalNumber.indexOf('.') !== -1
          ? decimalNumber.indexOf('.')
          : decimalNumber.indexOf(',');
      if (commaIndex === -1) {
        return 0;
      }
      return decimalNumber.length - commaIndex - 1;
    },

    setTab(tab) {
      this.tab = tab;
    },

    isSecondaryMaterialReferenceUnique(type) {
      let count = 0;
      if (
        this.request.secondaryResources &&
        this.request.secondaryResources.types &&
        type &&
        type.reference
      ) {
        for (let i = 0; i < this.request.secondaryResources.types.length; i++) {
          if (
            this.request.secondaryResources.types[i].reference ===
            type.reference
          ) {
            count++;
          }
        }
      }
      if (count > 1) {
        return false;
      }
      return true;
    },

    isSecondaryMaterialPercentValid(type) {
      if (this.notSpecifiedSecondaryResourcesPercent < 0 && type.percent) {
        return false;
      }
      return true;
    },

    fillRequestWithRoFromApi(roInfo) {
      if (!roInfo) {
        return;
      }

      if (roInfo.id) {
        this.$set(this.request.roInfo, 'roId', roInfo.id);
      }

      if (roInfo.name) {
        this.$set(this.request.roInfo, 'name', roInfo.name);
      }

      if (roInfo.zones && roInfo.zones.length) {
        this.roZones = roInfo.zones.map(zone => zone.name);

        if (this.roZones.length === 1) {
          this.request.roInfo.zoneName = this.roZones[0];
        }
      }
    },

    clearRoInfo() {
      this.$set(this, 'roZones', null);
      this.$set(this.request.roInfo, 'roId', null);
    },

    /**
     * Наполнение формы из пришедших данных
     *
     * @param responceData
     */
    fillFromLoadedRequest(responceData) {
      let loadedRequest = responceData;
      this.fillRequest(loadedRequest);
      this.request = loadedRequest;
      this.updateFormFromFiasAddress();

      $ReferenceService.getUpdateSource()
        .then(data => {
          if (data.data) {
            this.request.updateSource = data.data.find(item => item.name === 'ARM');
          }
        })
        .catch(error => {
          $DialogService.showError(error.message);
        });
    },

    /**
     * Заполнение всех внутренних полей объекта пустыми значениями
     * (там где это требуется)
     *
     * @param request
     */
    fillRequest(request) {
      if (!request.dataSource) {
        this.$set(request, 'dataSource', {});
      }
      if (!request.operator) {
        this.$set(request, 'operator', {});
      }
      if (!request.investments || request.investments.length < 1) {
        this.$set(request, 'investments', []);
      }
      if (!request.cost) {
        this.$set(request, 'cost', {});
      }
      if (!request.currentLandPlots || request.currentLandPlots.length < 1) {
        this.$set(request, 'currentLandPlots', []);
      }
      if (!request.acceptanceDocumentation) {
        this.$set(request, 'acceptanceDocumentation', {});
      }
      if (!request.workSchedule) {
        this.$set(request, 'workSchedule', {});
      }

      if (!request.tariffInfo) {
        this.$set(request, 'tariffInfo', {});
      }
      if (!request.tariffInfo.tariffs) {
        this.$set(request.tariffInfo, 'tariffs', []);
      }
      /*
                if (!request.tariffInfo.operatorTariffs) {
                    this.$set(request.tariffInfo, 'operatorTariffs', []);
                }
                */

      if (!request.indicator) {
        this.$set(request, 'indicator', {});
      }
      if (!request.indicator.maps) {
        this.$set(request.indicator, 'maps', []);
      }

      if (!request.infrastructureObjectInfo) {
        this.$set(request, 'infrastructureObjectInfo', {});
      }
      if (!request.infrastructureObjectInfo.videoEquipment) {
        this.$set(request.infrastructureObjectInfo, 'videoEquipment', {});
      }
      if (!request.infrastructureObjectInfo.road) {
        this.$set(request.infrastructureObjectInfo, 'road', {});
      }
      if (!request.infrastructureObjectInfo.fence) {
        this.$set(request.infrastructureObjectInfo, 'fence', {});
      }
      if (!request.infrastructureObjectInfo.light) {
        this.$set(request.infrastructureObjectInfo, 'light', {});
      }
      if (!request.infrastructureObjectInfo.security) {
        this.$set(request.infrastructureObjectInfo, 'security', {});
      }
      if (!request.infrastructureObjectInfo.asu) {
        this.$set(request.infrastructureObjectInfo, 'asu', {});
      }

      if (!request.infrastructureObjectInfo.weightControls) {
        this.$set(request.infrastructureObjectInfo, 'weightControls', []);
      }
      if (!request.infrastructureObjectInfo.wheelsWashingPoints) {
        this.$set(request.infrastructureObjectInfo, 'wheelsWashingPoints', []);
      }
      if (!request.infrastructureObjectInfo.localTreatmentFacilities) {
        this.$set(
          request.infrastructureObjectInfo,
          'localTreatmentFacilities',
          []
        );
      }
      if (!request.infrastructureObjectInfo.radiationControls) {
        this.$set(request.infrastructureObjectInfo, 'radiationControls', []);
      }
      if (!request.infrastructureObjectInfo.environmentMonitoringSystems) {
        this.$set(
          request.infrastructureObjectInfo,
          'environmentMonitoringSystems',
          []
        );
      }

      if (!request.secondaryResources) {
        this.$set(request, 'secondaryResources', { types: [] });
      }
      if (request.secondaryResources && !request.secondaryResources.types) {
        this.$set(request.secondaryResources, 'types', []);
      }
      if (!request.roInfo) {
        this.$set(request, 'roInfo', {});
      }
      if (!request.fiasAddress) {
        this.$set(request, 'fiasAddress', {});
      }
      if (!request.borderLandPlots || request.borderLandPlots.length < 1) {
        this.$set(request, 'borderLandPlots', [{}]);
      }
      if (!request.verificationStatusInfo) {
        this.$set(request, 'verificationStatusInfo', {});
      }
      if (!request.wasteCategoryInfos) {
        this.$set(request, 'wasteCategoryInfos', []);
      }
      if (!request.equipment) {
        this.$set(request, 'equipment', []);
      }

      if (!request.wasteInfo) {
        this.$set(request, 'wasteInfo', {});
      }
      if (!request.wasteInfo.wasteTypes) {
        this.$set(request.wasteInfo, 'wasteTypes', []);
      }
      if (!request.wasteInfo.wasteDirections) {
        this.$set(request.wasteInfo, 'wasteDirections', []);
      }

      if (!request.verifiedFields) {
        this.$set(request, 'verifiedFields', []);
      }

      if (!request.productsInfo) {
        this.$set(request, 'productsInfo', {});
      }

      if (request.productsInfo && !request.productsInfo.products) {
        this.$set(request.productsInfo, 'products', []);
      }

      if (request.productsInfo && !request.productsInfo.providedServices) {
        this.$set(request.productsInfo, 'providedServices', []);
      }

      if (request.otherObjectStatusName) {
        this.$set(request, 'status', { value: 'Иное' });
      }

      if (request.secondaryResources && request.secondaryResources.types) {
        request.secondaryResources.types.forEach(type => {
          if (type.otherSecondaryResourceTypeName) {
            type.reference = { value: 'Иное' };
          }
        });
      }

      if (request.equipment) {
        request.equipment.forEach(equipment => {
          if (equipment.otherType) {
            equipment.type = { value: 'Иное' };
          }
        });
      }

      if (
        request.infrastructureObjectInfo &&
        request.infrastructureObjectInfo.fence &&
        request.infrastructureObjectInfo.fence.otherType
      ) {
        request.infrastructureObjectInfo.fence.type = { value: 'Иное' };
      }

      if (
        request.infrastructureObjectInfo &&
        request.infrastructureObjectInfo.light &&
        request.infrastructureObjectInfo.light.otherType
      ) {
        request.infrastructureObjectInfo.light.type = { value: 'Иное' };
      }

      if (
        request.infrastructureObjectInfo &&
        request.infrastructureObjectInfo.security &&
        request.infrastructureObjectInfo.security.otherType
      ) {
        request.infrastructureObjectInfo.security.type = { value: 'Иное' };
      }

      if (request.indicator && request.indicator.otherWaterproofingType) {
        request.indicator.waterproofingType = { value: 'Иное' };
      }

      if (request.technicalSurvey && request.technicalSurvey.otherResult) {
        request.technicalSurvey.result = { value: 'Иное' };
      }
    },

    prepareRequest() {
      Object.keys(this.wasteCategoriesInfo).forEach(field => {
        const categoryCountValue = this.wasteCategoriesInfo[field];
        if (categoryCountValue) {
          this.wasteCategories.forEach(categoryReference => {
            // eslint-disable-next-line eqeqeq
            if (categoryReference.id == field) {
              this.request.wasteCategoryInfos.push({
                count: categoryCountValue,
                wasteCategory: categoryReference
              });
            }
          });
        }
      });

      const preparedRequest = JSON.parse(JSON.stringify(this.request));

      Object.keys(preparedRequest).forEach(field => {
        const value = preparedRequest[field];
        if (
          value &&
          (typeof value === 'object' || typeof value === 'function')
        ) {
          if (!Object.keys(value).length) {
            preparedRequest[field] = null;
          }
        }
      });
      this.clearOtherReferences(preparedRequest);

      return preparedRequest;
    },

    clearOtherReferences(request) {
      if (request.status && request.status.value === 'Иное') {
        request.status = null;
      } else {
        request.otherObjectStatusName = null;
      }
      if (request.secondaryResources.types) {
        request.secondaryResources.types.forEach(type => {
          if (type.reference && type.reference.value === 'Иное') {
            type.reference = null;
          } else {
            type.otherSecondaryResourceTypeName = null;
          }
        });
      }
      if (request.equipment) {
        request.equipment.forEach(equipment => {
          if (equipment.type && equipment.type.value === 'Иное') {
            equipment.type = null;
          } else {
            equipment.otherType = null;
          }
        });
      }

      if (
        request.infrastructureObjectInfo &&
        request.infrastructureObjectInfo.fence &&
        request.infrastructureObjectInfo.fence.type
      ) {
        if (request.infrastructureObjectInfo.fence.type.value === 'Иное') {
          request.infrastructureObjectInfo.fence.type = null;
        } else {
          request.infrastructureObjectInfo.fence.otherType = null;
        }
      }

      if (
        request.infrastructureObjectInfo &&
        request.infrastructureObjectInfo.light &&
        request.infrastructureObjectInfo.light.type
      ) {
        if (request.infrastructureObjectInfo.light.type.value === 'Иное') {
          request.infrastructureObjectInfo.light.type = null;
        } else {
          request.infrastructureObjectInfo.light.otherType = null;
        }
      }

      if (
        request.infrastructureObjectInfo &&
        request.infrastructureObjectInfo.security &&
        request.infrastructureObjectInfo.security.type
      ) {
        if (request.infrastructureObjectInfo.security.type.value === 'Иное') {
          request.infrastructureObjectInfo.security.type = null;
        } else {
          request.infrastructureObjectInfo.security.otherType = null;
        }
      }

      if (request.indicator && request.indicator.waterproofingType) {
        if (request.indicator.waterproofingType.value === 'Иное') {
          request.indicator.waterproofingType = null;
        } else {
          request.indicator.otherWaterproofingType = null;
        }
      }

      if (request.technicalSurvey && request.technicalSurvey.result) {
        if (request.technicalSurvey.result.value === 'Иное') {
          request.technicalSurvey.result = null;
        } else {
          request.technicalSurvey.otherResult = null;
        }
      }
    },

    validateRequest(request) {
      this.navigatedToError = false;
      /*
                return this.isDatasourceValid &&
                    this.isVerificationStatusValid &&
                    this.isGeneralInfoValid &&
                    this.isOperatorValid &&
                    this.isBorderLandPlotValid &&
                    this.isCurrentLandPlotCoordinatesValid &&
                    this.isInvestmentsValid &&
                    this.isCostValid &&
                    this.isAcceptanceDocumentationValid &&
                    this.isScheduleValid &&
                    this.isTariffValid &&
                    this.isIndicatorValid &&
                    this.isWasteTypesValid &&
                    this.isInfrastructureObjectInfoValid &&
                    this.isEquipmentValid &&
                    this.isSecondaryResourcesValid &&
                    this.isRegionalOperatorValid;
                */

      // Валидация по элементам сайдбара (все условия там есть)
      return this.validateElements(this.sidebarElements);
    },

    validateElements(elements) {
      let validatedCount = 0;
      for (let element of elements) {
        let checked = !element.hideFun() ? element.checkedFun() : true;
        let subitemsChecked = element.subItems
          ? this.validateElements(element.subItems)
          : true;
        if (checked && subitemsChecked) {
          validatedCount++;
        } else if (!this.navigatedToError) {
          // Автоматическая навигация на первое незаполненное поле
          this.navigatedToError = true;
          this.navigateTo(element);
        }
      }

      return validatedCount === elements.length;
    },

    /**
     * Кнопки
     *
     * modes:
     *  SendToTechSurvey
     *  SendToModeration
     *  SetVerified
     *  TechnicalSurveyRequested
     */
    submit(mode, checkAdmin, validate) {
      let method;

      switch (mode) {
        case 'SendToTechSurvey':
          method = $InfrastructureObjectService.startTechnicalSurvey;
          break;
        case 'SendToModeration':
          method = $InfrastructureObjectService.sendToModeration;
          break;
        case 'SetVerified':
          method = $InfrastructureObjectService.setVerified;
          break;
        case 'TechnicalSurveyRequested':
          method = $InfrastructureObjectService.requestTechnicalSurvey;
          break;
        case 'RequestAudit':
          method = $InfrastructureObjectService.requestAudit;
          break;
        case 'Archive':
          method = $InfrastructureObjectService.archive;
          break;
        case 'Reject':
          method = $InfrastructureObjectService.reject;
          break;
      }

      if (checkAdmin && !this.isAdmin) {
        $DialogService.showError(
          'У вас недостаточно прав для выполнения этой операции'
        );
        return;
      }

      this.submitDraft().then(() => {
        this.submitInner(validate, false).then(saved => {
          if (saved) {
            this.loading = true;
            method(this.requestId, this.statusChangingReason).then(
              response => {
                this.loading = false;
                this.fillFromLoadedRequest(response.data);
                $DialogService.showSuccess('Отправлено');
                this.updateId();
              },
              error => {
                this.loading = false;
                $DialogService.showErrorObj(error);
              }
            );
          }
        });
      });
    },

    deleteDraft() {
      $InfrastructureObjectService
        .deleteInfrastructureObject(this.request.id)
        .then(() => {
          this.$router.push('/requests');
        });
    },

    async submitDraft() {
      try {
        const saved = await this.submitInner(false, true);

        if (saved) {
          $DialogService.showInfo('Черновик сохранен');
          this.updateId();
          return true;
        }
      } catch (error) {
        $DialogService.showError('Не сохранено из-за ошибок');
      }

      return false;
    },

    submitInner(validate, fill) {
      return new Promise((resolve, reject) => {
        const preparedRequest = this.prepareRequest();

        if (validate) {
          store.dispatch('validationEnabled');

          if (!this.validateRequest(preparedRequest)) {
            $DialogService.showError('Заполнены не все обязательные поля!');
            return;
          }
        }

        this.loading = true;
        if (!this.requestId) {
          $InfrastructureObjectService
            .createInfrastructureObject(preparedRequest)
            .then(
              response => {
                this.loading = false;
                if (fill) {
                  this.fillFromLoadedRequest(response.data);
                }
                resolve(true);
              },
              error => {
                this.loading = false;
                $DialogService.showErrorObj(error);
                reject(error);
              }
            );
        } else {
          $InfrastructureObjectService
            .updateInfrastructureObject(this.requestId, preparedRequest)
            .then(
              response => {
                this.loading = false;
                if (fill) {
                  this.fillFromLoadedRequest(response.data);
                }
                resolve(true);
              },
              error => {
                this.loading = false;
                $DialogService.showErrorObj(error);
                reject(error);
              }
            );
        }
      });
    },

    updateId() {
      if (!this.requestId) {
        this.$router.push('request?requestId=' + this.request.id);
      }
    },

    createSidebarElement(id, title, checkedFun, subItems, hideFun) {
      return {
        id: id,
        title: title,
        checkedFun: checkedFun,
        subItems: subItems,
        hideFun: hideFun !== undefined ? hideFun : () => false,
        opened: false
      };
    },

    toggleSidebarElement(elem) {
      this.$nextTick(() => {
        elem.opened = !elem.opened;
      });
    },

    navigateTo(elem) {
      if (elem.id === 'blockTechnicalSurvey') {
        this.tab = 'survey';
      } else {
        this.tab = 'request';
      }

      this.$nextTick(() => {
        let block = document.getElementById(elem.id);
        if (block) {
          window.scrollTo({
            top: block.offsetTop - this.sidebarElementsOffset - 88,
            left: 0,
            behavior: 'smooth'
          });
        } else {
          $DialogService.showError('Блок "' + elem.title + '" не найден!');
        }
      });
    },

    handleScroll(event) {
      this.sidebarElementsMinOffset = undefined;
      this.fillCurrentSidebarElement(this.sidebarElements);
    },

    fillCurrentSidebarElement(elements) {
      let filled = false;

      for (let elem of elements) {
        if (elem.subItems) {
          if (this.fillCurrentSidebarElement(elem.subItems)) {
            this.currentSidebarElementId = elem.id;
          }
        }

        let block = document.getElementById(elem.id);
        if (block) {
          let offset =
            block.offsetTop - this.sidebarElementsOffset - 99 - window.scrollY;
          if (offset < 0) {
            if (
              !this.sidebarElementsMinOffset ||
              offset > this.sidebarElementsMinOffset
            ) {
              this.sidebarElementsMinOffset = offset;
              this.currentSidebarElementId = elem.id;
              filled = true;
            }
          }
        }
      }

      return filled;
    },

    editPoint(currentLandPlot, point) {
      this.showPointModal = !this.showPointModal;
      this.tempCurrentLandPlot = currentLandPlot;
      this.tempPoint = point ? $ObjectUtils.copyObject(point) : {};
      this.isNewPoint = false;
    },

    openPoint(currentLandPlot, point) {
      this.showPointModal = !this.showPointModal;
      this.tempCurrentLandPlot = currentLandPlot;
      this.tempPoint = point ? $ObjectUtils.copyObject(point) : {};
    },

    addPoint(currentLandPlot, point) {
      this.isPointRequestButtonPressed = true;
      if (point && point.number && point.x && point.y && point.description) {
        if (!this.isNewPoint) {
          for (let i = 0; i < currentLandPlot.points.length; i++) {
            let tempPoint = currentLandPlot.points[i];
            if (tempPoint.id === point.id) {
              currentLandPlot.points[i] = point;
            }
          }
        } else {
          this.$nextTick(() => {
            currentLandPlot.points.push(point);
          });
        }
        this.isNewPoint = true;
        this.showPointModal = false;
      } else {
        $DialogService.showError('Заполнены не все обязательные поля!');
      }
    },

    deletePoint(currentLandPlot, point, imported = false) {
      let fpIndex = -1;
      let fipIndex = -1;

      if (imported) {
        fpIndex = currentLandPlot.points.findIndex(
          p => p.number === point.imported.number && p.x === point.imported.x && p.y === point.imported.y
        );
        fipIndex = currentLandPlot.importedPoints.findIndex(
          p => p.number === point.imported.number && p.x === point.imported.x && p.y === point.imported.y
        );
      } else {
        fpIndex = currentLandPlot.points.findIndex(
          p => p.number === point.number && p.x === point.x && p.y === point.y
        );
        fipIndex = currentLandPlot.importedPoints.findIndex(
          p => p.number === point.number && p.x === point.x && p.y === point.y
        );
      }

      if (fpIndex !== -1) {
        currentLandPlot.points.splice(fpIndex, 1);
      }
      if (fipIndex !== -1) {
        currentLandPlot.importedPoints.splice(fipIndex, 1);
      }
    },

    addService() {
      this.request.productsInfo.providedServices.push({});
    },

    removeService(service) {
      this.request.productsInfo.providedServices = this.request.productsInfo.providedServices.filter(
        s => s !== service
      );
    },

    addProduct() {
      this.request.productsInfo.products.push({});
    },

    removeProduct(product) {
      this.request.productsInfo.products = this.request.productsInfo.products.filter(
        p => p !== product
      );
    },

    addSecondaryResource() {
      this.request.secondaryResources.types.push({});
    },

    removeSecondaryResource(resource) {
      this.request.secondaryResources.types = this.request.secondaryResources.types.filter(
        r => r !== resource
      );
    },

    openEquipment(equipment) {
      this.showEquipmentModal = !this.showEquipmentModal;
      this.tempEquipment = equipment ? $ObjectUtils.copyObject(equipment) : {};
    },

    addEquipment(equipment) {
      this.isAddEquipmentButtonPressed = true;
      if (equipment && equipment.kind && equipment.type) {
        if (equipment.type.value === 'Иное' ? equipment.otherType : true) {
          equipment.created = new Date();
          this.request.equipment.push(equipment);
          this.showEquipmentModal = false;
        }
      }
    },

    deleteEquipment(equipment) {
      this.request.equipment = this.request.equipment.filter(
        e => e !== equipment
      );
    },

    fiasSearch() {
      if (this.request && this.request.addressDescription) {
        this.fiasLoading = true;
        $FiasService.findData(this.request.addressDescription).then(
          response => {
            this.fiasEntities = response.data;
            this.updateFiasIds();
            this.fiasLoading = false;
          },
          error => {
            $DialogService.showErrorObj(error);
            this.fiasLoading = false;
          }
        );
      }
    },

    fiasGeolocation() {
      if (this.request && this.request.latitude && this.request.longitude) {
        this.fiasLoading = true;
        $FiasService
          .geolocate(this.request.latitude, this.request.longitude)
          .then(
            response => {
              this.fiasEntities = response.data;
              this.updateFiasIds();
              this.fiasLoading = false;
            },
            error => {
              $DialogService.showErrorObj(error);
              this.fiasLoading = false;
            }
          );
      }
    },

    updateFormFromFiasAddress() {
      if (this.request.fiasAddress) {
        this.request.fiasId = this.request.fiasAddress.id;
        this.fiasIds.push(this.request.fiasId);
        this.request.oktmoCode = this.request.fiasAddress.oktmo;
        this.oktmoCodes.push(this.request.oktmoCode);
      }
    },

    updateFiasIds() {
      this.fiasIds = [];
      for (let i = 0; i < this.fiasEntities.length; i++) {
        this.fiasIds.push(this.fiasEntities[i].id);
      }

      if (this.fiasIds.length) {
        // Заполняю первым из списка
        this.request.fiasId = this.fiasIds[0];
        this.fiasIdChanged();
      }

      this.oktmoCodes = [];
      for (let i = 0; i < this.fiasEntities.length; i++) {
        if (!this.oktmoCodes.includes(this.fiasEntities[i].oktmo)) {
          this.oktmoCodes.push(this.fiasEntities[i].oktmo);
        }
      }
    },

    fiasIdChanged() {
      if (this.request && this.request.fiasId) {
        for (let i = 0; i < this.fiasEntities.length; i++) {
          if (this.fiasEntities[i].id === this.request.fiasId) {
            this.request.fiasAddress = this.fiasEntities[i];
            this.updateFormFromFiasAddress();
            break;
          }
        }
      }
    },

    oktmoCodeChanged() {
      if (this.request && this.request.oktmoCode) {
        for (let i = 0; i < this.fiasEntities.length; i++) {
          if (this.fiasEntities[i].oktmo === this.request.oktmoCode) {
            this.request.fiasAddress = this.fiasEntities[i];
            this.updateFormFromFiasAddress();
            break;
          }
        }
      }
    },

    updateInnOwner() {
      if (
        this.request &&
        this.request.ownerInn &&
        this.request.ownerInn.length === 10
      ) {
        this.innLoading = true;
        $FiasService.findByInn(this.request.ownerInn).then(
          response => {
            this.request.ownerName = response.data.name;
            this.innLoading = false;
          },
          error => {
            $DialogService.showErrorObj(error);
            this.innLoading = false;
          }
        );
      }
    },

    updateInnOperator() {
      if (
        this.request &&
        this.request.operator &&
        this.request.operator.inn &&
        this.request.operator.inn.length === 10
      ) {
        this.innLoadingOperator = true;
        $FiasService.findByInn(this.request.operator.inn).then(
          response => {
            this.request.operator.name = response.data.name;
            this.request.operator.kpp = response.data.kpp;
            this.request.operator.ogrn = response.data.ogrn;
            this.request.operator.phone = response.data.phone;
            this.request.operator.mobile = response.data.phone;
            this.request.operator.email = response.data.email;
            this.request.operator.legalAddress = response.data.legalAddress;
            this.request.operator.actualAddress = response.data.actualAddress;
            this.innLoadingOperator = false;
          },
          error => {
            $DialogService.showErrorObj(error);
            this.innLoadingOperator = false;
          }
        );
      }
    },

    updateInnInvestment(investment) {
      if (investment && investment.inn && investment.inn.length === 10) {
        this.innLoadingInvestment = true;
        $FiasService.findByInn(investment.inn).then(
          response => {
            investment.name = response.data.name;
            investment.kpp = response.data.kpp;
            investment.ogrn = response.data.ogrn;
            investment.phone = response.data.phone;
            investment.mobile = response.data.phone;
            investment.email = response.data.email;
            investment.legalAddress = response.data.legalAddress;
            investment.actualAddress = response.data.actualAddress;
            this.innLoadingInvestment = false;
          },
          error => {
            $DialogService.showErrorObj(error);
            this.innLoadingInvestment = false;
          }
        );
      }
    },

    updateInnProjectOrganization() {
      if (
        this.request &&
        this.request.acceptanceDocumentation &&
        this.request.acceptanceDocumentation.projectOrganizationInn &&
        this.request.acceptanceDocumentation.projectOrganizationInn.length ===
          10
      ) {
        this.innLoadingProjectOrganization = true;
        $FiasService
          .findByInn(
            this.request.acceptanceDocumentation.projectOrganizationInn
          )
          .then(
            response => {
              this.request.acceptanceDocumentation.projectOrganizationName =
                response.data.name;
              this.innLoadingProjectOrganization = false;
            },
            error => {
              $DialogService.showErrorObj(error);
              this.innLoadingProjectOrganization = false;
            }
          );
      }
    },

    updateInnMineSurveyingOrganization() {
      if (
        this.request &&
        this.request.indicator &&
        this.request.indicator.mineSurveyingOrganizationInn &&
        this.request.indicator.mineSurveyingOrganizationInn.length === 10
      ) {
        this.innLoadingMineSurveyingOrganization = true;
        $FiasService
          .findByInn(this.request.indicator.mineSurveyingOrganizationInn)
          .then(
            response => {
              this.request.indicator.mineSurveyingOrganizationName =
                response.data.name;
              this.innLoadingMineSurveyingOrganization = false;
            },
            error => {
              $DialogService.showErrorObj(error);
              this.innLoadingMineSurveyingOrganization = false;
            }
          );
      }
    },

    updateInnRo() {
      const inn = this.request.roInfo.inn;
      if (inn) {
        this.roInfoLoading = true;
        $PpkService
          .findCompany(inn)
          .then(response => {
            this.roInfoLoading = false;
            if (
              response.data &&
              response.data.items &&
              response.data.items.length === 1
            ) {
              this.roInfoLoading = true;
              $PpkService
                .findRegionalOperator(response.data.items[0].id)
                .then(roResponse => {
                  this.roInfoLoading = false;
                  if (
                    roResponse.data &&
                    roResponse.data.items &&
                    roResponse.data.items.length
                  ) {
                    this.fillRequestWithRoFromApi(roResponse.data.items[0]);
                  } else {
                    this.clearRoInfo();
                  }
                });
            } else {
              this.clearRoInfo();
            }
          })
          .catch(_ => {
            this.clearRoInfo();
            this.roInfoLoading = false;
          });
      } else {
        this.clearRoInfo();
      }
    },

    // Универсальные методы для добавления-удаления элементов списка
    addElement(fieldName, object) {
      this.request[fieldName].push(!object ? {} : object);
    },
    deleteElement(fieldName, elememt) {
      this.request[fieldName] = this.request[fieldName].filter(
        p => p !== elememt
      );
    },

    // Обьекты инфраструктуры (весы, рад. контроль и прочее)
    addUnit(list) {
      list.push({});
    },

    deleteUnit(list, unit, index) {
      //list = list.filter(p => p !== unit);
      list.splice(index, 1);
    },

    federalDistrictChanged() {
      if (this.federalDistricts.length) {
        return;
      }

      if (
        this.request.federalDistrictName &&
        this.request.federalDistrictName.id
      ) {
        this.regionsLoading = true;
        $ReferenceService
          .getReference('REGION', this.request.federalDistrictName.id)
          .then(
            response => {
              this.regions = response.data;
              this.regionsLoading = false;
            },
            error => {
              $DialogService.showErrorObj(error);
              this.regionsLoading = false;
            }
          );
      } else {
        this.regions = [];
      }
    },

    regionChanged() {
      if (this.request.subjectName && this.request.subjectName.id) {
        this.subjectAreasLoading = true;
        $ReferenceService
          .getReference('SUBJECT_AREA', this.request.subjectName.id)
          .then(
            response => {
              this.subjectAreas = response.data;
              this.subjectAreasLoading = false;
            },
            error => {
              $DialogService.showErrorObj(error);
              this.subjectAreasLoading = false;
            }
          );
      } else {
        this.subjectAreas = [];
      }
    },

    mapsCountChanged() {
      if (this.request.indicator.mapCount > 100) {
        this.request.indicator.mapCount = 100;
        $DialogService.showWarning('Максимальное количество карт - 100');
      }

      this.request.indicator.maps = [];

      for (let i = 0; i < this.request.indicator.mapCount; i++) {
        this.request.indicator.maps.push({});
      }
    },

    notBeforeConstructionStartDate(date) {
      if (this.request.constructionStartDate) {
        return (
          date <
          new Date(this.request.constructionStartDate).setHours(0, 0, 0, 0)
        );
      } else {
        return false;
      }
    },

    notBeforeExploitationStartDate(date) {
      if (this.request.exploitationStartDate) {
        return (
          date <
          new Date(this.request.exploitationStartDate).setHours(0, 0, 0, 0)
        );
      } else {
        return false;
      }
    },

    notBeforeTechnicalSurveyStartDate(date) {
      if (
        this.request.technicalSurvey &&
        this.request.technicalSurvey.startDate
      ) {
        return (
          date <
          new Date(this.request.technicalSurvey.startDate).setHours(0, 0, 0, 0)
        );
      } else {
        return false;
      }
    },

    typeIs(typeId) {
      return (
        this.request && this.request.type && this.request.type.id === typeId
      );
    },

    landCategoryIs(landCategoryId) {
      return (
        this.request.borderLandPlots[0].landCategory &&
        this.request.borderLandPlots[0].landCategory.id &&
        this.request.borderLandPlots[0].landCategory.id !== landCategoryId
      );
    },

    typeIn(typeIds) {
      return (
        this.request &&
        this.request.type &&
        typeIds.includes(this.request.type.id)
      );
    },

    statusIs(statusId) {
      return this.request.status && this.request.status.id === statusId;
    },

    statusIn(statusIds) {
      return this.request.status && statusIds.includes(this.request.status.id);
    },

    waitForDictionariesLoaded() {
      if (store.state.referenceStore.referencesLoaded) {
        this.objectTypes = store.state.referenceStore.references.get(
          'TKO_OBJECT_TYPE'
        );
        this.wasteManagementTypes = store.state.referenceStore.references.get(
          'WASTE_MANAGEMENT_TYPE'
        );
      } else {
        setTimeout(this.waitForDictionariesLoaded, 300);
      }
    },

    showConfirmation(msg, func, args, showReason) {
      this.showConfirmationModal = true;
      this.confirmationMessage = msg;
      this.showReason = showReason;
      this.confirmationFunction = func;
      this.confirmationArguments = args;
    },

    applyConfirmation() {
      this.confirmationFunction.apply(this, this.confirmationArguments);
      this.showReason = false;
      this.showConfirmationModal = false;
    },

    showRevision(func, args) {
      this.revision.show = true;
      this.revision.func = func;
      this.revision.args = args;
    },

    applyRevision() {
      if (this.request.revisionBefore) {
        this.revision.func.apply(this, this.revision.args);
        this.revision.show = false;
      }
    },

    onPdfView(obj) {
      if (obj.file) {
        this.pdfObj.file = obj.file;
      }
      if (obj.name) {
        this.pdfObj.name = obj.name;
      }
    },

    applyImportModal(coords, landPlotPoint) {
      const plength = landPlotPoint.points.length;

      coords.forEach(coord => {
        if (!landPlotPoint.importedPoints) {
          return;
        }

        const findedCoord = landPlotPoint.importedPoints.find(
          item => item.number === coord.number && item.x === coord.x && item.y === coord.y
        );

        if (!findedCoord) {
          landPlotPoint.importedPoints.push(coord);

          if (!plength) {
            landPlotPoint.points.push(coord);
          }
        }
      });

      this.requestImportModal = false;
    },

    getLandPlotPoints(landPlotPoints) {
      const result = [];
      if (Array.isArray(landPlotPoints.points) && Array.isArray(landPlotPoints.importedPoints)) {
        landPlotPoints.points.forEach(point => {
          const clonedPoint = {...point, imported: {}, same: false};
          const fipIndex = landPlotPoints.importedPoints.findIndex(
            item => item.x === point.x && item.y === point.y
          );
          const fipAllIndex = landPlotPoints.importedPoints.findIndex(
            item => item.number === point.number && item.x === point.x && item.y === point.y
          );

          if (fipAllIndex !== -1) {
            clonedPoint.imported = landPlotPoints.importedPoints[fipAllIndex];
            clonedPoint.same = true;
          } else if (fipIndex !== -1) {
            clonedPoint.imported = landPlotPoints.importedPoints[fipIndex];
            clonedPoint.same = true;
          }

          result.push(clonedPoint);
        });

        landPlotPoints.importedPoints.forEach(point => {
          const fipIndex = landPlotPoints.points.findIndex(
            item => item.x === point.x && item.y === point.y
          );

          if (fipIndex === -1) {
            result.push({
              number: null,
              x: null,
              y: null,
              description: null,
              imported: point,
              same: false
            });
          }
        });

        result.sort((a, b) => {
          const num1 = parseFloat(a.number);
          const num2 = parseFloat(b.number);
          if (num1 > num2) return 1;
          if (num1 < num2) return -1;
          return 0;
        });
      }

      return result;
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/vars.scss';
@import './../../assets/style/block.scss';

.form-elem__title.error {
  color: $colorErrorHover;
}

.tooltip {
  width: 800px;
  margin-top: 4px;
  font-size: $fontSizeSmall;
  color: $colorGray5;
  padding-bottom: 8px;
  z-index: 0;
}

.divTable{
  display: flex;
  flex-direction: row;
  width: 100%;
  flex-wrap: nowrap;
}
.divRow{
  display: flex;
  flex-direction: row;
  padding: 10px 3px;
  background: #41bfe81a;
  border-radius: 5px;
  border: 1px solid #41bfe861;
  margin: 0 2px;
  padding: 4px;
  font-weight: 500;
}
.not-collapsed{
  svg {
    transform: rotate(90deg);
  }
}
</style>
