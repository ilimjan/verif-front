#!/bin/sh
JSON_STRING='window.configs = { \
  "VUE_APP_API_URL":"'"${VUE_APP_API_URL}"'", \
  "VUE_APP_PPK_API_URL":"'"${VUE_APP_PPK_API_URL}"'", \
  "VUE_APP_YANDEX_API_KEY":"'"${VUE_APP_YANDEX_API_KEY}"'" \
}'
sed -i "s@// CONTEXT_VARIABLES_PLACEHOLDER_DO_NOT_TOUCH@${JSON_STRING}@" /usr/share/nginx/html/index.html
exec "$@"
