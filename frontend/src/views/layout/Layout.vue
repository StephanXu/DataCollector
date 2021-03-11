<template>
  <v-app id="inspire">
    <v-app-bar app clipped-left clipped-right outlined flat dense>

      <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
        <span class="title">食品添加剂检测实验平台</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon @click="switchTheme">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <transition name="slide-fade" mode="out-in">
        <router-view />
      </transition>
    </v-main>

    <v-footer app outlined>
      <v-row no-gutters>
        <v-col class="text-center" cols="12">
          {{ new Date().getFullYear() }} — <strong>Stephan Xu</strong>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    source: String,
  },
  methods: {
    switchTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
  },
});
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.1s ease;
}

.slide-fade-enter {
  transform: translateX(10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}
</style>
