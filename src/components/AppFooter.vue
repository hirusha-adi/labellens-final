<script setup>
import { RouterLink } from 'vue-router'
import logo from '../assets/logo.png'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-grid">
      <div>
        <h3 class="brand">
          <img class="logo" :src="logo" alt="">
          LabelLens
        </h3>
        <p>A student project for decoding packaged food labels.</p>
        <p>&copy; {{ year }} LabelLens.</p>
      </div>
      <div>
        <h3>Explore</h3>
        <p><RouterLink to="/">Search additives</RouterLink></p>
        <p><RouterLink to="/scan">Scan a label</RouterLink></p>
      </div>
      <div>
        <h3>Your visit</h3>
        <p><RouterLink to="/compare">Saved additives</RouterLink></p>
        <p><RouterLink to="/contact">Contact</RouterLink></p>
      </div>
      <div>
        <h3>About the data</h3>
        <p>
          Check additive names and numbers against the ingredients on your label.
          Follow the source links for more detail.
        </p>
      </div>
    </div>
  </footer>
</template>
