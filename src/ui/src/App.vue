<template>
  <div>
    <router-view></router-view>
    <b-container
      :toast="{ root: true }"
      fluid="sm"
      position="position-fixed"
    ></b-container>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'bootstrap-vue-3';
import { useRouter } from 'vue-router';
import { UnauthorizedError } from './models/errors/unauthorizedError';
import { TodoService } from './services/todo/todoService';
import { UserService } from './services/user/userService';
const userService = new UserService();
userService.restore();

const router = useRouter();
const toast = useToast();

TodoService.create(toast);

window.onunhandledrejection = function (event: PromiseRejectionEvent) {
  if (event.reason instanceof UnauthorizedError) {
    toast.danger({
      title: 'Ooops!',
      body: "Seems like you're not signed in!",
    });

    router.push('/signin');
  }
};
</script>
