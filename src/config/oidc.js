import { ConfigProvider, ENVIRONMENT_VARS } from './config-provider';

export const oidcSettings = {
  authority: ConfigProvider.value(ENVIRONMENT_VARS.VUE_APP_PPK_API_URL),
  clientId: 'rt-verification-tko-api',
  redirectUri: `${window.location.origin}/${ConfigProvider.value(ENVIRONMENT_VARS.BASE_URL)}/callback`.replace(
    /([^:]\/)\/+/g,
    '$1'
  ),
  popupRedirectUri: `${window.location.origin}/${ConfigProvider.value(ENVIRONMENT_VARS.BASE_URL)}/callback`.replace(
    /([^:]\/)\/+/g,
    '$1'
  ),
  responseType: 'token id_token',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  automaticSilentSignin: false,
  silentRedirectUri: `${window.location.origin}/${ConfigProvider.value(ENVIRONMENT_VARS.BASE_URL)}/silent-renew`.replace(
    /([^:]\/)\/+/g,
    '$1'
  )
};
