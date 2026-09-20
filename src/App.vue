<script setup>
import { watchEffect } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useThemeStore } from './stores/theme.js'

const theme = useThemeStore()
watchEffect(() => {
  document.documentElement.className = theme.currentThemeClass
})

function skipToContent() {
  document.getElementById('main').focus()
}
</script>

<template>
  <a class="skip-link" href="#main" @click.prevent="skipToContent">Skip to main content</a>
  <div class="site">
    <AppHeader />
    <main id="main" tabindex="-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
