<template>
  <!-- Create todo section -->
  <div class="row m-1 p-3">
    <div class="col col-11 mx-auto">
      <b-form @submit="onSubmit">
        <div
          class="row bg-white rounded shadow-sm p-2 add-todo-wrapper align-items-center justify-content-center"
        >
          <div class="col">
            <b-form-input
              class="form-control form-control-lg border-0 add-todo-input bg-transparent rounded"
              v-model="form.todo"
              :disabled="loading"
              type="text"
              ref="new_item_input"
              placeholder="Add new .."
            />
          </div>
          <div class="col-auto m-0 px-2 d-flex align-items-center">
            <font-awesome-icon
              v-show="loading"
              icon="fa fa-circle-notch"
              class="my-2 px-1 fa-spin"
              data-test-id="loader"
            ></font-awesome-icon>
          </div>
          <div class="col-auto px-0 mx-0 mr-2">
            <button type="submit" class="btn btn-primary">Add</button>
          </div>
        </div>
      </b-form>
    </div>
  </div>
</template>

<style scoped>
.add-todo-input {
  outline: none;
}

.add-todo-input:focus {
  border: none !important;
  box-shadow: none !important;
}
</style>

<script setup lang="ts">
import { reactive, ref } from '@vue/reactivity';
import { nextTick } from '@vue/runtime-core';
import { CreateTodoRequest } from '../../../models/todo/createTodo';
import { TodoService } from '../../../services/todo/todoService';

const todoService = TodoService.instance;

const loading = ref(false);
const new_item_input = ref<HTMLInputElement>();

const form = reactive<CreateTodoRequest>({
  todo: '',
});

const onSubmit = async () => {
  if (!form.todo) return;

  loading.value = true;

  await todoService.add(form);
  loading.value = false;

  form.todo = '';
  await nextTick(() => new_item_input.value?.focus());
};
</script>
