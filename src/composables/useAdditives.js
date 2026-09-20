import { ref } from 'vue'
import { SUMMARY_URL, normalizeCode } from '../utils/additives.js'

// home and scan share this list, so it only needs to load once
const items = ref([])
const loading = ref(false)
const error = ref('')

async function load(retry = false) {
  if (loading.value) return
  if (items.value.length && !retry) return

  loading.value = true
  error.value = ''

  try {
    const response = await fetch(SUMMARY_URL)
    if (!response.ok) {
      throw new Error('Could not load the additive directory. Please try again.')
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      throw new Error('The additive directory has an unexpected format.')
    }

    const catalogue = []
    for (const item of data) {
      const code = normalizeCode(item.code)
      if (code && typeof item.name === 'string' && item.name.trim()) {
        catalogue.push({ code, name: item.name.trim() })
      }
    }

    if (!catalogue.length) {
      throw new Error('The additive directory is empty.')
    }
    items.value = catalogue
  } catch (cause) {
    error.value = cause.message || 'Could not connect to the additive directory.'
  } finally {
    loading.value = false
  }
}

export function useAdditives() {
  return { items, loading, error, load }
}
