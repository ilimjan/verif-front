import { $http } from '../plugins/axios/http';

class InfrastructureObjectService {
  getInfrastructureObjects(page, size, sortBy, search, filter) {
    let requestFilter = null;
    if (
      Object.keys(filter).find(
        key => filter[key] !== null && filter[key] !== undefined
      )
    ) {
      requestFilter = filter;
    }
    return $http.get('objects', {
      params: {
        size: size,
        page: page,
        sort: sortBy,
        search: search,
        filter: requestFilter
      }
    });
  }

  createInfrastructureObject(object) {
    return $http.post('objects', object);
  }

  deleteInfrastructureObject(id) {
    return $http.delete(`objects/${id}`);
  }

  loadInfrastructureObject(objectId) {
    return $http.get('objects/' + objectId);
  }

  updateInfrastructureObject(objectId, object) {
    return $http.patch('objects/' + objectId, object);
  }

  sendToModeration(objectId) {
    return $http.post('objects/' + objectId + '/send-to-moderation');
  }

  requestAudit(objectId) {
    return $http.post('objects/' + objectId + '/request-audit');
  }

  archive(objectId) {
    return $http.post('objects/' + objectId + '/archive');
  }

  reject(objectId, statusChangingReason) {
    return $http.post('objects/' + objectId + '/reject', {
      statusChangingReason
    });
  }

  setVerified(objectId) {
    return $http.post('objects/' + objectId + '/set-verified');
  }

  requestTechnicalSurvey(objectId, statusChangingReason) {
    return $http.post('objects/' + objectId + '/request-technical-survey', {
      statusChangingReason
    });
  }

  startTechnicalSurvey(objectId) {
    return $http.post('survey?objectId=' + objectId);
  }

  getAllInfrastructureObjects() {
    return $http.get('objects/all');
  }

  getInfrastructureObjectsAutocomplete(query) {
    return $http.get('objects/autocomplete', { params: { name: query } });
  }

  getTechnicalSurveyStatuses() {
    return $http.get('survey/statuses');
  }
}

export const $InfrastructureObjectService = new InfrastructureObjectService();
