<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import heroImage from '../assets/shopper-label.png'
import { useAdditives } from '../composables/useAdditives.js'
import { searchAdditives } from '../utils/additives.js'
import FoodInfo from './FoodInfo.vue'
import FavouritesSummary from './FavouritesSummary.vue'

const { items, loading, error, load } = useAdditives()
const query = ref('')
const selected = ref([])
const searched = ref(false)

const matches = computed(() => {
  if (!query.value.trim()) {
    return []
  }
  return searchAdditives(query.value, items.value)
})
const suggestions = computed(() => matches.value.slice(0, 12))

onMounted(load)

function selectItem(item) {
  const alreadySelected = selected.value.some((entry) => entry.code === item.code)
  if (!alreadySelected) {
    selected.value.push(item)
  }
  query.value = ''
  searched.value = false
}

function removeItem(code) {
  selected.value = selected.value.filter((item) => item.code !== code)
}

function search() {
  searched.value = true
  if (matches.value.length === 1) {
    selectItem(matches.value[0])
  }
}

function tryCode(code) {
  const item = items.value.find((entry) => entry.code === code)
  if (item) {
    selectItem(item)
  }
}
</script>

<template>
  <section class="hero-wrap" aria-labelledby="hero-heading">
    <div class="hero">
      <div class="hero-copy">
        <p class="kicker">Food label decoder</p>
        <h1 id="hero-heading">Read the label. Understand every additive.</h1>
        <p>
          Look up ingredient names and INS / E-numbers, read the source notes,
          and keep a shortlist for your next shop.
        </p>
        <div class="hero-actions">
          <RouterLink class="btn btn-primary" to="/scan">Scan a label</RouterLink>
          <RouterLink class="btn btn-secondary" to="/#search">
            Search an additive
          </RouterLink>
        </div>
      </div>
      <div class="hero-visual">
        <img
          :src="heroImage"
          alt="A shopper reading a food container label in a supermarket"
          width="1125"
          height="750"
        >
      </div>
    </div>
  </section>

  <section id="search" aria-labelledby="search-heading">
    <div class="search-box">
      <p class="kicker">Lookup</p>
      <h2 id="search-heading">Search by name or INS / E-number</h2>
      <p>Select one or more additives to read their details side by side.</p>
      <p v-if="loading" role="status">Loading the additive directory…</p>
      <div v-else-if="error" class="notice" role="alert">
        <p>{{ error }}</p>
        <button class="btn btn-secondary" type="button" @click="load(true)">
          Retry directory
        </button>
      </div>
      <template v-else>
        <form class="search-form" @submit.prevent="search">
          <label class="search-label" for="additive-query">Additive name or code</label>
          <div class="search-row">
            <input
              id="additive-query"
              v-model="query"
              name="q"
              type="search"
              placeholder="e.g. E211, INS 330 or citric acid"
              autocomplete="off"
              aria-describedby="search-help"
            >
            <button class="btn btn-solid" type="submit">Search</button>
          </div>
        </form>
        <p id="search-help" class="search-hint">
          {{ items.length }} additives in the directory. Pick a match below to open its card.
        </p>
        <p v-if="query.trim() && !matches.length" role="status">
          No additives found. Try another name or code.
        </p>
        <p v-else-if="searched && !query.trim()" role="status">
          Enter an additive name or code.
        </p>
        <ul v-if="suggestions.length" class="search-matches" aria-label="Matching additives">
          <li v-for="item in suggestions" :key="item.code">
            <button type="button" @click="selectItem(item)">
              {{ item.name }} <span aria-hidden="true">＋</span>
            </button>
          </li>
        </ul>
        <p v-if="matches.length > suggestions.length" class="search-hint">
          Showing the first {{ suggestions.length }} matches. Keep typing to narrow your search.
        </p>
        <div class="chip-row" aria-label="Try an additive">
          <button class="chip" type="button" @click="tryCode('E330')">E330 - citric acid</button>
          <button class="chip" type="button" @click="tryCode('E621')">E621 - monosodium glutamate</button>
          <button class="chip" type="button" @click="tryCode('E160a')">E160a - carotene</button>
        </div>
      </template>
    </div>
  </section>

  <section v-if="selected.length" aria-labelledby="selected-heading">
    <div class="section-heading">
      <h2 id="selected-heading">
        Selected additives <span class="tag">{{ selected.length }}</span>
      </h2>
      <button class="btn btn-secondary" type="button" @click="selected = []">Clear selection</button>
    </div>
    <div class="chip-row selection-chips" aria-label="Selected additives">
      <button
        v-for="item in selected"
        :key="item.code"
        class="chip"
        type="button"
        :aria-label="`Remove ${item.code} from selection`"
        @click="removeItem(item.code)"
      >
        {{ item.code }} ×
      </button>
    </div>
    <p class="data-note">
      Community source notes may be incomplete or out of date. They are not a
      personal health assessment or confirmation of Australian approval.
    </p>
    <div class="results-grid">
      <FoodInfo v-for="item in selected" :key="item.code" :item="item" />
    </div>
  </section>

  <section aria-label="Your saved additives">
    <FavouritesSummary />
  </section>

  <section aria-labelledby="helps-heading">
    <h2 id="helps-heading">From the label to a clearer picture</h2>
    <div class="feature-grid">
      <article class="feature-card">
        <span class="step-number" aria-hidden="true">01</span>
        <h3>Scan the pack</h3>
        <p>
          Upload or take a photo of the ingredients. Review the recognised text
          and choose the additives that match your label.
        </p>
      </article>
      <article class="feature-card">
        <span class="step-number" aria-hidden="true">02</span>
        <h3>Read the source notes</h3>
        <p>
          Explore uses, origin, dietary information and other available notes,
          with links back to the source data.
        </p>
      </article>
      <article class="feature-card">
        <span class="step-number" aria-hidden="true">03</span>
        <h3>Save and compare</h3>
        <p>
          Add entries to your favourites and compare their details. Your shortlist
          stays with you as you move between pages.
        </p>
      </article>
    </div>
  </section>
</template>
