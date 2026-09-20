<script setup>
import { computed } from 'vue'
import { useLoadJson } from '../composables/useLoadJson.js'
import { DETAIL_URL, normalizeDetail } from '../utils/additives.js'
import { useFavouritesStore } from '../stores/favourites.js'

const props = defineProps({ item: { type: Object, required: true } })
const favourites = useFavouritesStore()
const url = DETAIL_URL + props.item.code + '.json'
const { data, loading, error, reload } = useLoadJson(url)
const info = computed(() => normalizeDetail(data.value, props.item))
const saved = computed(() => {
  return favourites.items.some((item) => item.code === props.item.code)
})
</script>

<template>
  <article class="result-card food-card" :aria-label="item.name">
    <div class="card-heading">
      <span class="tag">{{ item.code }}</span>
      <button
        v-if="saved"
        class="btn btn-secondary"
        type="button"
        :aria-label="`Remove ${item.code} from favourites`"
        @click="favourites.removeItem(item.code)"
      >
        Remove saved
      </button>
      <button
        v-else
        class="btn btn-solid"
        type="button"
        :aria-label="`Add ${item.code} to favourites`"
        @click="favourites.addItem(item)"
      >
        Add to favourites
      </button>
    </div>

    <h3>{{ info.name }}</h3>
    <p v-if="info.category" class="category">{{ info.category }}</p>
    <p v-if="loading" role="status">Loading additive details…</p>
    <div v-else-if="error" class="notice" role="status">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" type="button" @click="reload">
        Retry details
      </button>
    </div>
    <template v-else>
      <p v-if="info.regulatoryNote" class="notice">
        Source's regulatory note: {{ info.regulatoryNote }}
      </p>
      <details
        v-for="section in info.sections"
        :key="section.key"
        :open="section.key === 'side_effects'"
      >
        <summary>{{ section.title }}</summary>
        <p class="detail-text">{{ section.text }}</p>
      </details>
      <p v-if="!info.sections.length">
        No additional notes are published for this additive.
      </p>
      <div v-if="info.sources.length" class="source-links">
        <strong>Source links</strong>
        <a
          v-for="source in info.sources"
          :key="source.url"
          :href="source.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ source.title }} ↗
        </a>
      </div>
    </template>
  </article>
</template>
