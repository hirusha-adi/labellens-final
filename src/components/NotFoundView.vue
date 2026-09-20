<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <p class="kicker">404</p>
    <h1>Page not found</h1>
    <p>Use the navigation above or return to additive search.</p>
    <RouterLink class="btn btn-solid" to="/">Go to Home</RouterLink>
  </section>
</template>
