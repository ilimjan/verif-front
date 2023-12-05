import axios from 'axios';
import store from '../store/store';
import { ConfigProvider, ENVIRONMENT_VARS } from '../../config/config-provider';

let instance = axios.create({
  baseURL: ConfigProvider.value(ENVIRONMENT_VARS.VUE_APP_API_URL)
});

instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Итак, сервер говорит что мы не авторизованы (или шлет invalid_token)
    if (!error.config) {
      // По идее сюда мы не должны заходить никогда. Что делать? Только разлогинить.
      store.dispatch('systemMessages/addError', 'Ошибка в запросе');
      //store.dispatch('oidcStore/removeOidcUser');
    } else if (
      !error.response ||
      error.response.status === 401 ||
      error.response.data.status === 401
    ) {
      // !error.response - это не правильно, но вернуть корректный код при невалидном токене не получилось

      //store.dispatch('systemMessages/addMessage', 'Обновление токена...');
      return store.dispatch('oidcStore/authenticateOidcSilent').then(
        user => {
          // Фоново обновляем токен и повторяем запрос
          error.config.headers['Authorization'] = 'Bearer ' + user.access_token;
          return axios.request(error.config);
        },
        error => {
          // Сессия на сервере авторизации закончилась, редирект на страницу авторизации
          store.dispatch('systemMessages/addMessage', 'Время сессии истекло');
          store.dispatch('oidcStore/authenticateOidc');
        }
      );
    } else if (
      error.response.status === 403 ||
      error.response.data.status === 403
    ) {
      // Нормальная ошибка, говорящая что недостаточно прав
      store.dispatch(
        'systemMessages/addError',
        'У вас недостаточно прав для выполнения этой операции'
      );
    }

    return Promise.reject(error);
  }
);

export const $http = instance;
