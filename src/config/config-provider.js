import dotenv from 'dotenv';

dotenv.config();

export const ENVIRONMENT_VARS = {
  VUE_APP_API_URL: 'VUE_APP_API_URL',
  VUE_APP_PPK_API_URL: 'VUE_APP_PPK_API_URL',
  VUE_APP_YANDEX_API_KEY: 'VUE_APP_YANDEX_API_KEY',
  VUE_APP_FS_API_URL: 'VUE_APP_FS_API_URL',
  BASE_URL: 'BASE_URL'
};

export class ConfigProvider {
  static value(name) {
    if (window && window.configs) {
      const envFromContext = window.configs[name];
      if (envFromContext) {
        return envFromContext;
      }
    }
    return process.env[name];
  }
}
