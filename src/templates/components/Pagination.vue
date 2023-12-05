<!-- https://github.com/cornflourblue/jw-vue-pagination/blob/master/src/JwPagination.vue -->
<template>
  <ul
    v-if="pager.pages && pager.pages.length"
    class="pagination pagination-lg"
    :style="ulStyles"
  >
    <!--
        <li class="page-item first" :class="{'disabled': pager.currentPage === 1}" :style="liStyles">
            <a class="page-link" @click="setPage(1)" :style="aStyles">{{labels.first}}</a>
        </li>
        -->
    <li
      class="page-item previous first"
      :class="{ disabled: pager.currentPage === 1 }"
      :style="liStyles"
    >
      <a
        class="page-link"
        @click="setPage(pager.currentPage - 1)"
        :style="aStyles"
        >{{ labels.previous }}</a
      >
    </li>
    <li
      v-for="page in pager.pages"
      :key="page"
      class="page-item page-number"
      :class="{ active: pager.currentPage === page }"
      :style="liStyles"
    >
      <a class="page-link" @click="setPage(page)" :style="aStyles">{{
        page
      }}</a>
    </li>
    <li
      class="page-item next last"
      :class="{ disabled: pager.currentPage === pager.totalPages }"
      :style="liStyles"
    >
      <a
        class="page-link"
        @click="setPage(pager.currentPage + 1)"
        :style="aStyles"
        >{{ labels.next }}</a
      >
    </li>
    <!--
        <li class="page-item last" :class="{'disabled': pager.currentPage === pager.totalPages}" :style="liStyles">
            <a class="page-link" @click="setPage(pager.totalPages)" :style="aStyles">{{labels.last}}</a>
        </li>
        -->
    <li class="showed-count">Показано {{ itemsCount }} из {{ itemsTotal }}</li>
  </ul>
</template>

<script>
import paginate from 'jw-paginate';

const defaultLabels = {
  first: 'Первая',
  last: 'Последняя',
  previous: 'Назад',
  next: 'Далее'
};

const defaultStyles = {
  ul: {
    margin: 0,
    padding: 0,
    display: 'flex'
  },
  li: {
    listStyle: 'none',
    display: 'inline',
    textAlign: 'center'
  },
  a: {
    cursor: 'pointer',
    padding: '6px 12px',
    display: 'block',
    float: 'left'
  }
};

export default {
  props: {
    itemsCount: 0,
    itemsTotal: {
      type: Number,
      required: true
    },
    initialPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    maxPages: {
      type: Number,
      default: 10
    },
    labels: {
      type: Object,
      default: () => defaultLabels
    },
    styles: {
      type: Object
    },
    disableDefaultStyles: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      pager: {},
      ulStyles: {},
      liStyles: {},
      aStyles: {}
    };
  },

  created() {
    if (!this.$listeners.changePage) {
      console.error('Missing required event listener: "changePage"');
    }

    if (!this.disableDefaultStyles) {
      this.ulStyles = defaultStyles.ul;
      this.liStyles = defaultStyles.li;
      this.aStyles = defaultStyles.a;
    }

    if (this.styles) {
      this.ulStyles = { ...this.ulStyles, ...this.styles.ul };
      this.liStyles = { ...this.liStyles, ...this.styles.li };
      this.aStyles = { ...this.aStyles, ...this.styles.a };
    }

    this.setPage(this.initialPage);
  },

  methods: {
    setPage(page) {
      const { itemsTotal, pageSize, maxPages } = this;
      this.pager = paginate(itemsTotal, page, pageSize, maxPages);
      this.$emit('changePage', page - 1);
    }
  },

  watch: {
    itemsTotal() {
      this.setPage(this.initialPage);
    }
  }
};
</script>

<style scoped lang="scss">
@import './../../assets/style/pagination.scss';
.showed-count {
  align-self: center;
  margin-left: auto;
}
</style>
