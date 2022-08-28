<script setup></script>

<template>
  <div class="background">
    <div class="backdrop"></div>
  </div>
</template>

<style scoped>
.background {
  position: fixed;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('src/assets/bg.jpeg');
  background-position: center;
  background-size: cover;
}

.background > .backdrop {
  background: rgba(0, 0, 0, 0.47);
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
