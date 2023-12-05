<template>
  <div class="btn btn--wrap" :class="getStatusColor()">
    {{ status ? status.displayName : 'Черновик' }}
  </div>
</template>

<script>
export default {
  name: 'ObjectStatus',
  props: {
    status: {
      type: Object,
      required: false
    }
  },

  methods: {
    getStatusColor() {
      if (this.status) {
        if (this.status.name === 'VERIFIED') {
          return 'btn-success';
        } else if (this.status.name.includes('TECHNICAL')) {
          return 'btn-warning';
        } else if (
          this.status.name === 'MODERATION' ||
          this.status.name === 'AUDIT'
        ) {
          return 'btn-secondary';
        } else if (this.status.name === 'REJECTED') {
          return 'btn-error';
        }
      }
      return 'btn-grey';
    }
  }
};
</script>

<style scoped></style>
