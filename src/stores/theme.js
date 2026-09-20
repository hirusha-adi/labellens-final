import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({ isDarkMode: false }),
  getters: {
    currentThemeClass(state) {
      return state.isDarkMode ? 'theme-dark' : 'theme-light'
    },
  },
  actions: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
    },
  },
})
