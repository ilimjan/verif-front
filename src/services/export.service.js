import { $http } from '../plugins/axios/http';

class ExportService {
  exportXlsx(id) {
    return $http.post('/export/excel/' + id, undefined, {
      responseType: 'blob'
    });
  }

  exportXlsxByEmail(id, email) {
    return $http.post('/export/excel/' + id + '/mail', undefined, {
      params: {
        email: email
      }
    });
  }

  importXlsx(file) {
    let formData = new FormData();

    formData.append('file', file);

    let headers = {};
    headers['Content-Type'] = 'multipart/form-data';

    return $http.post('/import/excel/', formData, {
      headers
    });
  }
}

export const $ExportService = new ExportService();
