<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import logo from '../assets/logo.png'
import { useThemeStore } from '../stores/theme.js'
import { useFavouritesStore } from '../stores/favourites.js'

const theme = useThemeStore()
const favourites = useFavouritesStore()
const menuOpen = ref(false)
const route = useRoute()

// close the mobile menu when the page changes
watch(() => route.path, () => {
  menuOpen.value = false
})
</script>

<template>
  <header class="site-header">
    <RouterLink class="brand" to="/">
      <img class="logo" :src="logo" alt="">
      LabelLens
    </RouterLink>
    <nav
      id="main-nav"
      class="site-nav"
      :class="{ 'is-open': menuOpen }"
      aria-label="Main navigation"
    >
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/scan">Scan</RouterLink>
      <RouterLink to="/compare">
        Compare <span class="count-badge" aria-live="polite">{{ favourites.totalCount }}</span>
      </RouterLink>
      <RouterLink to="/contact">Contact</RouterLink>
    </nav>
    <button
      class="btn btn-secondary theme-toggle"
      type="button"
      aria-label="Dark mode"
      :aria-pressed="theme.isDarkMode"
      :title="theme.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="theme.toggleDarkMode"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <g v-if="theme.isDarkMode">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </g>
        <path v-else d="M21 12.8A9 9 0 1 1 11.2 3A7 7 0 0 0 21 12.8Z" />
      </svg>
    </button>
    <button
      class="btn btn-secondary menu-toggle"
      type="button"
      :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
      :aria-expanded="menuOpen"
      aria-controls="main-nav"
      @click="menuOpen = !menuOpen"
    >
      Menu
    </button>
  </header>
</template>
