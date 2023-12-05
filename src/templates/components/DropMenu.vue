<template>
  <div class="dropMenu" style="margin-top: 40px; margin-left: -430px">
    <div
      class="position-absolute shadow"
      style="
        width: 430px;
        background-color: white;
      "
    >
      <a
        v-for="filterMode in filterModes"
        :key="filterMode.id"
        @click="changeMode(filterMode)"
        :class="[
          'magnify',
          'btn-filter',
          'text-decoration-none',
          filterMode.isActive && (isAdmin || !isAdmin && filterMode.role !== 'admin') ? 'd-block' : 'd-none'
        ]"
      >
        {{ filterMode.name }}
      </a>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'DropMenu',

  props: {
    value: {
      required: false
    }
  },

  mounted() {
    this.tempValue = this.value;
  },

  computed: {
    ...mapGetters('oidcStore', ['oidcIsAuthenticated', 'oidcUser']),

    isAdmin: function() {
      return (
        this.oidcUser &&
        this.oidcUser.role &&
        (this.oidcUser.role.includes('fs_admin') ||
          this.oidcUser.role.includes('fs_object_analyst'))
      );
    }
  },

  watch: {
    tempValue() {
      if (this.tempValue === '') {
        this.tempValue = null;
      }

      if (this.integer && this.tempValue !== null) {
        this.tempValue = Math.floor(this.tempValue);
      }
      this.$emit('input', this.tempValue);
    },

    value(newValue) {
      this.tempValue = newValue;
    }
  },

  methods: {
    setValue(value) {
      this.tempValue = value;
      this.value = this.tempValue;
    },

    changeMode(mode) {
      this.searchMode.id = mode.id;
      this.searchMode.name = mode.name;
      this.searchMode.mode = mode.mode;
      this.tempValue = this.searchMode;
    }
  },

  data() {
    return {
      tempValue: undefined,
      searchMode: {
        id: 0,
        name: 'Поиск по Наименованию объекта, ID объекта',
        mode: 'address'
      },
      magnigyField: true,
      filterModes: [
        {
          id: 0,
          name: 'Поиск по Наименованию объекта, ID объекта',
          mode: 'address',
          isActive: true
        }
      ]
    };
  }
};
</script>

<style scoped>
</style>
