<template>
  <div>
    <loader fullscreen :loading="loading" />
    <div v-if="items.length > 0">
      <div v-for="(item, key) in items" :key="key">
        <div
          v-if="
            hasItems && (!item.hasOwnProperty('fields') || (item.hasOwnProperty('fields') && item.fields.length))
          "
          class="m-4 p-4 text-center bg-light"
        >
          <h5 class="text-secondary">
            <b-icon
              v-if="item.icon"
              :icon="item.icon"
              style="width: 1.2rem; height: 1.2rem; margin: .1rem"
            />
            {{ item.title }}
          </h5>
          <b-list-group class="text-start">
            <b-list-group-item v-for="field in item.fields" :key="field.path">
              <strong class="text-secondary me-2">
                {{ field.title }}:
              </strong>
              <span v-html="field.value" />
            </b-list-group-item>
          </b-list-group>
        </div>
        <div v-else-if="!hasItems" class="m-4 p-5 text-center bg-light">
          <h4 class="text-secondary">Нет данных</h4>
        </div>
      </div>
      <b-pagination
        v-model="page"
        :per-page="size"
        :total-rows="total"
        align="center"
        @change="paginate"
      />
    </div>
    <div v-else class="m-4 p-5 text-center bg-light">
      <h4 class="text-secondary">Нет данных</h4>
    </div>
  </div>
</template>

<script>
import { $http } from '../../plugins/axios/http';
import Loader from '../components/Loader';
import { $DialogService } from '../../services/dialog.service';

export default {
  name: 'RequestHistory',
  components: {
    Loader
  },
  props: {
    requestId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      items: [],
      hasItems: false,
      fields: [
        // General
        {
          title: 'Наименование объекта по обращению с ТКО',
          path: 'name',
          type: 'string'
        },
        {
          title: 'Категория объекта',
          path: 'type.value',
          type: 'string'
        },
        {
          title: 'Статус анкеты',
          path: 'flowStatus.displayName',
          type: 'string'
        },
        {
          title: 'Дата статуса',
          path: 'flowStatusChanged',
          type: 'date'
        },
        {
          title: 'Причина изменения статуса',
          path: 'statusChangingReason',
          type: 'string'
        },
        {
          title: 'Дата проведения ревизии',
          path: 'revisionBefore',
          type: 'date'
        },
        // blockDatasource
        {
          title: 'Дата загрузки',
          path: 'dataSource.uploadDate',
          type: 'date'
        },
        {
          title: 'Наименование структурного подразделения Оператора по обращению с ТКО - поставщика сведений',
          path: 'dataSource.name',
          type: 'string'
        },
        {
          title: 'Наименование региона (субъекта РФ)',
          path: 'dataSource.subjectName.value',
          type: 'string'
        },
        {
          title: 'ФИО уполномоченного сотрудника поставщика сведений',
          path: 'dataSource.representativeFio',
          type: 'string'
        },
        {
          title: 'Должность уполномоченного сотрудника поставщика сведений',
          path: 'dataSource.representativePosition',
          type: 'string'
        },
        // blockVerificationStatus
        {
          title: 'Создана карточка объекта по обращению с ТКО',
          path: 'verificationStatusInfo.isCardCreated',
          type: 'boolean'
        },
        {
          title: 'Данные объекта по обращению с ТКО внесены оператором',
          path: 'verificationStatusInfo.infoByOperator',
          type: 'boolean'
        },
        {
          title: 'Данные объекта по обращению с ТКО содержат сведения об объекте, собранные ППК РЭО',
          path: 'verificationStatusInfo.isFromPpk',
          type: 'boolean'
        },
        {
          title: 'Данные объекта по обращению с ТКО верифицированы оператором по обращению с ТКО в рамках технического обследования',
          path: 'verificationStatusInfo.isVerifiedByOperator',
          type: 'boolean'
        },
        {
          title: 'Данные объекта по обращению с ТКО получены из территориальной схемы субъекта РФ',
          path: 'verificationStatusInfo.isFromTerritorialScheme',
          type: 'boolean'
        },
        {
          title: 'Комментарий',
          path: 'verificationStatusInfo.comment',
          type: 'string'
        },
        // blockGeneralInfo
        {
          title: 'Статус объекта по обращению с ТКО',
          path: 'status.value',
          type: 'string'
        },
        {
          title: 'Иной статус',
          path: 'otherObjectStatusName',
          type: 'string'
        },
        {
          title: 'Вид обращения с отходами',
          path: 'wasteManagementType.value',
          type: 'string'
        },
        {
          title: 'Тип объекта по обращению с ТКО',
          path: 'tkoObjectType.value',
          type: 'string'
        },
        {
          title: 'Наименование правообладателя объекта по обращению с ТКО',
          path: 'ownerName',
          type: 'string'
        },
        {
          title: 'ИНН правообладателя объекта по обращению с ТКО',
          path: 'ownerInn',
          type: 'string'
        },
        {
          title: 'Категория отходов',
          path: 'category.value',
          type: 'string'
        },
        // blockPropertyLocation
        {
          title: 'Наименование федерального округа',
          path: 'federalDistrictName.value',
          type: 'string'
        },
        {
          title: 'Наименование субъекта Российской Федерации, на территории которого расположен объект',
          path: 'subjectName.value',
          type: 'string'
        },
        {
          title: 'Наименование района субъекта Российской Федерации, на территории которого расположен объект',
          path: 'subjectAreaName.value',
          type: 'string'
        },
        {
          title: 'Текстовое описание адресного ориентира',
          path: 'addressDescription',
          type: 'string'
        },
        {
          title: 'Координаты объекта в WGS 84: широта',
          path: 'latitude',
          type: 'string'
        },
        {
          title: 'Координаты объекта в WGS 84: долгота',
          path: 'longitude',
          type: 'string'
        },
        {
          title: 'Уникальный номер адреса объекта адресации в ФИАС',
          path: 'fiasAddress.id',
          type: 'string'
        },
        {
          title: 'Код ОКТМО муниципального образования',
          path: 'fiasAddress.oktmo',
          type: 'string'
        },
        {
          title: 'Наименование региона',
          path: 'fiasAddress.regionName',
          type: 'string'
        },
        {
          title: 'Город',
          path: 'fiasAddress.city',
          type: 'string'
        },
        // blockExploitation
        {
          title: 'Дата начала строительства объекта',
          path: 'constructionStartDate',
          type: 'date'
        },
        {
          title: 'Наименование и реквизиты документа о вводе объекта в эксплуатацию',
          path: 'exploitationStartActNumber',
          type: 'string'
        },
        {
          title: 'Дата ввода объекта в эксплуатацию',
          path: 'exploitationStartDate',
          type: 'date'
        },
        {
          title: 'Срок эксплуатации объекта, лет',
          path: 'exploitationPeriod',
          type: 'string'
        },
        {
          title: 'Дата вывода из эксплуатации',
          path: 'exploitationEndDate',
          type: 'date'
        },
        {
          title: 'Акт о вводе объекта в эксплуатацию',
          path: 'exploitationAct.fileName',
          type: 'string'
        },
        {
          title: 'Принадлежность объекта к федеральными региональным программам',
          path: 'isInFederalOrRegionalPrograms',
          type: 'boolean'
        },
        {
          title: 'Программы с указанием их реквизитов',
          path: 'programs',
          type: 'string'
        },
        {
          title: 'Наличие аналогичных объектов в рассматриваемом субъекте РФ',
          path: 'hasSimilarObjectsInSubject',
          type: 'boolean'
        },
        {
          title: 'Действующие и планируемые аналогичные объекты в рассматриваемом субъекте РФ',
          path: 'currentAndPlannedSimilarObjects',
          type: 'string'
        },
        // blockOperator
        {
          title: 'Наименование оператора объекта по обращению с ТКО',
          path: 'operator.name',
          type: 'string'
        },
        {
          title: 'ИНН оператора объекта по обращению с ТКО',
          path: 'operator.inn',
          type: 'string'
        },
        {
          title: 'КПП оператора объекта по обращению с ТКО',
          path: 'operator.kpp',
          type: 'string'
        },
        {
          title: 'ОГРН оператора объекта по обращению с ТКО',
          path: 'operator.ogrn',
          type: 'string'
        },
        // blockContactInformation
        {
          title: 'Телефон/факс оператора объекта по обращению с ТКО',
          path: 'operator.phone',
          type: 'string'
        },
        {
          title: 'Сотовый телефон оператора объекта по обращению с ТКО',
          path: 'operator.mobile',
          type: 'string'
        },
        {
          title: 'Электронная почта оператора объекта по обращению с ТКО',
          path: 'operator.email',
          type: 'string'
        },
        {
          title: 'Юридический адрес оператора объекта по обращению с ТКО',
          path: 'operator.legalAddress',
          type: 'string'
        },
        {
          title: 'Фактический адрес оператора объекта по обращению с ТКО',
          path: 'operator.actualAddress',
          type: 'string'
        },
        {
          title: 'ФИО генерального директора оператора объекта по обращению с ТКО',
          path: 'operator.directorFio',
          type: 'string'
        },
        {
          title: 'ФИО уполномоченного представителя оператора объекта по обращению с ТКО',
          path: 'operator.representativeOfOperatorFio',
          type: 'string'
        },
        {
          title: 'Должность уполномоченного представителя оператора объекта по обращению с ТКО',
          path: 'operator.representativeOfOperatorPosition',
          type: 'string'
        },
        // blockInvestments
        {
          title: 'Наименование инвестора объекта по обращению с ТКО',
          path: 'investments.name',
          type: 'string'
        },
        {
          title: 'ИНН инвестора объекта по обращению с ТКО',
          path: 'investments.inn',
          type: 'string'
        },
        {
          title: 'КПП инвестора объекта по обращению с ТКО',
          path: 'investments.kpp',
          type: 'string'
        },
        {
          title: 'ОГРН инвестора объекта по обращению с ТКО',
          path: 'investments.ogrn',
          type: 'string'
        },
        {
          title: 'Телефон/факс инвестора объекта по обращению с ТКО',
          path: 'investments.phone',
          type: 'string'
        },
        {
          title: 'Сотовый телефон инвестора объекта по обращению с ТКО',
          path: 'investments.mobile',
          type: 'string'
        },
        {
          title: 'Электронная почта инвестора объекта по обращению с ТКО',
          path: 'investments.email',
          type: 'string'
        },
        {
          title: 'Интернет сайт инвестора объекта по обращению с ТКО',
          path: 'investments.website',
          type: 'string'
        },
        {
          title: 'Юридический адрес инвестора объекта по обращению с ТКО',
          path: 'investments.legalAddress',
          type: 'string'
        },
        {
          title: 'Фактический адрес инвестора объекта по обращению с ТКО',
          path: 'investments.actualAddress',
          type: 'string'
        },
        {
          title: 'ФИО руководителя инвестора объекта по обращению с ТКО',
          path: 'investments.directorFio',
          type: 'string'
        },
        {
          title: 'ФИО уполномоченного представителя инвестора объекта по обращению с ТКО',
          path: 'investments.representatioveFio',
          type: 'string'
        },
        {
          title: 'Должность уполномоченного представителя инвестора объекта по обращению с ТКО',
          path: 'investments.representatiovePosition',
          type: 'string'
        },
        {
          title: 'Опыт работы инвестора в сфере обращения с отходами',
          path: 'investments.experience',
          type: 'string'
        },
        {
          title: 'Полная сумма инвестиций для строительства и запуска объекта в промышленную эксплуатацию',
          path: 'investments.fullInvestmentAmount',
          type: 'string'
        },
        {
          title: 'Сумма собственных вложений инвестора',
          path: 'investments.personalInvestmentAmount',
          type: 'string'
        },
        {
          title: 'Планируемый срок окупаемости объекта',
          path: 'investments.plannedPaybackPeriod',
          type: 'string'
        },
        {
          title: 'Необходимая валовая выручка',
          path: 'investments.requiredGrossRevenue',
          type: 'string'
        },
        {
          title: 'Реквизиты соглашения о намерениях',
          path: 'investments.agreementRequisites',
          type: 'string'
        },
        {
          title: 'Риски реализации проекта (в графе перечисляются потенциальные риски реализации проекта)',
          path: 'investments.risks',
          type: 'string'
        },
        {
          title: 'Конкурентные преимущества проекта (указать какие именно)',
          path: 'investments.competitiveAdvantages',
          type: 'string'
        },
        // blockCost
        {
          title: 'Стоимость объекта всего',
          path: 'cost.total',
          type: 'string'
        },
        {
          title: 'Стоимость оборудования всего',
          path: 'cost.equipment',
          type: 'string'
        },
        {
          title: 'Стоимость оборудования российского производства (всего)',
          path: 'cost.russianEquipment',
          type: 'string'
        },
        {
          title: 'Стоимость монтажа и пусконаладки',
          path: 'cost.installation',
          type: 'string'
        },
        {
          title: 'Стоимость монтажа и пусконаладки произведенного российской компанией',
          path: 'cost.russianInstallation',
          type: 'string'
        },
        // blockBorderLandPlot
        {
          title: 'Наличие земельного участка',
          path: 'borderLandPlots.hasLandPlotForProjectRealization',
          type: 'boolean'
        },
        {
          title: 'Вид собственности на земельный участок',
          path: 'borderLandPlots.ownershipType.value',
          type: 'string'
        },
        {
          title: 'Кадастровый номер земельного участка',
          path: 'borderLandPlots.cadastralNumber',
          type: 'string'
        },
        {
          title: 'Категория земель',
          path: 'borderLandPlots.landCategory.value',
          type: 'string'
        },
        {
          title: 'Вид разрешенного использования земельного участка',
          path: 'borderLandPlots.allowedUsingType.value',
          type: 'string'
        },
        {
          title: 'Срок приведения в соответствие категории земли',
          path: 'borderLandPlots.compliancePeriod',
          type: 'string'
        },
        {
          title: 'Выписка из ЕГРП в формате PDF',
          path: 'borderLandPlots.egrp.fileName',
          type: 'string'
        },
        {
          title: 'Наличие градостроительного плана земельного участка',
          path: 'borderLandPlots.hasUrbanDevelopmentPlan',
          type: 'boolean'
        },
        {
          title: 'Наличие санитарно-защитной зоны',
          path: 'borderLandPlots.hasSanityProtectionZone',
          type: 'boolean'
        },
        {
          title: 'Размер санитарно-защитной зоны',
          path: 'borderLandPlots.sanitaryProtectionZoneSize',
          type: 'string'
        },
        {
          title: 'Наименование правоустанавливающего документа на земельный участок',
          path: 'borderLandPlots.rightsGivingDocumentName',
          type: 'string'
        },
        {
          title: 'Дата выдачи правоустанавливающего документа на земельный участок',
          path: 'borderLandPlots.rightsGivingDocumentStartDate',
          type: 'date'
        },
        {
          title: 'Номер правоустанавливающего документа на земельный участок',
          path: 'borderLandPlots.rigthsGivingDocumentNumber',
          type: 'string'
        },
        {
          title: 'Правоустанавливающий документ на земельный участок',
          path: 'borderLandPlots.rigthsGivingDocument.fileName',
          type: 'string'
        },
        {
          title: 'Кадастровый номер земельного участка, на котором расположен объект',
          path: 'currentLandPlots.cadastralNumber',
          type: 'string'
        },
        {
          title: 'Система координат',
          path: 'currentLandPlots.coordinatesSystem',
          type: 'string'
        },
        {
          title: 'Номер зоны',
          path: 'currentLandPlots.zoneNumber',
          type: 'string'
        },
        {
          title: 'Средняя квадратическая погрешность определения координат характерных точек границ земельного участка',
          path: 'currentLandPlots.averageInnacuracy',
          type: 'string'
        },
        {
          title: 'Схема расположения земельного участка или земельных участков на кадастровом плане территории',
          path: 'currentLandPlots.scheme.fileName',
          type: 'string'
        },
        {
          title: 'Номер точки',
          path: 'currentLandPlots.points.number',
          type: 'string'
        },
        {
          title: 'Координата точки X',
          path: 'currentLandPlots.points.x',
          type: 'string'
        },
        {
          title: 'Координата точки Y',
          path: 'currentLandPlots.points.y',
          type: 'string'
        },
        {
          title: 'Описание закрепления на местности',
          path: 'currentLandPlots.points.description.value',
          type: 'string'
        },
        {
          title: 'Площадь земельного участка',
          path: 'borderLandPlots.landPotArea',
          type: 'string'
        },
        {
          title: 'Площадь участка пригодная для ведения хозяйственной деятельности',
          path: 'borderLandPlots.suitableForExonomicActivitiesLandPloArea',
          type: 'string'
        },
        {
          title: 'Наименование ближайшего населенного пункта',
          path: 'borderLandPlots.nearestSettlementName',
          type: 'string'
        },
        {
          title: 'Расстояние до ближайшего населенного пункта',
          path: 'borderLandPlots.distanceToNearestSettlement',
          type: 'string'
        },
        {
          title: 'Адрес здания (сооружения) на территории земельного участка, на котором расположен объект',
          path: 'borderLandPlots.address',
          type: 'string'
        },
        {
          title: 'Кадастровый номер здания (сооружения) на территории земельного участка, на котором расположен объект',
          path: 'borderLandPlots.buildingCadastralNumber',
          type: 'string'
        },
        {
          title: 'Площадь здания (сооружения) на территории земельного участка, на котором расположен объект',
          path: 'borderLandPlots.area',
          type: 'string'
        },
        {
          title: 'Наличие энергоснабжения',
          path: 'borderLandPlots.hasPowerSupply',
          type: 'boolean'
        },
        {
          title: 'Выделенная электрическая мощность',
          path: 'borderLandPlots.dedicatedElecricalPower',
          type: 'string'
        },
        {
          title: 'Срок подключения к электроснабжению',
          path: 'borderLandPlots.powerSupplyConnectionDate',
          type: 'date'
        },
        {
          title: 'Наличие водоснабжения и водоотведения',
          path: 'borderLandPlots.hasWaterSupply',
          type: 'boolean'
        },
        {
          title: 'Мощность водоснабжения и водоотведения',
          path: 'borderLandPlots.waterSupplyPower',
          type: 'string'
        },
        {
          title: 'Срок подключения к водоснабжению',
          path: 'borderLandPlots.watterSupplyConnectionDate',
          type: 'date'
        },
        {
          title: 'Наличие газоснабжения',
          path: 'borderLandPlots.hasGasSupply',
          type: 'boolean'
        },
        {
          title: 'Мощность газоснабжения',
          path: 'borderLandPlots.gasSupplyPower',
          type: 'string'
        },
        {
          title: 'Срок подключения к газоснабжению',
          path: 'borderLandPlots.gasSupplyConnectionDate',
          type: 'date'
        },
        {
          title: 'Наличие подключения к тепловым сетям',
          path: 'borderLandPlots.hasHeatPipelinesConnection',
          type: 'boolean'
        },
        {
          title: 'Срок подключения к тепловым сетям',
          path: 'borderLandPlots.heatPipelinesConnectionStartDate',
          type: 'date'
        },
        {
          title: 'Наличие автомобильных подъездных путей',
          path: 'borderLandPlots.hasAutomobileAccessRoads',
          type: 'boolean'
        },
        {
          title: 'Срок организации подъездных путей',
          path: 'borderLandPlots.automobileAccessRoadsConnectionDate',
          type: 'date'
        },
        {
          title: 'Наличие железнодорожных путей',
          path: 'borderLandPlots.hasRailway',
          type: 'boolean'
        },
        {
          title: 'Расстояние от объекта, до ближайшей действующей ж/д ветки',
          path: 'borderLandPlots.distanceToNearestRailway',
          type: 'string'
        },
        {
          title: 'Расстояние до действующего пункта перевалки на железнодорожном транспорте',
          path: 'borderLandPlots.distanceToNearestTransshipment',
          type: 'string'
        },
        {
          title: 'Расстояние до ближайшего аэропорта',
          path: 'borderLandPlots.distanceToNearestAirport',
          type: 'string'
        },
        {
          title: 'Наименование аэропорта',
          path: 'borderLandPlots.nearestAirportName',
          type: 'string'
        },
        // blockAcceptanceDocumentation
        {
          title: 'Наличие финансово-экономического обоснования проекта',
          path: 'acceptanceDocumentation.hasFinancialJustification',
          type: 'boolean'
        },
        {
          title: 'Финансово-экономическое обоснование проекта',
          path: 'acceptanceDocumentation.financialJustification.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noJustificationReason',
          type: 'string'
        },
        {
          title: 'Наличие финансовой модели проекта',
          path: 'acceptanceDocumentation.hasFinModel',
          type: 'boolean'
        },
        {
          title: 'Финансовая модель проекта',
          path: 'acceptanceDocumentation.finModel.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noFinModelReason',
          type: 'string'
        },
        {
          title: 'Наличие технического задания на проектирование',
          path: 'acceptanceDocumentation.hasTechnicalSpecification',
          type: 'boolean'
        },
        {
          title: 'Техническое задание на проектирование',
          path: 'acceptanceDocumentation.technicalSpecification.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noTechnicalSpecificationReason',
          type: 'string'
        },
        {
          title: 'Наличие проектной документации',
          path: 'acceptanceDocumentation.hasProjectDocumentation',
          type: 'boolean'
        },
        {
          title: 'Проектная документация на объект по обращению с ТКО',
          path: 'acceptanceDocumentation.projectDocumentation.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noProjectDocumentationReason',
          type: 'string'
        },
        {
          title: 'Наименование проектной организации',
          path: 'acceptanceDocumentation.projectOrganizationName',
          type: 'string'
        },
        {
          title: 'ИНН проектной организации',
          path: 'acceptanceDocumentation.projectOrganizationInn',
          type: 'string'
        },
        {
          title: 'Наличие проведенных исследований по оценке воздействия на окружающую среду',
          path: 'acceptanceDocumentation.hasEnvironmentalImpactResearch',
          type: 'boolean'
        },
        {
          title: 'Результаты исследований по оценке воздействия на окружающую среду',
          path: 'acceptanceDocumentation.environmentalImpactResearchResults.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noResearchReason',
          type: 'string'
        },
        {
          title: 'Наличие заключения Главгосэкспертизы',
          path: 'acceptanceDocumentation.hasGovernmentConclusion',
          type: 'boolean'
        },
        {
          title: 'Дата заключения Главгосэкспертизы',
          path: 'acceptanceDocumentation.governmentConclusionDate',
          type: 'date'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noGovernmentConclusionReason',
          type: 'string'
        },
        {
          title: 'Наименование учреждения, выдавшего заключение Главгосэкспертизы',
          path: 'acceptanceDocumentation.governmentConclusionIssuer',
          type: 'string'
        },
        {
          title: 'Номер заключения Главгосэкспертизы',
          path: 'acceptanceDocumentation.governmentConclusionNumber',
          type: 'string'
        },
        {
          title: 'Заключение Главгосэкспертизы',
          path: 'acceptanceDocumentation.governmentConclusion.fileName',
          type: 'string'
        },
        {
          title: 'Наличие проведенных публичных слушаний проектной документации',
          path: 'acceptanceDocumentation.publicHearingsCompleted',
          type: 'boolean'
        },
        {
          title: 'Результаты публичных слушаний проектной документации (протокол)',
          path: 'acceptanceDocumentation.publicHearingsResults.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noPublicHearingsReason',
          type: 'string'
        },
        {
          title: 'Наличие постановки на государственный учет объекта оказывающего негативное воздействие на окружающую среду',
          path: 'acceptanceDocumentation.hasStateRegistration',
          type: 'boolean'
        },
        {
          title: 'Номер выдачи свидетельства о постановке на государственный учет объекта оказывающего негативное воздействие на окружающую среду',
          path: 'acceptanceDocumentation.stateRegistrationNumber',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noStateRegistrationReason',
          type: 'string'
        },
        {
          title: 'Дата выдачи свидетельства о постановке на государственный учет объекта оказывающего негативное воздействие на окружающую среду',
          path: 'acceptanceDocumentation.stateRegistrationDate',
          type: 'date'
        },
        {
          title: 'Свидетельство о постановке на государственный учет объекта оказывающего негативное воздействие на окружающую среду',
          path: 'acceptanceDocumentation.stateRegistration.fileName',
          type: 'string'
        },
        {
          title: 'Наличие заключения государственной экологической экспертизы проектной документации',
          path: 'acceptanceDocumentation.hasGovernmentEnvironmentalConclusion',
          type: 'boolean'
        },
        {
          title: 'Результаты заключения государственной экологической экспертизы проектной документации',
          path: 'acceptanceDocumentation.governmentEnvironmentalConclusion.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noGovernmentEnvironmentalConclusionReason',
          type: 'string'
        },
        {
          title: 'Категория и код объекта о постановке на государственный учет',
          path: 'acceptanceDocumentation.objectCategory.value',
          type: 'string'
        },
        {
          title: 'Наличие комплексного экологического разрешения, декларации и иных документов в части нормирования отходов',
          path: 'acceptanceDocumentation.hasIntegratedEnvironmentalPermission',
          type: 'boolean'
        },
        {
          title: 'Документ комплексного экологического разрешения, декларации и иных документов в части нормирования отходов',
          path: 'acceptanceDocumentation.integratedEnvironmentalPermission.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noIntegratedEnvironmentalPermissionReason',
          type: 'string'
        },
        {
          title: 'Наличие утвержденной инвестиционной и производственной программы в области обращения с ТКО',
          path: 'acceptanceDocumentation.hasInvestmentProgram',
          type: 'boolean'
        },
        {
          title: 'Утвержденная инвестиционная и производственная программы в области обращения с ТКО',
          path: 'acceptanceDocumentation.investmentProgram.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noInvestmentProgramReason',
          type: 'string'
        },
        {
          title: 'Наличие программы производственного экологического контроля (ПЭК) и отчета об организации и о результатах осуществления ПЭК',
          path: 'acceptanceDocumentation.hasEnvironmentControlProgram',
          type: 'boolean'
        },
        {
          title: 'Документ комплексного экологического разрешения, декларации и иных документов в части нормирования отходов',
          path: 'acceptanceDocumentation.environmentControlProgram.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noEnvironmentControlProgramReason',
          type: 'string'
        },
        {
          title: 'Наличие санитарно-эпидемиологического заключения о соответствии санитарным правилам зданий, строений, сооружений, помещений, оборудования, которые планируется использовать для выполнения заявленных работ, составляющих деятельность по обращению с отходами',
          path: 'acceptanceDocumentation.hasSanPinConclusion',
          type: 'boolean'
        },
        {
          title: 'Санитарно-эпидемиологического заключения о соответствии санитарным правилам зданий, строений, сооружений, помещений, оборудования, которые планируется использовать для выполнения заявленных работ, составляющих деятельность по обращению с отходами',
          path: 'acceptanceDocumentation.sanPinConclusion.fileName',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noSanPinConclusionReason',
          type: 'string'
        },
        {
          title: 'Наличие лицензии на осуществление деятельности по сбору, транспортированию, обработке, утилизации, обезвреживанию, размещению отходов I - IV классов опасности',
          path: 'acceptanceDocumentation.hasLicence',
          type: 'boolean'
        },
        {
          title: 'Номер лицензии на деятельность по сбору, транспортированию, обработке, утилизации, обезвреживанию, размещению отходов I - IV классов опасности (при наличии лицензии)',
          path: 'acceptanceDocumentation.licenceNumber',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noLicenceReason',
          type: 'string'
        },
        {
          title: 'Дата выдачи лицензии на деятельность по сбору, транспортированию, обработке, утилизации, обезвреживанию, размещению отходов I - IV классов опасности (при наличии лицензии)',
          path: 'acceptanceDocumentation.licenceStartDate',
          type: 'date'
        },
        {
          title: 'Наименование органа, выдавшего лицензию на деятельность по сбору, транспортированию, обработке, утилизации, обезвреживанию, размещению отходов I - IV классов опасности (при наличии лицензии)',
          path: 'acceptanceDocumentation.licenceAuthor',
          type: 'string'
        },
        {
          title: 'Срок получения лицензии на осуществление деятельности по сбору, транспортированию, обработке, утилизации, обезвреживанию, размещению отходов I - IV классов опасности',
          path: 'acceptanceDocumentation.licenceWillBeGivenDate',
          type: 'date'
        },
        {
          title: 'Наличие включения объекта в Государственный реестр объектов размещения отходов (ГРОРО)',
          path: 'acceptanceDocumentation.isInRegistry',
          type: 'boolean'
        },
        {
          title: 'Номер объекта в ГРОРО',
          path: 'acceptanceDocumentation.groro.value',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'acceptanceDocumentation.noGroroReason',
          type: 'string'
        },
        {
          title: 'Реквизиты приказа уполномоченного органа о включении объекта в ГРОРО',
          path: 'acceptanceDocumentation.groroRequestRequisites',
          type: 'string'
        },
        {
          title: 'Наличие объекта в территориальной схеме обращения с отходами',
          path: 'acceptanceDocumentation.isInTerritorialScheme',
          type: 'boolean'
        },
        {
          title: 'Реквизиты документа, закрепляющего включение объекта в территориальную схему',
          path: 'acceptanceDocumentation.territorialSchemeDocumentRequisites',
          type: 'string'
        },
        {
          title: 'Ссылка на раздел (страницу) действующей территориальной схемы, в котором упомянут объект',
          path: 'acceptanceDocumentation.territorialSchemeLink',
          type: 'string'
        },
        {
          title: 'Ссылка на электронную модель территориальной схемы обращения с отходами',
          path: 'acceptanceDocumentation.territorialSchemeModelLink',
          type: 'string'
        },
        {
          title: 'Наличие специальных (геологических, гидрологических и иных) изысканий (исследований)',
          path: 'acceptanceDocumentation.hasSpecialInvestigations',
          type: 'boolean'
        },
        {
          title: 'Наименование органа, организации, проводившей специальные изыскания (исследования)',
          path: 'acceptanceDocumentation.specialInvestigator',
          type: 'string'
        },
        {
          title: 'Период проведения специальных (геологических, гидрологических и иных) изысканий (исследований)',
          path: 'acceptanceDocumentation.specialInvestigationsDate',
          type: 'date'
        },
        {
          title: 'Земельный участок располагается в границах населенных пунктов, лесопарковых, курортных, лечебно-оздоровительных, рекреационных зон, а также водоохранных зон, на водосборных площадях подземных водных объектов, которые используются в целях питьевого и хозяйственно-бытового водоснабжения, в местах залегания полезных ископаемых и ведения горных работ',
          path: 'acceptanceDocumentation.isOnBorder',
          type: 'boolean'
        },
        {
          title: 'Класс опасности предприятия (указывается в соответствии с Федеральным законом от 21 июля 1997 г. № 116-ФЗ «О промышленной безопасности опасных производственных объектов»)',
          path: 'acceptanceDocumentation.dangerType.value',
          type: 'string'
        },
        {
          title: 'Наличие результатов проб воды, воздуха, почвы',
          path: 'acceptanceDocumentation.hasSamples',
          type: 'boolean'
        },
        {
          title: 'Результаты проб воды, воздуха, почвы',
          path: 'acceptanceDocumentation.samplesResults.fileName',
          type: 'string'
        },
        // blockSchedule
        {
          title: 'График работы c',
          path: 'workSchedule.scheduleJson.schedule.from',
          type: 'string'
        },
        {
          title: 'График работы по',
          path: 'workSchedule.scheduleJson.schedule.to',
          type: 'string'
        },
        {
          title: 'Перерыв c',
          path: 'workSchedule.scheduleJson.break.from',
          type: 'string'
        },
        {
          title: 'Перерыв по',
          path: 'workSchedule.scheduleJson.break.to',
          type: 'string'
        },
        {
          title: 'График работы c (по дням недели)',
          path: 'workSchedule.scheduleJson.days.schedule.from',
          type: 'string'
        },
        {
          title: 'График работы по (по дням недели)',
          path: 'workSchedule.scheduleJson.days.schedule.to',
          type: 'string'
        },
        {
          title: 'Перерыв c (по дням недели)',
          path: 'workSchedule.scheduleJson.days.break.from',
          type: 'string'
        },
        {
          title: 'Перерыв по (по дням недели)',
          path: 'workSchedule.scheduleJson.days.break.to',
          type: 'string'
        },
        {
          title: 'Количество рабочих смен в сутки (указывается количество рабочих смен)',
          path: 'workSchedule.shiftsPerDayCount',
          type: 'string'
        },
        {
          title: 'Количество рабочих дней в году (указывается без учёта плановых остановок оборудования)',
          path: 'workSchedule.daysPerYearCount',
          type: 'string'
        },
        {
          title: 'Количество рабочих мест (указывается в количестве человек)',
          path: 'workSchedule.workplacesCount',
          type: 'string'
        },
        {
          title: 'Количество управленческого персонала (указывается в количестве человек)',
          path: 'workSchedule.managersCount',
          type: 'string'
        },
        {
          title: 'Количество производственного персонала (рабочих) (указывается в количестве человек)',
          path: 'workSchedule.workersCount',
          type: 'string'
        },
        // blockTariffs
        {
          title: 'Тариф на захоронение образованных объектом отходов (указывается за одну)',
          path: 'tariffInfo.burial',
          type: 'string'
        },
        {
          title: 'Предельный тариф',
          path: 'tariffInfo.tariffs.tariffPerTon',
          type: 'string'
        },
        {
          title: 'Период действия тарифа с',
          path: 'tariffInfo.tariffs.tariffStartDate',
          type: 'date'
        },
        {
          title: 'Период действия тарифа по',
          path: 'tariffInfo.tariffs.tariffEndDate',
          type: 'date'
        },
        {
          title: 'Документ об утвержденном тарифе',
          path: 'tariffInfo.tariffs.tariffDocumentPhotos.fileName',
          type: 'string'
        },
        {
          title: 'Документ об утвержденном тарифе (pdf)',
          path: 'tariffInfo.tariffs.tariffDocument.fileName',
          type: 'string'
        },
        // blockIndicators
        {
          title: 'Производственная мощность объекта',
          path: 'indicator.productionCapacity',
          type: 'string'
        },
        {
          title: 'Свободная мощность объекта',
          path: 'indicator.freeCapacity',
          type: 'string'
        },
        {
          title: 'Масса ТКО, принятых в предыдущем году',
          path: 'indicator.previousYearTkoWeight',
          type: 'string'
        },
        {
          title: 'Масса других видов отходов (не ТКО), принятых в предыдущем году',
          path: 'indicator.previousYearNonTkoWeight',
          type: 'string'
        },
        {
          title: 'Остаточная емкость для размещения отходов на начало следующего года',
          path: 'indicator.nextYearFreeCapacity',
          type: 'string'
        },
        {
          title: 'Проектная масса производимого вторичного сырья в год',
          path: 'indicator.secondaryRawMaterialsPerYear',
          type: 'string'
        },
        {
          title: 'Проектная доля утилизации',
          path: 'indicator.utilizationPercent',
          type: 'string'
        },
        {
          title: 'Общая площадь объекта',
          path: 'indicator.area',
          type: 'string'
        },
        {
          title: 'Общие фотографии объекта',
          path: 'indicator.photos.fileName',
          type: 'string'
        },
        {
          title: 'Площадь производственной части объекта',
          path: 'indicator.productionPartArea',
          type: 'string'
        },
        {
          title: 'Фотографии производственной части объекта снаружи (здания, сооружения и т.п.)',
          path: 'indicator.productionPartPhotos.fileName',
          type: 'string'
        },
        {
          title: 'Площадь зоны для разгрузки поступающих отходов',
          path: 'indicator.unloadingZoneArea',
          type: 'string'
        },
        {
          title: 'Площадь цеха сортировки отходов',
          path: 'indicator.sortingZoneArea',
          type: 'string'
        },
        {
          title: 'Наличие участка компостирования отходов',
          path: 'indicator.hasCompostingZone',
          type: 'boolean'
        },
        {
          title: 'Мощность участка',
          path: 'indicator.compostingZoneCapacityPerYear',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'indicator.noCompostingZoneReason',
          type: 'string'
        },
        {
          title: 'Наименование входящего материала для компостирования',
          path: 'indicator.compostingMaterialName',
          type: 'string'
        },
        {
          title: 'Назначение получаемого компоста',
          path: 'indicator.compostPurpose',
          type: 'string'
        },
        {
          title: 'Наличие участка производства RDF (refuse derived fuel, твердое вторичное топливо)',
          path: 'indicator.hasRdfZone',
          type: 'boolean'
        },
        {
          title: 'Мощность участка',
          path: 'indicator.rdfZoneCapacityPerYear',
          type: 'string'
        },
        {
          title: 'Назначение получаемого RDF',
          path: 'indicator.rdfPurpose',
          type: 'string'
        },
        {
          title: 'Технологическая схема движения отходов',
          path: 'indicator.technologicalSchemePhotos.fileName',
          type: 'string'
        },
        {
          title: 'Технологическая схема движения отходов (pdf)',
          path: 'indicator.technologicalScheme.fileName',
          type: 'string'
        },
        {
          title: 'Общая схема объекта',
          path: 'indicator.generalSchemePhotos.fileName',
          type: 'string'
        },
        {
          title: 'Общая схема объекта (pdf)',
          path: 'indicator.generalScheme.fileName',
          type: 'string'
        },
        {
          title: 'Схема производственной части',
          path: 'indicator.productionZoneSchemePhotos.fileName',
          type: 'string'
        },
        {
          title: 'Схема производственной части (pdf)',
          path: 'indicator.productionZoneScheme.fileName',
          type: 'string'
        },
        {
          title: 'Наличие потребности в импортозамещении оборудования объекта',
          path: 'indicator.isImportSubstitutionNeeded',
          type: 'boolean'
        },
        {
          title: 'Тип оборудования',
          path: 'indicator.equipmentType',
          type: 'string'
        },
        {
          title: 'Использование оборудования включенного в НДТ (наличие включения основного и вспомогательного оборудования в актуальные справочники наилучших доступных технологий)',
          path: 'indicator.isNdtEquipmentUsed',
          type: 'boolean'
        },
        {
          title: 'Тип оборудования',
          path: 'indicator.ndtEquipmentType',
          type: 'string'
        },
        {
          title: 'Наименование справочника НДТ',
          path: 'indicator.ndtDictionaryName',
          type: 'string'
        },
        {
          title: 'Площадь тела объекта размещения отходов (указывается площадь на которой планируется производить размещение отходов, в кв.м)',
          path: 'indicator.placingArea',
          type: 'string'
        },
        {
          title: 'Полная проектная высота полигона (указывается в метрах)',
          path: 'indicator.projectHeight',
          type: 'string'
        },
        {
          title: 'Наличие проведенных маркшейдерских работ на объекте',
          path: 'indicator.hasMineSurveying',
          type: 'boolean'
        },
        {
          title: 'Наименование организации проводившей маркшейдерские работы',
          path: 'indicator.mineSurveyingOrganizationName',
          type: 'string'
        },
        {
          title: 'ИНН организации проводившей маркшейдерские работы',
          path: 'indicator.mineSurveyingOrganizationInn',
          type: 'string'
        },
        {
          title: 'Заключение организации проводившей маркшейдерские работы',
          path: 'indicator.mineSurveyingConclusion.fileName',
          type: 'string'
        },
        {
          title: 'Количество карт для размещения отходов',
          path: 'indicator.mapCount',
          type: 'string'
        },
        {
          title: 'Размеры карты для размещения отходов',
          path: 'indicator.maps.size',
          type: 'string'
        },
        {
          title: 'Период ввода карты для размещения отходов в эксплуатацию',
          path: 'indicator.maps.period',
          type: 'date'
        },
        {
          title: 'Тип гидроизоляции участка размещения отходов',
          path: 'indicator.waterproofingType',
          type: 'string'
        },
        {
          title: 'Иной тип гидроизоляции участка размещения отходов',
          path: 'indicator.otherWaterproofingType',
          type: 'string'
        },
        {
          title: 'Рельеф участка (указывается перепад высот на участке, наличие заболоченных территорий, лесных массивов)',
          path: 'indicator.relief',
          type: 'string'
        },
        {
          title: 'Глубина залегания грунтовых вод (указывается в метрах)',
          path: 'indicator.groundwaterDepth',
          type: 'string'
        },
        {
          title: 'Возможность подтопления участка',
          path: 'indicator.floodingPossibility',
          type: 'string'
        },
        {
          title: 'Наличие уплотнителя отходов',
          path: 'indicator.hasWasteCompactor',
          type: 'boolean'
        },
        {
          title: 'Тип и модель уплотнителя отходов',
          path: 'indicator.wasteCompactorType',
          type: 'string'
        },
        {
          title: 'Эксплуатационная масса уплотнителя отходов',
          path: 'indicator.wasteCompactorMass',
          type: 'string'
        },
        {
          title: 'Фотографии уплотнителя отходов',
          path: 'indicator.wasteCompactorPhotos.fileName',
          type: 'string'
        },
        {
          title: 'Краткое описание технологического процесса',
          path: 'indicator.techProcessDescription',
          type: 'string'
        },
        {
          title: 'Наличие площадки временного накопления отходов',
          path: 'indicator.hasTemporaryWasteStorage',
          type: 'boolean'
        },
        {
          title: 'Площадь площадки (указывается в кв.м)',
          path: 'indicator.temporaryWasteStorageArea',
          type: 'string'
        },
        {
          title: 'Виды отходов накапливаемых на площадке',
          path: 'indicator.temporaryWasteStorageWasteTypes',
          type: 'string'
        },
        {
          title: 'Вид утилизации',
          path: 'indicator.utilizationType.value',
          type: 'string'
        },
        {
          title: 'Наличие выработки электроэнергии в процессе обезвреживания отходов',
          path: 'indicator.hasRecycling',
          type: 'boolean'
        },
        {
          title: 'Мощность выработки электроэнергии в процессе обезвреживания отходов',
          path: 'indicator.recyclingPower',
          type: 'string'
        },
        {
          title: 'Наличие выработки электроэнергии в процессе обезвреживания отходов термическим способом',
          path: 'indicator.hasThermalRecycling',
          type: 'boolean'
        },
        {
          title: 'Мощность выработки электроэнергии в процессе обезвреживания отходов термическим способом',
          path: 'indicator.thermalRecyclingPower',
          type: 'string'
        },
        // blockWasteTypes
        {
          title: 'Вид отходов (код ФККО)',
          path: 'wasteInfo.wasteTypes.wasteType.value',
          type: 'string'
        },
        {
          title: 'Класс опасности отходов, которые перерабатываются на объекте',
          path: 'wasteInfo.wasteTypes.dangerType.value',
          type: 'string'
        },
        {
          title: 'Направление вывоза отходов (указать координаты объектов или номера ГРОРО)',
          path: 'wasteInfo.wasteDirections.coordsOrGroro',
          type: 'string'
        },
        {
          title: 'Масса принятых отходов за текущий календарный год',
          path: 'wasteInfo.wasteCount',
          type: 'string'
        },
        {
          title: 'Масса образуемых отходов от деятельности объекта (указывается общая планируемая масса образуемых объектом отходов за текущий год)',
          path: 'wasteInfo.wasteThisYear',
          type: 'string'
        },
        {
          title: 'Масса образуемых отходов от деятельности объекта (указывается общая планируемая масса образуемых объектом отходов за предыдущий год)',
          path: 'wasteInfo.wastePreviousYear',
          type: 'string'
        },
        {
          title: 'Масса планируемых к принятию ВМР в текущем году',
          path: 'wasteInfo.vmrThisYear',
          type: 'string'
        },
        {
          title: 'Масса принятых ВМР в предыдущем году',
          path: 'wasteInfo.vmrPreviousYear',
          type: 'string'
        },
        {
          title: 'Среднегодовая стоимость приема ВМР по видам',
          path: 'wasteInfo.vmrCost',
          type: 'string'
        },
        // blockInfrastructureObjects
        {
          title: 'Наличие весового контроля на объекте',
          path: 'infrastructureObjectInfo.hasWeightControl',
          type: 'boolean'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noWeightControlReason',
          type: 'string'
        },
        {
          title: 'Количество оборудования весового контроля на объекте',
          path: 'infrastructureObjectInfo.weightControlCount',
          type: 'string'
        },
        {
          title: 'Производитель оборудования весового контроля на объекте',
          path: 'infrastructureObjectInfo.weightControls.manufacturer',
          type: 'string'
        },
        {
          title: 'Марка оборудования весового контроля на объекте',
          path: 'infrastructureObjectInfo.weightControls.brand',
          type: 'string'
        },
        {
          title: 'Длина весовой платформы в метрах',
          path: 'infrastructureObjectInfo.weightControls.length',
          type: 'string'
        },
        {
          title: 'Фотографии оборудования весового контроля на объекте',
          path: 'infrastructureObjectInfo.weightControls.photos.fileName',
          type: 'string'
        },
        {
          title: 'Наличие пункта мойки колес',
          path: 'infrastructureObjectInfo.hasWheelsWashingPoint',
          type: 'boolean'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noWheelsWashingPointReason',
          type: 'string'
        },
        {
          title: 'Количество оборудования пункта мойки колес',
          path: 'infrastructureObjectInfo.wheelsWashingPointCount',
          type: 'string'
        },
        {
          title: 'Производитель оборудования пункта мойки колес',
          path: 'infrastructureObjectInfo.wheelsWashingPoints.manufacturer',
          type: 'string'
        },
        {
          title: 'Марка оборудования пункта мойки колес',
          path: 'infrastructureObjectInfo.wheelsWashingPoints.brand',
          type: 'string'
        },
        {
          title: 'Фотографии оборудования пункта мойки колес',
          path: 'infrastructureObjectInfo.wheelsWashingPoints.photos.fileName',
          type: 'string'
        },
        {
          title: 'Наличие систем видеонаблюдения',
          path: 'infrastructureObjectInfo.hasVideoEquipment',
          type: 'boolean'
        },
        {
          title: 'Количество систем видеонаблюдения',
          path: 'infrastructureObjectInfo.videoEquipment.count',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noVideoEquipmentReason',
          type: 'string'
        },
        {
          title: 'Наличие локальных очистных сооружений',
          path: 'infrastructureObjectInfo.hasLocalTreatmentFacilities',
          type: 'boolean'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noLocalTreatmentFacilitiesReason',
          type: 'string'
        },
        {
          title: 'Количество локальных очистных сооружений',
          path: 'infrastructureObjectInfo.localTreatmentFacilitiesCount',
          type: 'string'
        },
        {
          title: 'Мощность очистных сооружений',
          path: 'infrastructureObjectInfo.localTreatmentFacilities.capacity',
          type: 'string'
        },
        {
          title: 'Вид (тип) очистных сооружений',
          path: 'infrastructureObjectInfo.localTreatmentFacilities.type.value',
          type: 'string'
        },
        {
          title: 'Фотографии оборудования очистных сооружений',
          path: 'infrastructureObjectInfo.localTreatmentFacilities.photos.fileName',
          type: 'string'
        },
        {
          title: 'Паспорт оборудования очистных сооружений',
          path: 'infrastructureObjectInfo.localTreatmentFacilities.passportPhotos.fileName',
          type: 'string'
        },
        {
          title: 'Паспорт оборудования очистных сооружений (pdf)',
          path: 'infrastructureObjectInfo.localTreatmentFacilities.passport.fileName',
          type: 'string'
        },
        {
          title: 'Наличие радиационного контроля',
          path: 'infrastructureObjectInfo.hasRadiationControl',
          type: 'boolean'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noRadiationControlReason',
          type: 'string'
        },
        {
          title: 'Количество оборудования радиационного контроля',
          path: 'infrastructureObjectInfo.radiationControlCount',
          type: 'string'
        },
        {
          title: 'Производитель оборудования радиационного контроля',
          path: 'infrastructureObjectInfo.radiationControls.manufacturer',
          type: 'string'
        },
        {
          title: 'Марка оборудования радиационного контроля',
          path: 'infrastructureObjectInfo.radiationControls.brand',
          type: 'string'
        },
        {
          title: 'Фотографии оборудования радиационного контроля',
          path: 'infrastructureObjectInfo.radiationControls.photos.fileName',
          type: 'string'
        },
        {
          title: 'Паспорт оборудования радиационного контроля',
          path: 'infrastructureObjectInfo.radiationControls.passportPhotos.fileName',
          type: 'string'
        },
        {
          title: 'Паспорт оборудования радиационного контроля (pdf)',
          path: 'infrastructureObjectInfo.radiationControls.passport.fileName',
          type: 'string'
        },
        {
          title: 'Наличие обустроенной сети дорог на объекте',
          path: 'infrastructureObjectInfo.hasRoads',
          type: 'boolean'
        },
        {
          title: 'Вид покрытия дорог',
          path: 'infrastructureObjectInfo.road.type.value',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noRoadsReason',
          type: 'string'
        },
        {
          title: 'Общая длина проезжей части дорог',
          path: 'infrastructureObjectInfo.road.length',
          type: 'string'
        },
        {
          title: 'Схема движения транспорта на объекте по обращению с ТКО',
          path: 'infrastructureObjectInfo.road.schemePhotos.fileName',
          type: 'string'
        },
        {
          title: 'Схема движения транспорта на объекте по обращению с ТКО (pdf)',
          path: 'infrastructureObjectInfo.road.scheme.fileName',
          type: 'string'
        },
        {
          title: 'Наличие ограждения по периметру объекта по обращению с ТКО',
          path: 'infrastructureObjectInfo.hasFences',
          type: 'boolean'
        },
        {
          title: 'Тип ограждения объекта по обращению с ТКО',
          path: 'infrastructureObjectInfo.fence.type.value',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noFencesReason',
          type: 'string'
        },
        {
          title: 'Наименование иного ограждения',
          path: 'infrastructureObjectInfo.fence.otherType',
          type: 'string'
        },
        {
          title: 'Фотографии ограждения объекта по обращению с ТКО',
          path: 'infrastructureObjectInfo.fence.photos.fileName',
          type: 'string'
        },
        {
          title: 'Наличие освещения на объекте для работы в темное время суток',
          path: 'infrastructureObjectInfo.hasLights',
          type: 'boolean'
        },
        {
          title: 'Тип освещения',
          path: 'infrastructureObjectInfo.light.type.value',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noLightsReason',
          type: 'string'
        },
        {
          title: 'Наименование иного освещения',
          path: 'infrastructureObjectInfo.light.otherType',
          type: 'string'
        },
        {
          title: 'Наличие пункта охраны',
          path: 'infrastructureObjectInfo.hasSecurity',
          type: 'boolean'
        },
        {
          title: 'Ресурсы, привлекаемые для охраны объекта по обращению с ТКО',
          path: 'infrastructureObjectInfo.security.type.value',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noSecurityReason',
          type: 'string'
        },
        {
          title: 'Иные ресурсы, привлекаемые для охраны объекта по обращению с ТКО',
          path: 'infrastructureObjectInfo.security.otherType',
          type: 'string'
        },
        {
          title: 'Количество сотрудников, осуществляющих охрану',
          path: 'infrastructureObjectInfo.security.count',
          type: 'string'
        },
        {
          title: 'Наличие автоматизированной системы управления (АСУ) объектом по обращению с ТКО',
          path: 'infrastructureObjectInfo.hasAsu',
          type: 'boolean'
        },
        {
          title: 'Назначение системы АСУ',
          path: 'infrastructureObjectInfo.asu.purpose',
          type: 'string'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noAsuReason',
          type: 'string'
        },
        {
          title: 'Функции АСУ',
          path: 'infrastructureObjectInfo.asu.functions',
          type: 'string'
        },
        {
          title: 'Наличие системы мониторинга окружающей среды на объекте по обращению с ТКО',
          path: 'infrastructureObjectInfo.hasEnvironmentMonitoringSystem',
          type: 'boolean'
        },
        {
          title: 'Причина отсутствия',
          path: 'infrastructureObjectInfo.noEnvironmentMonitoringSystemReason',
          type: 'string'
        },
        {
          title: 'Количество систем мониторинга окружающей среды на объекте',
          path: 'infrastructureObjectInfo.environmentMonitoringSystemCount',
          type: 'string'
        },
        {
          title: 'Применяемые системы мониторинга окружающей среды на объекте по обращению с ТКО',
          path: 'infrastructureObjectInfo.environmentMonitoringSystems.type.value',
          type: 'string'
        },
        // blockEquipment
        {
          title: 'Наличие основного производственного оборудования',
          path: 'hasCoreEquipment',
          type: 'boolean'
        },
        {
          title: 'Наличие вспомогательного производственного оборудования',
          path: 'hasAuxiliaryEquipment',
          type: 'boolean'
        },
        {
          title: 'Количество оборудования',
          path: 'equipmentCount',
          type: 'string'
        },
        {
          title: 'Тип оборудования',
          path: 'equipment.type.value',
          type: 'string'
        },
        {
          title: 'Наименование оборудования',
          path: 'equipment.otherType',
          type: 'string'
        },
        {
          title: 'Производитель оборудования',
          path: 'equipment.manufacturer',
          type: 'string'
        },
        {
          title: 'Марка оборудования',
          path: 'equipment.brand',
          type: 'string'
        },
        {
          title: 'Проектная мощность оборудования',
          path: 'equipment.projectPower',
          type: 'string'
        },
        {
          title: 'Краткое описание технологического процесса',
          path: 'equipment.processDescription',
          type: 'string'
        },
        {
          title: 'Выпускаемая продукция',
          path: 'equipment.production',
          type: 'string'
        },
        {
          title: 'Длина конвейера',
          path: 'equipment.length',
          type: 'string'
        },
        {
          title: 'Ширина конвейера',
          path: 'equipment.width',
          type: 'string'
        },
        {
          title: 'Количество оборудования',
          path: 'equipment.count',
          type: 'string'
        },
        {
          title: 'Рабочая скорость линии конвейера',
          path: 'equipment.speed',
          type: 'string'
        },
        {
          title: 'Механизм загрузки отходов на подающий конвейер',
          path: 'equipment.loadingMechanism',
          type: 'string'
        },
        {
          title: 'Толщина слоя отходов, подающихся на конвейер',
          path: 'equipment.wasteWidth',
          type: 'string'
        },
        {
          title: 'Количество постов сортировки',
          path: 'equipment.sortingPostsCount',
          type: 'string'
        },
        {
          title: 'Фотографии оборудования',
          path: 'equipment.photos.fileName',
          type: 'string'
        },
        {
          title: 'Паспорт оборудования',
          path: 'equipment.passportPhotos.fileName',
          type: 'string'
        },
        {
          title: 'Паспорт оборудования (pdf)',
          path: 'equipment.passport.fileName',
          type: 'string'
        },
        // blockSecondaryResources
        {
          title: 'Процент извлекаемых вторичных материальных ресурсов по массе',
          path: 'secondaryResources.extractPercent',
          type: 'string'
        },
        {
          title: 'Вторичный материал',
          path: 'secondaryResources.types.reference.value',
          type: 'string'
        },
        {
          title: 'Процент от массы входного потока',
          path: 'secondaryResources.types.percent',
          type: 'string'
        },
        {
          title: 'Иной тип материала',
          path: 'secondaryResources.types.otherSecondaryResourceTypeName',
          type: 'string'
        },
        {
          title: 'Не указанные вторичные материальные ресурсы',
          path: 'secondaryResources.notSpecifiedSecondaryResourcesPercent',
          type: 'string'
        },
        // blockProducts
        {
          title: 'Общее количество выпускаемых товаров в год',
          path: 'productsInfo.totalCountPerYear',
          type: 'string'
        },
        {
          title: 'Наименование выпускаемого товара',
          path: 'productsInfo.products.name',
          type: 'string'
        },
        {
          title: 'Объем выпускаемого товара',
          path: 'productsInfo.products.volume',
          type: 'string'
        },
        {
          title: 'Фотографии товара',
          path: 'productsInfo.products.photos.fileName',
          type: 'string'
        },
        {
          title: 'Наименование предоставлемой услуги',
          path: 'productsInfo.providedServices.name',
          type: 'string'
        },
        {
          title: 'Объем предоставляемой услуги',
          path: 'productsInfo.providedServices.volume',
          type: 'string'
        },
        // blockRegionalOperator
        {
          title: 'Наименование регионального оператора',
          path: 'roInfo.name',
          type: 'string'
        },
        {
          title: 'ID регионального оператора',
          path: 'roInfo.roId',
          type: 'string'
        },
        {
          title: 'ИНН регионального оператора',
          path: 'roInfo.inn',
          type: 'string'
        },
        {
          title: 'Наименование зоны деятельности регионального оператора',
          path: 'roInfo.zoneName',
          type: 'string'
        },
        // AdminGeneral
        {
          title: 'ID технического обследования',
          path: 'technicalSurvey.id',
          type: 'string'
        },
        // blockTechnicalSurvey
        {
          title: 'ФИО уполномоченного лица оператора объекта по обращению с ТКО, осуществляющего проведение технического обследования',
          path: 'technicalSurvey.operatorRepresentativeName',
          type: 'string'
        },
        {
          title: 'Должность уполномоченного лица оператора объекта по обращению с ТКО, осуществляющего проведение технического обследования',
          path: 'technicalSurvey.operatorRepresentativePosition',
          type: 'string'
        },
        {
          title: 'ФИО уполномоченного лица регионального оператора, участвующего в проведении технического обследования',
          path: 'technicalSurvey.roRepresentativeName',
          type: 'string'
        },
        {
          title: 'Должность уполномоченного лица регионального оператора, участвующего в проведении технического обследования',
          path: 'technicalSurvey.roRepresentativePosition',
          type: 'string'
        },
        {
          title: 'Наименование органа местного самоуправления (ОМСУ) населенного пункта, на территории которого расположен объект, участвующего в проведении технического обследования',
          path: 'technicalSurvey.omsuName',
          type: 'string'
        },
        {
          title: 'ФИО уполномоченного лица ОМСУ, участвующего в проведении технического обследования',
          path: 'technicalSurvey.omsuRepresentativeName',
          type: 'string'
        },
        {
          title: 'Должность уполномоченного лица ОМСУ, участвующего в проведении технического обследования',
          path: 'technicalSurvey.omsuRepresentativePosition',
          type: 'string'
        },
        {
          title: 'Наименование иного органа исполнительной власти, участвующего в проведении технического обследования',
          path: 'technicalSurvey.otherParticipantName',
          type: 'string'
        },
        {
          title: 'ФИО уполномоченного лица иного органа исполнительной власти, участвующего в проведении технического обследования',
          path: 'technicalSurvey.otherParticipantRepresentativeName',
          type: 'string'
        },
        {
          title: 'Должность уполномоченного лица иного органа исполнительной власти, участвующего в проведении технического обследования',
          path: 'technicalSurvey.otherParticipantRepresentativePosition',
          type: 'string'
        },
        {
          title: 'Дата начала проведения технического обследования',
          path: 'technicalSurvey.startDate',
          type: 'date'
        },
        {
          title: 'Дата завершения проведения технического обследования',
          path: 'technicalSurvey.endDate',
          type: 'date'
        },
        {
          title: 'Результаты проведения технического обследования',
          path: 'technicalSurvey.result.value',
          type: 'string'
        },
        {
          title: 'Статус проведения технического осмотра',
          path: 'technicalSurvey.status.value',
          type: 'string'
        },
        {
          title: 'Иные результаты проведения технического обследования',
          path: 'technicalSurvey.otherResult',
          type: 'string'
        }
      ],
      total: 0,
      size: 5,
      page: 1,
      noSymbol: 'Нет',
      yesSymbol: 'Да',
      emptySymbol: '_',
      updatedSymbol: ' к ',
      separationSymbol: ', '
    };
  },
  watch: {
    requestId() {
      this.getHistory();
    },
    page() {
      this.getHistory();
    }
  },
  mounted() {
    this.getHistory();
  },
  methods: {
    paginate(page) {
      this.page = page;
    },

    sortArray(array) {
      if (Array.isArray(array)) {
        array.sort((a, b) => {
          if (
              (typeof a === 'string' && typeof b === 'string') ||
              (typeof a === 'number' && typeof b === 'number')
            ) {
              if (a === b) return 0;
              return a > b ? 1 : -1;
            }
            return 0;
        });
      }

      return array;
    },

    getValue(value, type = 'string') {
      let result = '';

      switch (type) {
        case 'boolean':
          result = value ? this.yesSymbol : this.noSymbol;
          break;
        case 'date':
          if (value) {
            result = new Date(value);
            if (result instanceof Date && !isNaN(result)) {
              result = result.toLocaleDateString('ru');
            } else {
              result = new Date(parseInt(value)).toLocaleDateString('ru')
            }
          }
          break;
        default:
          result = value;
      }

      return result;
    },

    getRecursiveColumns(item, path, type = 'string') {
      if (!item || typeof item !== 'object' || typeof path !== 'string') {
        return null;
      }

      let pathArray = path.split('.');

      for (const [k, v] of pathArray.entries()) {
        if (item.hasOwnProperty(v)) {
          if (typeof item[v] === 'object') {
            return this.getRecursiveColumns(item[v], pathArray.slice(k + 1).join('.'), type);
          } else {
            if (item[v] && typeof item[v] === 'string') {
              try {
                return this.getRecursiveColumns(JSON.parse(item[v]), pathArray.slice(k + 1).join('.'), type);
              } catch (e) {}
            }

            return this.getValue(item[v], type);
          }
        } else if (Array.isArray(item)) {
          let sumStr = '';

          item.forEach((vv, kk) => {
            if (vv.hasOwnProperty(v) && (vv[v] || vv[v] === 0)) {
              if (typeof vv[v] === 'object') {
                const result = this.getRecursiveColumns(vv[v], pathArray.slice(k + 1).join('.'), type);
                if (result || result === 0) {
                  if (sumStr && kk > 0) {
                    sumStr += this.separationSymbol;
                  }
                  sumStr += this.getValue(result, type);
                }
              } else {
                if (sumStr && kk > 0) {
                  sumStr += this.separationSymbol;
                }
                sumStr += this.getValue(vv[v], type);
              }
            }
          });

          return this.sortArray(sumStr.split(this.separationSymbol)).join(this.separationSymbol);
        } else {
          return null;
        }
      }

      return null;
    },

    createItemsArray(items) {
      if (Array.isArray(items)) {
        this.items = [];
        this.hasItems = false;

        items.forEach((item, key) => {
          let icon = '';
          if (item.updateSource && item.updateSource.name === 'MP') {
            icon = 'phone';
          } else if (item.updateSource && item.updateSource.name === 'ARM') {
            icon = 'display';
          }

          if (item.revisionType === 'INSERT') {
            this.hasItems = true;
            this.items.push({
              icon,
              title: `
                Создано (
                  ${item.revisionDateTime ? item.revisionDateTime : ' '}
                )
                ${item.revisionUserName ? item.revisionUserName : ' '}
              `
            });
          } else if (item.revisionType === 'UPDATE' && key > 0) {
            const fields = [];

            this.fields.forEach(field => {
              const next = this.getRecursiveColumns(item, field.path, field.type);
              const prev = this.getRecursiveColumns(items[key - 1], field.path, field.type);

              if (prev && next !== prev) {
                this.hasItems = true;
                fields.push({
                  path: field.path,
                  title: field.title,
                  value: `
                    ${prev || this.emptySymbol}
                    <strong class="text-secondary">
                      ${this.updatedSymbol}
                    </strong>
                    ${next || this.emptySymbol}
                  `
                });
              } else if (next && !prev) {
                this.hasItems = true;
                fields.push({
                  path: field.path,
                  title: field.title,
                  value: next || this.emptySymbol
                });
              }
            });

            this.items.push({
              icon,
              fields,
              title: `
                Обновлено (
                  ${item.revisionDateTime ? item.revisionDateTime : ' '}
                )
                ${item.revisionUserName ? item.revisionUserName : ' '}
              `
            });
          }
        });
      }
    },

    async getHistory() {
      if (this.requestId) {
        this.loading = true;
        try {
          const nextHistory = await $http.get('objects/history?' + new URLSearchParams({
            id: this.requestId,
            page: this.page - 1,
            size: this.size
          }).toString());

          if (nextHistory.data && Array.isArray(nextHistory.data.data)) {
            this.total = nextHistory.data.count;
            const items = nextHistory.data.data
            const prevHistory = this.page > 1 ? await $http.get('objects/history?' + new URLSearchParams({
              id: this.requestId,
              page: this.page - 2,
              size: this.size
            }).toString()) : {};

            if (prevHistory.data && Array.isArray(prevHistory.data.data)) {
              items.unshift(prevHistory.data.data[prevHistory.data.data.length - 1]);
            }

            this.createItemsArray(items);
          }
        } catch (e) {
          $DialogService.showError(e.message);
        }
        this.loading = false;
      }
    }
  }
};
</script>
