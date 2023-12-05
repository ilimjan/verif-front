<template>
  <div class="photos-input">
    <select-field-checkbox
      v-if="!hideCheckbox"
      :select-fields-array="selectFieldsArray"
      :select-field-name="selectFieldName"
      :select-field-disable="selectFieldDisable"
    ></select-field-checkbox>

    <label
      v-for="fileInfo in tempValue"
      :key="fileInfo.id"
      class="photo"
      @click="openPhotoModal(fileInfo)"
    >
      <img class="photo__img" :src="getPhotoUrl(fileInfo)" />

      <img
        class="photo__remove"
        v-if="!disabled"
        src="icons/Check-error.svg"
        title="Удалить"
        @click.stop="removeFile(fileInfo)"
      />
    </label>

    <label class="photo photo--empty" :disabled="disabled">
      <input
        type="file"
        class="hidden-input"
        @change="loadFile"
        :disabled="disabled"
        accept=".png,.jpg,.jpeg"
        multiple
      />
      <img src="icons/Circle-plus.svg" />
    </label>

    <photo-modal
      v-if="showModal"
      :file-info="modalFileInfo"
      @close="showModal = false"
      @apply="showModal = false"
    ></photo-modal>
  </div>
</template>

<script>
import PhotoModal from '../modal/PhotoModal';
import { $DialogService } from '../../../services/dialog.service';
import { $FileService } from '../../../services/file.service';
import SelectFieldCheckbox from './SelectFieldCheckbox';
import { $ObjectUtils } from '@/services/utils.service';

export default {
  name: 'PhotosInput',
  components: { PhotoModal, SelectFieldCheckbox },
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
      type: Array,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    }
  },

  data() {
    return {
      tempValue: [],
      showModal: false,
      modalFileInfo: undefined,
      intervalId: undefined
    };
  },

  mounted() {
    this.intervalId = window.setInterval(() => {
      if (this.value !== undefined) {
        this.tempValue = this.value;
        window.clearInterval(this.intervalId);
        this.intervalId = undefined;
      }
    }, 300);
  },

  destroyed() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  },

  // это правильное решение, но оно срабатывает через раз (какой-то баг Vue)
  // watch: {
  //
  //     value: {
  //         handler(val) {
  //           this.tempValue = $ObjectUtils.copyObject(this.value);
  //           this.counter++;
  //           },
  //         deep: true
  //     }
  // },

  methods: {
    loadFile(event) {
      let files = event.target.files;

      if (!files.length) {
        $DialogService.showError('Файл не выбран');
      } else {
        files.forEach(file => {
          if (file.size > 2000000) {
            $DialogService.showError('Файл слишком большой!');
            return;
          }

          $FileService
            .upload(file)
            .then(response => {
              this.tempValue.push(response.data);
              this.$emit('input', this.tempValue);
              file = undefined;
            })
            .catch(error => {
              file = undefined;
              $DialogService.showErrorObj(error);
            });
        });
      }
    },

    removeFile(file) {
      $FileService
        .deleteFile(file.id)
        .then(response => {
          this.tempValue = this.tempValue.filter(f => f.id !== file.id);
          this.$emit('input', this.tempValue);
        })
        .catch(error => {
          $DialogService.showErrorObj(error);
        });
    },

    getPhotoUrl(fileInfo) {
      return $FileService.getImageUrl(fileInfo.id);
    },

    openPhotoModal(fileInfo) {
      this.modalFileInfo = fileInfo;
      this.showModal = true;
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/vars.scss';

.hidden-input {
  visibility: hidden;
  position: absolute;
}

.photos-input {
  display: grid;
  grid-template-columns: repeat(auto-fill, 68px);
  grid-gap: 20px;

  .select-field-checkbox {
    padding-top: 14px;
  }

  margin-bottom: 15px;
}

.photo {
  border-radius: 4px;
  width: 68px;
  height: 68px;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: $fontSizeSmall;

  position: relative;

  &--empty {
    border: 1px dashed $colorSecondary;

    &[disabled] {
      border: 1px dashed $colorGray3;

      img {
        display: none;
      }
    }
  }

  &__img {
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }

  &__remove {
    position: absolute;

    height: 16px;
    width: 16px;
    top: 3px;
    right: 3px;
  }
}
</style>
