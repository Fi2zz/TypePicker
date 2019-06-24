<template>
  <div id="datepicker"></div>
</template>

<script>
import TypePicker from "../dist/typepicker.esm";

export default {
  name: "TypePicker",
  props: {
    onSelect: Function,
    onRender: Function,
    disables: {
      type: Object,
      default: () => {
        return {
          dates: [],
          days: [],
          to: null,
          from: null
        };
      }
    },
    dates: {
      type: Array,
      default: () => []
    },
    limit: {
      type: [Number, Boolean],
      default: 1
    },
    selection: {
      type: Number,
      default: 1
    },
    views: {
      type: [Number, String],
      default: 1
    },
    i18n: {
      type: Object,
      default: null
    },
    options: Object
  },
  data() {
    return {
      app: null
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.app = new TypePicker({
        el: "#datepicker",
        ...this.options,
        format: this.options.dateFormat || "YYYY-MM-DD"
      });

      this.app.setDates(this.dates);
      this.app.disable(this.disables);
      if (this.i18n) {
        this.app.i18n(this.i18n);
      }
      this.app.onSelect = this.onSelect;
      this.app.onRender = this.onRender;
    });
  }
};
</script>

<style scoped>
@import "../dist/style.css";
</style>
