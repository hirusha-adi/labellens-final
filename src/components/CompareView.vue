<script setup>
import { RouterLink } from 'vue-router'
import { useFavouritesStore } from '../stores/favourites.js'
import FavouritesSummary from './FavouritesSummary.vue'
import FoodInfo from './FoodInfo.vue'

const favourites = useFavouritesStore()
</script>

<template>
  <section aria-labelledby="compare-heading">
    <p class="kicker">Saved for this visit</p>
    <h1 id="compare-heading">Your additive shortlist</h1>
    <p>
      Compare the source notes for additives you have saved from a search or
      confirmed on a label.
    </p>
    <FavouritesSummary />
  </section>
  <section aria-labelledby="cards-heading">
    <h2 id="cards-heading">Compare saved additives</h2>
    <div v-if="!favourites.totalCount" class="empty-state">
      <h3>Your shortlist is empty</h3>
      <p>
        Search an additive and choose “Add to favourites”, or scan a label and
        save the matches you confirm.
      </p>
      <div class="inline-actions">
        <RouterLink class="btn btn-solid" to="/#search">Find additives</RouterLink>
        <RouterLink class="btn btn-secondary" to="/scan">Scan a label</RouterLink>
      </div>
    </div>
    <template v-else>
      <p class="data-note">
        These community source notes are not a personal health assessment.
        A missing entry does not mean an additive is safe or unsafe.
      </p>
      <div class="results-grid">
        <FoodInfo v-for="item in favourites.items" :key="item.code" :item="item" />
      </div>
    </template>
  </section>
</template>
