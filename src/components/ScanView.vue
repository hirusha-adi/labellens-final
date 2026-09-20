<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import workerUrl from 'tesseract.js/dist/worker.min.js?url'
import scanImage from '../assets/scan-label.jpg'
import { useAdditives } from '../composables/useAdditives.js'
import { useFavouritesStore } from '../stores/favourites.js'
import { matchAdditives } from '../utils/additives.js'

const router = useRouter()
const favourites = useFavouritesStore()
const { items, loading, error, load } = useAdditives()

const video = ref(null)
const cameraReady = ref(false)
const openingCamera = ref(false)
const cameraStatus = ref('Allow camera access to preview the ingredients label.')

const photoPreview = ref(null)
const hasPhoto = ref(false)
const labelText = ref('')
const reading = ref(false)
const progress = ref()
const readStatus = ref('')
const readError = ref('')
const selectedCodes = ref([])
const matches = computed(() => matchAdditives(labelText.value, items.value))

let stream = null
let worker = null
let photo = null
let cameraRequest = 0
let disposed = false

// keep existing choices when the text changes and select new matches
watch(matches, (updated, previous) => {
  const nextSelected = []
  for (const item of updated) {
    const isNew = !previous.some((oldItem) => oldItem.code === item.code)
    if (isNew || selectedCodes.value.includes(item.code)) {
      nextSelected.push(item.code)
    }
  }
  selectedCodes.value = nextSelected
})

function stopCamera() {
  cameraRequest += 1
  if (stream) {
    for (const track of stream.getTracks()) {
      track.stop()
    }
  }
  stream = null
  if (video.value) {
    video.value.srcObject = null
  }
  cameraReady.value = false
  openingCamera.value = false
  cameraStatus.value = 'Allow camera access to preview the ingredients label.'
}

function clearPhoto() {
  hasPhoto.value = false
  photo = null
}

async function startCamera() {
  if (openingCamera.value || reading.value) return
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraStatus.value = 'Camera access is unavailable. Upload a photo or paste the ingredients instead.'
    readError.value = cameraStatus.value
    return
  }

  stopCamera()
  clearPhoto()
  readError.value = ''
  const request = cameraRequest
  openingCamera.value = true
  cameraStatus.value = 'Waiting for camera permission…'

  try {
    const openedStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    })
    // camera permission may be granted after the user leaves the page
    if (disposed || request !== cameraRequest) {
      for (const track of openedStream.getTracks()) {
        track.stop()
      }
      return
    }
    stream = openedStream
    video.value.srcObject = stream
    await video.value.play()
    if (!disposed && request === cameraRequest) {
      cameraReady.value = true
    }
  } catch {
    if (!disposed && request === cameraRequest) {
      stopCamera()
      cameraStatus.value = 'The camera could not open. Check camera permission, upload a photo, or paste the ingredients below.'
    }
  } finally {
    if (request === cameraRequest) {
      openingCamera.value = false
    }
  }
}

function releaseWorker() {
  if (worker) {
    worker.terminate().catch(() => {})
    worker = null
  }
}

async function readPhoto() {
  if (!photo || reading.value) return
  reading.value = true
  progress.value = undefined
  readError.value = ''
  readStatus.value = 'Preparing the text reader. The first scan may take a moment.'

  try {
    // use a canvas preview because deakin blocks blob urls
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap
    // the text reader may still work if the preview fails
    const bitmap = await createImageBitmap(photo).catch(() => null)

    // stop if the user has left the scan page
    if (disposed) {
      if (bitmap) bitmap.close()
      return
    }

    // clear the previous preview
    const canvas = photoPreview.value
    canvas.width = 0
    canvas.height = 0

    // draw the selected photo on the canvas
    if (bitmap) {
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      canvas.getContext('2d').drawImage(bitmap, 0, 0)
      bitmap.close()
    }
    hasPhoto.value = true

    const { createWorker } = await import('tesseract.js')
    if (disposed) return
    // catch errors while downloading the language files
    const activeWorker = await new Promise((resolve, reject) => {
      createWorker('eng', 1, {
        // deakin blocks blob workers, so load the script from this site
        // https://github.com/naptha/tesseract.js/blob/master/docs/api.md#createworkeroptions-worker
        workerPath: workerUrl,
        workerBlobURL: false,
        errorHandler: reject,
        logger(message) {
          if (!disposed && message.status === 'recognizing text') {
            progress.value = Math.round(message.progress * 100)
            readStatus.value = `Reading the label: ${progress.value}%`
          }
        },
      }).then(resolve, reject)
    })
    if (disposed) {
      await activeWorker.terminate()
      return
    }
    worker = activeWorker
    const { data } = await worker.recognize(photo)
    if (disposed) return
    labelText.value = data.text.trim()
    if (labelText.value) {
      readStatus.value = 'Text ready. Check it against the label and correct any mistakes.'
    } else {
      readStatus.value = ''
      readError.value = 'No text was found. Try a clearer photo or type the ingredients below.'
    }
  } catch {
    if (!disposed) {
      readStatus.value = ''
      readError.value = 'We could not read this image. Try a sharper photo, check your connection, or paste the ingredients below.'
    }
  } finally {
    releaseWorker()
    if (!disposed) {
      reading.value = false
    }
  }
}

function usePhoto(image) {
  if (reading.value) return
  stopCamera()
  clearPhoto()
  photo = image
  labelText.value = ''
  readPhoto()
}

function uploadPhoto(event) {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file || reading.value) return
  if (!file.type.startsWith('image/')) {
    readError.value = 'Choose an image file such as a JPEG or PNG.'
    return
  }
  usePhoto(file)
}

function capturePhoto() {
  if (!cameraReady.value || reading.value) return
  const canvas = document.createElement('canvas')
  canvas.width = video.value.videoWidth
  canvas.height = video.value.videoHeight
  if (!canvas.width || !canvas.height) {
    readError.value = 'The camera is not ready yet. Wait a moment and try again.'
    return
  }
  canvas.getContext('2d').drawImage(video.value, 0, 0)
  canvas.toBlob((image) => {
    if (disposed) return
    if (image) {
      usePhoto(image)
    } else {
      readError.value = 'The photo could not be captured. Try uploading an image instead.'
    }
  }, 'image/png')
}

function saveSelected() {
  if (!selectedCodes.value.length) return
  for (const item of matches.value) {
    if (selectedCodes.value.includes(item.code)) {
      favourites.addItem(item)
    }
  }
  router.push('/compare')
}

onMounted(load)
onBeforeUnmount(() => {
  disposed = true
  stopCamera()
  clearPhoto()
  releaseWorker()
})
</script>

<template>
  <section aria-labelledby="scan-heading">
    <div class="scan-intro">
      <div>
        <p class="kicker">Scan a label</p>
        <h1 id="scan-heading">Scan and confirm the ingredients</h1>
        <p>
          Take a clear photo of the ingredients panel or upload one you already have.
          Check the detected text and additives before saving your results.
        </p>
      </div>
      <div class="scan-steps" aria-hidden="true">
        <span class="scan-step is-active"></span>
        <span class="scan-step" :class="{ 'is-active': labelText.trim() }"></span>
      </div>
    </div>

    <div class="scan-layout">
      <div class="camera-panel">
        <div class="camera-frame">
          <video
            v-show="!hasPhoto"
            id="camera-preview"
            ref="video"
            autoplay
            playsinline
            muted
            aria-label="Live camera preview"
          ></video>
          <canvas
            v-show="hasPhoto"
            ref="photoPreview"
            class="label-photo"
            role="img"
            aria-label="Ingredients label selected for text recognition"
          ></canvas>
          <img
            v-if="!cameraReady && !hasPhoto"
            class="camera-example"
            :src="scanImage"
            alt="A shopper choosing a packaged food container in a supermarket"
            width="1600"
            height="1067"
          >
          <div v-if="!cameraReady && !hasPhoto" class="camera-overlay">
            <p role="status">{{ cameraStatus }}</p>
            <button
              class="btn btn-primary"
              type="button"
              :disabled="openingCamera || reading"
              @click="startCamera"
            >
              {{ openingCamera ? 'Opening camera…' : 'Enable camera' }}
            </button>
          </div>
        </div>
        <div class="camera-actions">
          <button
            v-if="cameraReady || openingCamera"
            class="btn btn-camera-cancel"
            type="button"
            @click="stopCamera"
          >
            Stop camera
          </button>
          <RouterLink v-else class="btn btn-camera-cancel" to="/">Cancel</RouterLink>
          <button
            v-if="hasPhoto"
            class="btn btn-camera-capture"
            type="button"
            :disabled="reading"
            @click="startCamera"
          >
            Take another photo
          </button>
          <button
            v-else
            class="btn btn-camera-capture"
            type="button"
            :disabled="!cameraReady || reading"
            @click="capturePhoto"
          >
            Capture label
          </button>
        </div>
        <label class="upload-label" for="label-photo">Or upload a photo of the ingredients</label>
        <input
          id="label-photo"
          class="photo-input"
          type="file"
          accept="image/*"
          :disabled="reading"
          @change="uploadPhoto"
        >
        <p class="scan-help">
          Use good lighting and keep the full ingredient list in focus.
          Photos are processed in your browser.
        </p>
        <div v-if="readStatus || reading" class="read-status" role="status" aria-live="polite">
          <p>{{ readStatus }}</p>
          <progress
            v-if="reading"
            :value="progress"
            max="100"
            aria-label="Text recognition progress"
          ></progress>
        </div>
        <div v-if="readError" class="scan-error" role="alert">
          <p>{{ readError }}</p>
          <button
            v-if="hasPhoto"
            class="btn btn-camera-cancel"
            type="button"
            :disabled="reading"
            @click="readPhoto"
          >
            Retry reading photo
          </button>
        </div>
      </div>

      <div class="confirm-panel">
        <label class="text-label" for="label-text">Ingredients text</label>
        <p id="text-help">
          Correct the scanned text, or paste or type ingredients here.
          Additive codes and names are matched automatically.
        </p>
        <textarea
          id="label-text"
          v-model="labelText"
          class="confirm-note ingredients-text"
          rows="7"
          :readonly="reading"
          aria-describedby="text-help"
          placeholder="For example: water, sugar, citric acid (330), sodium benzoate (211)"
        ></textarea>
        <div class="confirm-head">
          <h2>Detected on this label</h2>
          <span class="tag">{{ matches.length }} found</span>
        </div>
        <p v-if="loading" role="status">Loading the additive directory…</p>
        <div v-else-if="error" role="alert">
          <p>The additive directory could not be loaded. Your text is still available above.</p>
          <button class="btn btn-secondary" type="button" @click="load(true)">
            Retry loading additives
          </button>
        </div>
        <template v-else>
          <p v-if="!labelText.trim()">
            Your detected additives will appear here after scanning or entering ingredients.
          </p>
          <p v-else-if="!matches.length" role="status">
            No matching additives found. Check the text and try an additive name,
            INS number or E number. This does not mean the food is additive-free.
          </p>
          <template v-else>
            <p>Compare these matches with your label. Deselect anything that was read incorrectly.</p>
            <div class="additive-list">
              <label
                v-for="item in matches"
                :key="item.code"
                class="additive-item match-item"
              >
                <input v-model="selectedCodes" type="checkbox" :value="item.code">
                <span class="item-copy">
                  <strong>{{ item.name }}</strong>
                  <span v-if="item.matchType === 'code'">Matched by additive code</span>
                  <span v-else>Matched by ingredient name</span>
                </span>
              </label>
            </div>
          </template>
        </template>
        <div class="confirm-actions scan-confirm-actions">
          <button
            class="btn btn-solid"
            type="button"
          :disabled="selectedCodes.length === 0 || reading || loading || Boolean(error)"
            @click="saveSelected"
          >
            Save selected &amp; compare
            <span v-if="selectedCodes.length"> ({{ selectedCodes.length }})</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.label-photo {
  display: block;
  width: 100%;
  height: 20rem;
  object-fit: contain;
}

.upload-label,
.text-label {
  display: block;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.text-label {
  margin-top: 0;
  font-size: 1.25rem;
}

.photo-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid currentColor;
  border-radius: 0.25rem;
  color: inherit;
  font: inherit;
}

.photo-input::file-selector-button {
  margin-right: 0.5rem;
  padding: 0.5rem;
  border: 0;
  border-radius: 0.25rem;
  background: var(--white);
  color: var(--teal);
  font: inherit;
  cursor: pointer;
}

.scan-help {
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.read-status,
.scan-error {
  margin-top: 1rem;
}

progress {
  width: 100%;
  accent-color: var(--orange);
}

.ingredients-text {
  min-height: 10rem;
  resize: vertical;
}

.match-item {
  cursor: pointer;
}

.match-item input {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  accent-color: var(--teal);
}

.scan-confirm-actions {
  margin-top: 1.25rem;
}
</style>
