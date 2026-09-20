import { defineStore } from 'pinia'
import { normalizeCode } from '../utils/additives.js'

export const useFavouritesStore = defineStore('favourites', {
  state: () => ({ items: [] }),
  getters: {
    totalCount(state) {
      return state.items.length
    },
    formattedSummary(state) {
      const count = state.items.length
      if (count === 1) return '1 saved additive'
      return count + ' saved additives'
    },
  },
  actions: {
    addItem(item) {
      const code = normalizeCode(item.code)
      const alreadySaved = this.items.some((saved) => saved.code === code)
      if (code && !alreadySaved) {
        this.items.push({ code, name: item.name })
      }
    },
    removeItem(itemId) {
      const code = normalizeCode(itemId)
      this.items = this.items.filter((item) => item.code !== code)
    },
    resetStore() {
      this.items = []
    },
  },
})
