import store from '../plugins/store/store';

class DialogService {
  showErrorObj(errorObj) {
    let errorText = errorObj.response
      ? errorObj.response.data.message
      : errorObj.message;
    if (!errorText) {
      errorText = errorObj.response
        ? errorObj.response.data.error
        : errorObj.message;
    }
    if (!errorText) {
      errorText = 'Неизвестная ошибка';
    }
    this.showError(errorText);
  }

  showInfo(message) {
    store.dispatch('systemMessages/addInfo', message);
  }

  showSuccess(message) {
    store.dispatch('systemMessages/addSuccess', message);
  }

  showError(errorText) {
    store.dispatch('systemMessages/addError', errorText);
  }

  showWarning(message) {
    store.dispatch('systemMessages/addWarning', message);
  }

  showMessage(message) {
    store.dispatch('systemMessages/addMessage', message);
  }
}

export const $DialogService = new DialogService();
