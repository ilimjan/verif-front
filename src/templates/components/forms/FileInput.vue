<template>
  <div class="file-input__wrapper">
    <select-field-checkbox
      v-if="!hideCheckbox"
      :select-fields-array="selectFieldsArray"
      :select-field-name="selectFieldName"
      :select-field-disable="selectFieldDisable"
    ></select-field-checkbox>

    <div class="file-input" v-if="!text" :class="{ error: isError }">
      <div class="file-input__tooltip">
        <span v-if="format"> Файл в формате {{ format }}. </span>
        <span v-if="size"> Размер файла не более {{ size }} Мб. </span>
      </div>
      <label>
        <input
          type="file"
          class="hidden-input"
          @change="loadFile"
          :disabled="disabled"
          :accept="format"
          :value="inputFile"
        />
        <a class="btn btn-lg btn-solid btn-grey" :disabled="disabled">
          <span>Выбрать файл</span>
        </a>
        <span class="file-input__msg">
          <span v-if="!tempValue">
            Файл не выбран
          </span>
          <span v-else>
            <a @click.prevent="downloadFile()" title="Скачать">
              {{ tempValue.fileName }}
            </a>
            <span
              @click.prevent="removeFile()"
              title="Удалить"
              v-if="!disabled"
            >
              <img src="icons/Check-error.svg" />
            </span>
          </span>
        </span>
      </label>
    </div>
    <div v-else class="file-input-text" :class="{ error: isError }">
      <label>
        <input
          type="file"
          class="hidden-input"
          @change="loadFile"
          :disabled="disabled"
          :accept="format"
        />
        <input
          type="text"
          class="inp inp-block"
          disabled
          :value="tempValue ? tempValue.fileName : 'Файл не выбран'"
        />
        <div
          class="file-input-text--download"
          v-if="tempValue"
          title="Скачать"
          @click.prevent="downloadFile()"
        >
          <img src="icons/Download.svg" />
        </div>
        <a :disabled="disabled" class="btn btn-solid btn-grey">
          Выбрать файл
        </a>
      </label>
      <div class="file-input-text__tooltip">
        <span v-if="format"> Файл в формате {{ format }}. </span>
        <span v-if="size"> Размер файла не более {{ size }} Мб. </span>
      </div>
    </div>
  </div>
</template>

<script>
import { $DialogService } from '../../../services/dialog.service';
import { $FileService } from '../../../services/file.service';
import store from '../../../plugins/store/store';
import SelectFieldCheckbox from './SelectFieldCheckbox';

export default {
  name: 'FileInput',
  components: { SelectFieldCheckbox },
  props: {
    selectFieldsArray: {
      type: Array,
      required: false
    },
    selectFieldName: {
      type: String,
      required: false
    },
    selectFieldDisable: {
      type: Boolean,
      required: false
    },
    hideCheckbox: {
      type: Boolean,
      required: false
    },
    value: {
      type: Object,
      required: false
    },
    formats: {
      type: Array,
      required: false
    },
    size: {
      type: Number,
      required: false
    },
    text: {
      type: Boolean,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    required: {
      type: Boolean,
      required: false
    }
  },

  data() {
    return {
      isDirty: false,
      tempValue: null,
      format: null,
      inputFile: ''
    };
  },

  mounted() {
    this.tempValue = this.value;
    if (this.formats) {
      this.format = '';
      for (let i = 0; i < this.formats.length; i++) {
        this.format += '.' + this.formats[i];
        if (i !== this.formats.length - 1) {
          this.format += ',';
        }
      }
    }
  },

  computed: {
    isError: function() {
      if ((this.isDirty || this.storeDirty) && this.required) {
        return !this.tempValue;
      }

      return false;
    },

    storeDirty() {
      return store.state.validationStore.validationEnabled;
    }
  },

  watch: {
    value() {
      this.tempValue = this.value;
    },

    tempValue() {
      this.$emit('input', this.tempValue);
    },

    isError(isError) {
      const titleElements = this.$el.parentElement.querySelectorAll(
        '.form-elem__title'
      );
      if (titleElements && titleElements.length) {
        if (isError) {
          titleElements.forEach(titleElement => {
            titleElement.classList.add('error');
          });
        } else {
          titleElements.forEach(titleElement => {
            titleElement.classList.remove('error');
          });
        }
      }
    }
  },

  methods: {
    removeFile() {
      $FileService
        .deleteFile(this.tempValue.id)
        .then(response => {
          this.tempValue = null;
          this.$emit('input', null);
        })
        .catch(error => {
          $DialogService.showErrorObj(error);
        });
    },

    loadFile(event) {
      let file = event.target.files[0];

      if (!file) {
        $DialogService.showError('Файл не выбран');
        return;
      }

      if (this.size && file.size > this.size * 1024 * 1024) {
        $DialogService.showError('Файл слишком большой!');
        return;
      }

      $FileService
        .upload(file)
        .then(response => {
          this.tempValue = response.data;
          this.$emit('input', this.tempValue);
          file = undefined;
        })
        .catch(error => {
          file = undefined;
          $DialogService.showErrorObj(error);
        });
    },

    async downloadFile() {
      if (this.tempValue) {
        const isPdf = this.tempValue.fileType === 'application/pdf';
        const file = await $FileService.download(this.tempValue, isPdf ? 'arraybuffer' : 'blob');
        if (isPdf && file) {
          this.$emit('onPdfView', {
            file: file,
            name: this.tempValue.fileName
          });
        }
      }
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/vars.scss';

.error .file-input__msg {
  color: $colorErrorHover;
}

.hidden-input {
  visibility: hidden;
  position: absolute;
}

.file-input {
  &__wrapper {
    display: flex;

    div:not(.select-field-checkbox) {
      // not select-field-checkbox
      flex: 1 0 auto;
    }

    .select-field-checkbox {
      padding-top: 14px;
    }
  }

  &__tooltip {
    font-size: $fontSizeSmall;
    color: $colorGray5;
    padding-bottom: 5px;
  }

  &__msg {
    margin-left: 20px;
    color: $colorGray6;

    a {
      cursor: pointer;
    }

    img {
      height: 20px;
      width: 20px;
      vertical-align: text-top;
      cursor: pointer;
    }
  }

  button {
    color: $colorGray6;
    font-weight: 400;
    //padding: 10px 10px;
    padding: 8px 15px;
  }
}

.file-input-text {
  position: relative;

  &__tooltip {
    font-size: $fontSizeSmall;
    color: $colorGray5;
    margin-top: 5px;
  }

  label {
    display: flex;
  }

  input {
    border-right: none;
    border-radius: 5px 0 0 5px;
  }

  a {
    flex: 0 0 auto;
    width: auto;
    padding: 10px 15px;
    border-radius: 0 5px 5px 0;
    border-left: none;
    background-color: $colorGray1;
    color: $colorGray6;
  }

  &--download {
    z-index: 9;
    position: absolute;
    top: 8px;
    right: 140px;
    background-color: $colorGray1;
    cursor: pointer;

    border-radius: 50%;
    height: 24px;
    width: 24px;

    display: flex;
    justify-content: center;
    align-items: center;

    img {
      height: 20px;
      width: 20px;
    }

    &:hover {
      background-color: $colorGray3;
    }
  }
}

a[disabled] {
  background-color: rgba(239, 239, 239, 0.3) !important;
  pointer-events: none;
}
</style>
