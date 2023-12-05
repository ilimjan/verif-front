<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal modal--photo">
          <img
            class="photo__close"
            src="icons/Close.svg"
            height="24"
            width="24"
            @click="$emit('close')"
          />

          <div v-if="!map">
            <div class="photo__img-wrapper">
              <img class="photo__img" :src="getPhotoUrl()" />
            </div>
            <div class="photo__info">
              <div class="photo__title">
                {{ fileInfo.fileName }}
              </div>
              <div class="photo__details">
                Описание отсутствует
              </div>
              <div class="photo__footer">
                <div class="photo__address">
                  <img src="icons/Marker.svg" height="24" width="24" />
                  <span>
                    Название местоположения не указано
                  </span>
                  <span class="photo__details">
                    <span v-if="fileInfo.latitude && fileInfo.longitude">
                      ({{ fileInfo.latitude }}, {{ fileInfo.longitude }})
                    </span>
                    <span v-else>
                      (Координаты не указаны)
                    </span>
                  </span>
                </div>
                <div class="photo__actions">
                  <button
                    class="btn btn-lg btn-solid btn-grey"
                    @click="toggleMap()"
                  >
                    <span>Показать на карте</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="photo__map">
              <loader :loading="ymapLoading"></loader>
              <yandex-map :coords="coords" :zoom="16" :controls="[]">
                <ymap-marker :marker-id="fileInfo.id" :coords="coords" />
              </yandex-map>
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

export default {
  name: 'PhotoModal',
  components: { Loader },
  props: {
    fileInfo: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      map: false,
      ymapLoading: false
    };
  },

  computed: {
    coords: function() {
      return [this.fileInfo.latitude, this.fileInfo.longitude];
    }
  },

  mounted() {},

  updated() {},

  destroyed() {},

  methods: {
    toggleMap() {
      this.map = !this.map;
      if (this.map) {
        this.ymapLoading = true;

        // Ждем пока карта загрузится (показываем спиннер)
        let intervalId = window.setInterval(() => {
          if (document.getElementsByClassName('ymap-markers').length > 0) {
            this.ymapLoading = false;
            window.clearInterval(intervalId);
          }
        }, 300);
      }
    },

    getPhotoUrl() {
      return $FileService.getImageUrl(this.fileInfo.id);
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../../assets/style/modal.scss';
@import '../../../assets/style/vars';

.photo {
  &__img {
    height: 100%;
    max-height: 70vh;
    max-width: 100%;
  }
  &__img-wrapper {
    //height: 387px;
    width: 100%;
    background-color: $colorGray6;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__close {
    z-index: 10;
    position: absolute;
    top: 8px;
    right: 10px;
    background-color: $colorGray3;
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
      background-color: $colorGray1;
    }
  }

  &__info {
    padding: 20px;
  }

  &__title {
    font-size: $fontSizeLargePlus;
    color: $colorGray6;
    font-weight: bold;
    margin-bottom: 5px;
  }

  &__details {
    font-size: $fontSizeLarge;
    color: $colorGray5;
  }

  &__footer {
    display: flex;
    //margin-top: 5px;
  }

  &__address {
    display: flex;
    align-items: center;
    font-size: $fontSizeLarge;

    span {
      margin-right: 10px;
    }

    img {
      height: 16px;
      width: 16px;
      margin-bottom: 3px;
    }
  }

  &__actions {
    flex: 1 0;
    text-align: right;
  }

  &__map {
    height: 500px;
    //background-color: $colorPrimary;
  }
}
</style>
