<script setup>
import { RouterLink } from 'vue-router'
import { useFavouritesStore } from '../stores/favourites.js'

const favourites = useFavouritesStore()
</script>

<template>
  <aside class="summary-card" aria-label="Saved additives summary">
    <div>
      <p class="kicker">Your shortlist</p>
      <h2 aria-live="polite">{{ favourites.formattedSummary }}</h2>
      <p>Keep interesting additives together as you search and scan. Saved for this visit.</p>
    </div>
    <div class="summary-actions">
      <RouterLink class="btn btn-solid" to="/compare">View saved additives</RouterLink>
      <button
        class="btn btn-secondary"
        type="button"
        :disabled="!favourites.totalCount"
        @click="favourites.resetStore"
      >
        Clear saved
      </button>
    </div>
  </aside>
</template>
