<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <loader :loading="loading"></loader>

        <div class="modal">
          <div class="modal__header">
            <span class="modal__header--title">
              <slot name="header">
                Импорт
              </slot>
            </span>
            <img
              src="icons/Close.svg"
              height="24"
              width="24"
              @click="$emit('close')"
            />
          </div>
          <div class="modal__body import">
            <div v-if="isError" class="import__title">
              <img src="icons/Check-error.svg" />
              <div>
                Импорт не выполнен! <br />
                Ошибка формата файла!
              </div>
            </div>

            <div v-if="isSuccess" class="import__title">
              <img src="icons/Check-yes.svg" />
              <div>
                Импорт успешно выполнен!
              </div>
            </div>

            <div v-if="!isError && !isSuccess">
              <label class="import__wrapper" v-if="!loadedFile">
                <input
                  type="file"
                  class="import__input"
                  @change="loadFile"
                  :accept="accept"
                />

                <div class="import__title">
                  <img src="icons/File.svg" />
                  <div>
                    Выберите файл или перетащите его в эту область
                  </div>
                </div>

                <div class="import__tooltip">
                  Для загрузки доступны файлы в форматах {{ accept }}
                </div>

                <a class="btn btn-lg btn-solid btn-grey">
                  <span>Выбрать файл</span>
                </a>
              </label>
              <div v-else>
                <div class="import__file">
                  <div>
                    {{ loadedFile.name }}
                  </div>
                  <div>{{ (loadedFile.size / 1024 / 1024).toFixed(2) }} Мб</div>
                  <div>
                    <img src="icons/Check-error.svg" @click="removeFile" />
                  </div>
                </div>
                <div class="import__btn">
                  <a
                    class="btn btn-lg btn-solid btn-grey"
                    @click="importFromFile"
                  >
                    <span>Выполнить импорт</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Loader from '../Loader';
import { $FileService } from '../../../services/file.service';
import { $ExportService } from '../../../services/export.service';
import { $DialogService } from '../../../services/dialog.service';
import { $http } from '../../../plugins/axios/http';

export default {
  name: 'ImportModal',
  components: { Loader },
  props: {
    accept: {
      type: String,
      default: '.xls,.xlsx'
    }
  },

  data() {
    return {
      loading: false,
      loadedFile: undefined,
      isError: false,
      isSuccess: false
    };
  },

  mounted() {},

  updated() {},

  destroyed() {},

  methods: {
    loadFile(event) {
      let file = event.target.files[0];
      let accepts = this.accept.split(',');
      let fileNameParts = file.name.split('.');
      let fileFormat = '.' + fileNameParts[fileNameParts.length - 1];

      if (!accepts.includes(fileFormat)) {
        this.isError = true;
        return;
      }

      this.loadedFile = event.target.files[0];
    },

    removeFile() {
      this.loadedFile = undefined;
    },

    parseXMLDom() {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsText(this.loadedFile);
        fileReader.onload = () => {
          resolve(new DOMParser().parseFromString(fileReader.result, 'application/xml'));
        }
        fileReader.onerror = (error) => {
          reject(error);
        }
      });
    },

    async importFromFile() {
      this.loading = true;

      if (!this.loadedFile) {
        $DialogService.showError('Файл не выбран');
        return;
      }

      if (this.accept.includes('.xml')) {
        const coords = await this.getXMLCoords();
        this.$emit('apply', coords);
        this.loading = false;
        return;
      }

      $ExportService
        .importXlsx(this.loadedFile)
        .then(response => {
          this.loading = false;
          this.removeFile();
          this.isSuccess = true;
        })
        .catch(error => {
          this.loading = false;
          this.removeFile();
          this.isError = true;
        });
    },

    async getXMLCoords() {
      const coords = [];
      const dom = await this.parseXMLDom();
      const objectParts = dom.querySelectorAll('object_parts ordinate');
      const contoursLocation = dom.querySelectorAll('contours_location ordinate');

      objectParts.forEach((node) => {
        const coord = {
          number: null,
          x: null,
          y: null
        };

        node.children.forEach((child) => {
          switch (child.tagName) {
            case 'ord_nmb':
              coord.number = child.textContent + '.' + 1;
              break;
            case 'x':
              coord.x = child.textContent;
              break;
            case 'y':
              coord.y = child.textContent;
              break;
          }
        });

        if (coord.number && coord.x && coord.y) {
          coords.push(coord);
        }
      });

      contoursLocation.forEach((node) => {
        const coord = {
          number: null,
          x: null,
          y: null
        };

        node.children.forEach((child) => {
          switch (child.tagName) {
            case 'ord_nmb':
              coord.number = child.textContent + '.' + 2;
              break;
            case 'x':
              coord.x = child.textContent;
              break;
            case 'y':
              coord.y = child.textContent;
              break;
          }
        });

        if (coord.number && coord.x && coord.y) {
          coords.push(coord);
        }
      });

      return coords;
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/modal.scss';
@import '../../../assets/style/vars';

.import {
  height: 100%;
  margin: 20px 10px !important;
  background-color: $colorGray1;
  border: 1px dashed $colorGray3;
  border-radius: 4px;

  &__wrapper {
    display: block;
    height: 100%;
    width: 100%;
    text-align: center;
    position: relative;
  }

  &__input {
    display: block;
    height: 100%;
    width: 100%;
    position: absolute;
    opacity: 0;
  }

  &__title {
    display: flex;
    font-size: $fontSizeLarge;
    font-weight: bold;
    padding-right: 15px;
    align-items: center;
    justify-content: center;
    text-align: left;
    margin-top: 0px;

    img {
      height: 48px;
      width: 48px;
      margin-right: 10px;
    }
  }

  &__tooltip {
    font-size: $fontSizeSmall;
    color: $colorGray5;
    margin: 15px 0 !important;
  }

  &__file {
    display: flex;
    align-items: center;

    div:not(:last-of-type) {
      flex: 1 0;
      margin-right: 40px;
    }
  }

  &__btn {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
