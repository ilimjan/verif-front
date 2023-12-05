[![Build Status](https://dev.azure.com/ReoIT/%D0%A0%D0%BE%D1%81%D1%82%D0%B5%D1%85/_apis/build/status/PPKReo.verif-front?branchName=main)](https://dev.azure.com/ReoIT/%D0%A0%D0%BE%D1%81%D1%82%D0%B5%D1%85/_build/latest?definitionId=93&branchName=main)

Запустить команды находясь в директории с исходниками модуля верификации данных объектов по обращению с ТКО FRONT:

docker build -t verif-front .
docker run -p 8080:80 –env VUE_APP_API_URL=http://185.104.106.158:8084/api/ --env VUE_APP_PPK_API_URL=https://id.test.reo.ru —env VUE_APP_YANDEX_API_KEY=<ключ> verif-front
