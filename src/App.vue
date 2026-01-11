<template>
  <div class="dark-theme min-h-screen bg-[#0f0a1a]">
    <Navigation />
    <router-view />
  </div>
</template>

<script setup>
import Navigation from './components/Navigation.vue'
</script>

<style scoped>
</style>
