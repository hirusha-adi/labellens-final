import { ref, onMounted, onUnmounted } from 'vue'

export function useLoadJson(url) {
  const data = ref(null)
  const error = ref('')
  const loading = ref(false)
  const controller = new AbortController()

  async function reload() {
    if (loading.value) return
    loading.value = true
    error.value = ''

    try {
      const response = await fetch(url, { signal: controller.signal })
      if (response.status === 404) {
        throw new Error('No detailed entry has been published for this additive yet.')
      }
      if (!response.ok) {
        throw new Error('Could not load this additive. Please try again.')
      }

      const json = await response.json()
      if (!json || typeof json !== 'object' || Array.isArray(json)) {
        throw new Error('The additive details have an unexpected format.')
      }
      data.value = json
    } catch (cause) {
      if (!controller.signal.aborted) {
        error.value = cause.message || 'Could not load this additive.'
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(reload)
  // stop the request when the card is removed
  onUnmounted(() => controller.abort())

  return { data, error, loading, reload }
}
