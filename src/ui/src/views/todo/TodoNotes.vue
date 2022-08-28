<template>
  <div>
    <div class="container-fluid min-vh-100 rounded mx-auto bg-light shadow">
      <div class="row">
        <div class="col" v-if="username">
          <div
            class="py-1 text-secondary text-right d-flex justify-content-start"
          >
            <span id="welcome-message">Welcome back, {{ username }}!</span>
          </div>
        </div>
        <div class="col">
          <div
            class="py-1 text-secondary text-right d-flex justify-content-end"
          >
            <span class="btn" id="logout" @click="logout">Logout</span>
          </div>
        </div>
      </div>
      <!-- App title section -->
      <div class="row m-1 p-4">
        <div class="col">
          <div
            class="p-1 h1 text-primary text-center mx-auto d-flex align-items-center justify-content-center"
          >
            <font-awesome-icon
              icon="fa fa-check"
              class="bg-primary text-white rounded p-2 me-3"
            ></font-awesome-icon>
            <span>My Todo</span>
          </div>
        </div>
      </div>
      <CreateTodo></CreateTodo>
      <div class="p-2 mx-4 border-black-25 border-bottom"></div>
      <TodoList></TodoList>
    </div>
  </div>
</template>

<script setup>
import { computed } from '@vue/runtime-core';
import { useToast } from 'bootstrap-vue-3';
import { useRouter } from 'vue-router';
import CreateTodo from '../../components/todo/create-todo/CreateTodo.vue';
import TodoList from '../../components/todo/todo-list/TodoList.vue';
import { store } from '../../services/store';
import { TodoService } from '../../services/todo/todoService';
import { UserService } from '../../services/user/userService';

const router = useRouter();
const toast = useToast();
const userService = new UserService();
const todoService = TodoService.instance;

const username = computed(() => store.user?.username);

const logout = async () => {
  await userService.logout();
  toast.success({
    title: 'Success!',
    body: "You've been successfully logged out",
  });
  router.push('/signin');
};

if (!store.user) {
  router.push('/signin');
} else {
  todoService.loadFromLocalStorage();
  todoService.pushEvents().then(() => {
    todoService.getAll();
  });
}
</script>
