<script setup>
import { ref, onUnmounted } from 'vue'

defineProps({ title: String })
const emit = defineEmits(['submit-form'])

const reasonOptions = [
  'General question',
  'Report an incorrect additive match',
  'Feedback on scan accuracy',
  'Partnership or media enquiry',
  'Other',
]
const topicOptions = ['Scanning & OCR', 'Additive information', 'Comparison results', 'Website design']

function createForm() {
  return {
    name: '',
    email: '',
    phone: '',
    productCount: '',
    reason: '',
    scanDate: '',
    topics: [],
    replyMethod: '',
    message: '',
    consent: false,
  }
}

const form = ref(createForm())
const errors = ref({})
const success = ref(false)
let resetTimer

onUnmounted(() => clearTimeout(resetTimer))

function resetForm() {
  form.value = createForm()
  errors.value = {}
  success.value = false
}

function submitForm() {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Enter your full name.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Enter a valid email address.'
  }
  if (form.value.replyMethod !== 'email' && form.value.replyMethod !== 'phone') {
    errors.value.replyMethod = 'Choose how you would like us to reply.'
  }
  const phone = form.value.phone.replaceAll(' ', '')
  if ((form.value.replyMethod === 'phone' || phone) && !/^0\d{9}$/.test(phone)) {
    errors.value.phone = 'Enter a 10-digit Australian phone number starting with 0.'
  }
  if (
    !Number.isInteger(form.value.productCount) ||
    form.value.productCount < 1 ||
    form.value.productCount > 100
  ) {
    errors.value.productCount = 'Enter a whole number from 1 to 100.'
  }
  if (!form.value.reason) {
    errors.value.reason = 'Choose a reason for contacting us.'
  }
  if (!form.value.message.trim()) {
    errors.value.message = 'Enter your question or feedback.'
  }
  if (!form.value.consent) {
    errors.value.consent = 'Please agree so we can respond to your enquiry.'
  }

  if (Object.keys(errors.value).length > 0) {
    return
  }

  emit('submit-form', { ...form.value })
  success.value = true
  // leave time to read the success message before clearing the form
  resetTimer = setTimeout(resetForm, 2000)
}
</script>

<template>
  <form
    class="contact-form"
    aria-labelledby="contact-form-title"
    novalidate
    @submit.prevent="submitForm"
    @reset.prevent="resetForm"
  >
    <h2 id="contact-form-title" class="visually-hidden">{{ title }}</h2>

    <fieldset :disabled="success">
      <legend>Your details</legend>
      <div class="form-grid">
        <div class="field">
          <label for="contact-name">Full name</label>
          <input
            id="contact-name"
            v-model.trim="form.name"
            name="name"
            type="text"
            autocomplete="name"
            maxlength="80"
            required
            :aria-invalid="Boolean(errors.name)"
            aria-describedby="name-error"
          >
          <p v-if="errors.name" id="name-error" class="field-error">{{ errors.name }}</p>
        </div>

        <div class="field">
          <label for="contact-email">Email address</label>
          <input
            id="contact-email"
            v-model.trim="form.email"
            name="email"
            type="email"
            autocomplete="email"
            required
            :aria-invalid="Boolean(errors.email)"
            aria-describedby="email-error"
          >
          <p v-if="errors.email" id="email-error" class="field-error">{{ errors.email }}</p>
        </div>

        <div class="field">
          <label for="contact-phone">
            Phone {{ form.replyMethod === 'phone' ? '' : '(optional)' }}
          </label>
          <input
            id="contact-phone"
            v-model.trim="form.phone"
            name="phone"
            type="tel"
            autocomplete="tel"
            placeholder="0400 000 000"
            :required="form.replyMethod === 'phone'"
            :aria-invalid="Boolean(errors.phone)"
            aria-describedby="phone-error"
          >
          <p v-if="errors.phone" id="phone-error" class="field-error">{{ errors.phone }}</p>
        </div>

        <div class="field">
          <label for="product-count">Number of products you have scanned</label>
          <input
            id="product-count"
            v-model.number="form.productCount"
            name="product-count"
            type="number"
            min="1"
            max="100"
            step="1"
            required
            :aria-invalid="Boolean(errors.productCount)"
            aria-describedby="product-count-error"
          >
          <p v-if="errors.productCount" id="product-count-error" class="field-error">
            {{ errors.productCount }}
          </p>
        </div>
      </div>
    </fieldset>

    <fieldset :disabled="success">
      <legend>Your message</legend>

      <div class="field">
        <label for="contact-reason">Reason for contact</label>
        <select
          id="contact-reason"
          v-model="form.reason"
          name="reason"
          required
          :aria-invalid="Boolean(errors.reason)"
          aria-describedby="reason-error"
        >
          <option value="" disabled>Choose a reason</option>
          <option v-for="reason in reasonOptions" :key="reason" :value="reason">
            {{ reason }}
          </option>
        </select>
        <p v-if="errors.reason" id="reason-error" class="field-error">{{ errors.reason }}</p>
      </div>

      <div class="field">
        <label for="scan-date">Date of the scan you're reporting (optional)</label>
        <input
          id="scan-date"
          v-model="form.scanDate"
          name="scan-date"
          type="date"
          aria-describedby="scan-date-hint"
        >
        <span id="scan-date-hint" class="field-hint">
          Only needed if your message is about a specific scan.
        </span>
      </div>

      <fieldset class="field">
        <legend class="field-legend">Which part of LabelLens is this about?</legend>
        <div class="choice-group">
          <label v-for="topic in topicOptions" :key="topic">
            <input v-model="form.topics" type="checkbox" name="topic" :value="topic">
            {{ topic }}
          </label>
        </div>
      </fieldset>

      <fieldset class="field">
        <legend class="field-legend">Preferred reply method</legend>
        <div class="choice-group choice-group-inline">
          <label>
            <input
              v-model="form.replyMethod"
              type="radio"
              name="reply-method"
              value="email"
              required
              :aria-invalid="Boolean(errors.replyMethod)"
              aria-describedby="reply-method-error"
            >
            Email
          </label>
          <label>
            <input
              v-model="form.replyMethod"
              type="radio"
              name="reply-method"
              value="phone"
              required
              :aria-invalid="Boolean(errors.replyMethod)"
              aria-describedby="reply-method-error"
            >
            Phone
          </label>
        </div>
        <p v-if="errors.replyMethod" id="reply-method-error" class="field-error">
          {{ errors.replyMethod }}
        </p>
      </fieldset>

      <div class="field">
        <label for="contact-message">Message</label>
        <textarea
          id="contact-message"
          v-model="form.message"
          name="message"
          maxlength="600"
          placeholder="Describe what you scanned and what looked wrong, or ask your question here."
          required
          :aria-invalid="Boolean(errors.message)"
          aria-describedby="message-error message-hint"
        ></textarea>
        <p v-if="errors.message" id="message-error" class="field-error">{{ errors.message }}</p>
        <span id="message-hint" class="field-hint">Up to 600 characters.</span>
      </div>

      <div class="field">
        <div class="choice-group">
          <label for="contact-consent">
            <input
              id="contact-consent"
              v-model="form.consent"
              name="consent"
              type="checkbox"
              required
              :aria-invalid="Boolean(errors.consent)"
              aria-describedby="consent-error"
            >
            I agree that these details may be used to respond to my enquiry.
          </label>
        </div>
        <p v-if="errors.consent" id="consent-error" class="field-error">{{ errors.consent }}</p>
      </div>
    </fieldset>

    <p v-if="success" class="success-message" role="status">
      Your demonstration submission is shown below. No message was sent.
    </p>

    <div class="form-actions">
      <button class="btn btn-secondary" type="reset" :disabled="success">Reset</button>
      <button class="btn btn-primary" type="submit" :disabled="success">
        Preview submission
      </button>
    </div>
  </form>
</template>
