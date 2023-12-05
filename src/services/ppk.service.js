import { $http } from '../plugins/axios/http';
import { ConfigProvider, ENVIRONMENT_VARS } from '../config/config-provider';

class PpkService {
  findCompany(inn) {
    return $http.post(
      '/regional-operator/api/RegOperator/GetCompaniesByFilter',
      {
        filter: {
          nameOrInn: inn
        }
      },
      { baseURL: ConfigProvider.value(ENVIRONMENT_VARS.VUE_APP_PPK_API_URL) }
    );
  }

  findRegionalOperator(companyId) {
    return $http.post(
      '/regional-operator/api/RegOperator/GetViewByFilter',
      {
        filter: {
          companyId
        }
      },
      { baseURL: ConfigProvider.value(ENVIRONMENT_VARS.VUE_APP_PPK_API_URL) }
    );
  }
}

export const $PpkService = new PpkService();
