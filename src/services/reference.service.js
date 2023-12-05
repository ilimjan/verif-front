import { $http } from '../plugins/axios/http';

class ReferenceService {
  getAll() {
    return $http.get('references/all');
  }

  getReference(typeName, parentId) {
    return $http.get('references', {
      params: { type: typeName, parentId: parentId }
    });
  }

  getReferenceTypes() {
    return $http.get('references/types');
  }

  getOktmoCodes() {
    return $http.get('references/oktmo');
  }

  getFlowStatuses() {
    return $http.get('references/flowStatuses');
  }

  getOperatorNames() {
    return $http.get('references/operatorNames');
  }

  saveReference(element) {
    return $http.post('references/add', null, {
      params: {
        type: element.type.name,
        value: element.value,
        index: element.index
      }
    });
  }

  removeReference(element) {
    return $http.delete('references/delete', { params: { id: element.id } });
  }

  editReference(element) {
    return $http.post('references/change', null, {
      params: { id: element.id, value: element.value, index: element.index }
    });
  }

  getSourceInformation() {
    return $http.get('references/sourceInformation');
  }

  getUpdateSource() {
    return $http.get('references/updateSource');
  }
}

export const $ReferenceService = new ReferenceService();
