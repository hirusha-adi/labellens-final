<script setup>
import { ref } from 'vue'
import ContactForm from './ContactForm.vue'

const submittedDetails = ref(null)
</script>

<template>
  <div class="contact-view">
    <section aria-labelledby="contact-heading">
      <p class="kicker">Get in touch</p>
      <h1 id="contact-heading">Questions, feedback, or a scan that looks wrong?</h1>
      <p>
        Use this demonstration form to describe a scan or suggest an improvement.
        Your acknowledgement appears on this page; no message is sent.
      </p>
    </section>

    <section aria-label="Contact form and acknowledgement">
      <div class="contact-layout">
        <ContactForm
          title="Contact form"
          @submit-form="submittedDetails = $event"
        />
        <div class="contact-sidebar">
          <div aria-live="polite" aria-atomic="true">
            <article
              v-if="submittedDetails"
              class="acknowledgement-card"
              aria-labelledby="acknowledgement-heading"
            >
              <h3 id="acknowledgement-heading">Customer acknowledgement</h3>
              <p><strong>Thank you, {{ submittedDetails.name }}!</strong></p>
              <ul>
                <li><strong>Name:</strong> {{ submittedDetails.name }}</li>
                <li><strong>Email:</strong> {{ submittedDetails.email }}</li>
                <li>
                  <strong>Phone:</strong> {{ submittedDetails.phone || 'Not provided' }}
                </li>
                <li><strong>Products:</strong> {{ submittedDetails.productCount }}</li>
                <li><strong>Reason:</strong> {{ submittedDetails.reason }}</li>
                <li>
                  <strong>Scan date:</strong> {{ submittedDetails.scanDate || 'Not provided' }}
                </li>
                <li>
                  <strong>Topics:</strong> {{ submittedDetails.topics.join(', ') || 'None selected' }}
                </li>
                <li>
                  <strong>Preferred reply:</strong>
                  {{ submittedDetails.replyMethod === 'phone' ? 'Phone' : 'Email' }}
                </li>
                <li>
                  <strong>Consent:</strong> {{ submittedDetails.consent ? 'Yes' : 'No' }}
                </li>
              </ul>
              <p><strong>Message:</strong></p>
              <p class="submitted-message">{{ submittedDetails.message }}</p>
            </article>
          </div>
          <aside class="contact-aside" aria-labelledby="aside-heading">
            <h2 id="aside-heading">About this form</h2>
            <p>
              Include the scan date and affected additive to make your feedback
              specific. Required fields are checked before the acknowledgement
              appears.
            </p>
            <p>
              This student project keeps your form details only on this page.
              Leaving the page clears them; the form does not send email.
            </p>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
