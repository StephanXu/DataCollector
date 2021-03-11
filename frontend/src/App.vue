<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  computed: {
    scrollbarTheme() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    },
  },
  beforeCreate() {
    this.$vuetify.theme.dark = false;
  },
});
</script>
<style>
.light::-webkit-scrollbar {
  width: 15px;
  height: 1px;
}

.light::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.2);
  background: #b0b0b0;
}

.light::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.2);
  background: #f6f6f6;
}

.light::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

.dark::-webkit-scrollbar {
  width: 15px;
  height: 1px;
}

.dark::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #535353;
}

.dark::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #181818;
}

.dark::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}
</style>
