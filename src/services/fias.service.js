import { $http } from '../plugins/axios/http';

class FiasService {
  findData(query) {
    return $http.get('fias/search', {
      params: {
        query: query
      }
    });
  }

  geolocate(latitude, longitude) {
    return $http.get('fias/geolocate', {
      params: {
        latitude: latitude,
        longitude: longitude
      }
    });
  }

  findByInn(inn) {
    return $http.get('fias/inn', {
      params: {
        inn: inn
      }
    });
  }
}

export const $FiasService = new FiasService();
