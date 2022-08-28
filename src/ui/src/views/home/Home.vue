<template></template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { store } from '../../services/store';

const router = useRouter();

if (store.user) {
  router.push('/todonotes');
} else {
  router.push('/signin');
}
</script>
