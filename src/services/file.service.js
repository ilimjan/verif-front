import { $http } from '../plugins/axios/http';
import { $DialogService } from './dialog.service';
import { ConfigProvider, ENVIRONMENT_VARS } from '../config/config-provider';

const fileDownload = require('js-file-download');

class FileService {
  upload(file) {
    let formData = new FormData();

    formData.append('file', file);

    let headers = {};
    headers['Content-Type'] = 'multipart/form-data';

    let params = {
      //latitude: Math.random(),
      //longitude: Math.random()
    };

    return $http.post('file/upload', formData, {
      headers,
      params
    });
  }

  getUrl(fileId) {
    return 'file/' + fileId;
  }

  getImageUrl(fileInfoId) {
    if (fileInfoId) {
      return (
        ConfigProvider.value(ENVIRONMENT_VARS.VUE_APP_API_URL) +
        'file/image/' +
        fileInfoId
      );
    } else {
      return '/empty.png';
    }
  }

  async download(file, type = 'blob') {
    try {
      const pdf = await $http({
        url: this.getUrl(file.id),
        method: 'GET',
        responseType: type
      });

      if (pdf.data) {
        if (type === 'blob') {
          fileDownload(pdf.data, file.fileName);
        } else {
          return pdf.data
        }
      }
    } catch (error) {
      $DialogService.showErrorObj(error);
    }

    return undefined
  }

  deleteFile(fileId) {
    return $http.delete(this.getUrl(fileId));
  }
}

export const $FileService = new FileService();
