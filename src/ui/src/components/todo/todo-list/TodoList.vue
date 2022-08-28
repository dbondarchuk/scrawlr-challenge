<template>
  <div>
    <div class="row m-1 p-3 px-5">
      <div class="loader col-auto">
        <div
          class="btn btn-lg d-flex align-items-center"
          @click="sync"
          :disabled="isLoading"
          data-test-id="sync"
        >
          <font-awesome-icon
            icon="fa fa-rotate"
            :class="'my-2 px-1' + (isLoading ? ' fa-spin' : '')"
          ></font-awesome-icon>
          Sync
        </div>
      </div>
      <div class="col">
        <div class="row d-flex justify-content-end">
          <div class="col-auto d-flex align-items-center justify-content-end">
            <label class="text-secondary my-2 pr-2 view-opt-label"
              >Filter</label
            >
            <b-form-select
              class="custom-select custom-select-sm btn my-2 ms-2"
              v-model="filter"
              :options="filterOptions"
              data-test-id="filter"
            ></b-form-select>
          </div>
          <div
            class="col-auto d-flex align-items-center px-1 pr-3 justify-content-end"
          >
            <label class="text-secondary my-2 pr-2 view-opt-label">Sort</label>
            <b-form-select
              class="custom-select custom-select-sm btn my-2 mx-2"
              v-model="sortBy"
              :options="sortOptions"
              data-test-id="sortBy"
            ></b-form-select>
            <font-awesome-icon
              v-show="sort == 'asc'"
              icon="fa fa-sort-amount-asc"
              class="text-info btn mx-0 px-0 pl-1"
              data-toggle="tooltip"
              data-placement="bottom"
              title="Ascending"
              data-test-id="sort-asc"
              @click="sort = 'desc'"
            ></font-awesome-icon>
            <font-awesome-icon
              v-show="sort == 'desc'"
              icon="fa fa-sort-amount-desc"
              class="text-info btn mx-0 px-0 pl-1"
              data-toggle="tooltip"
              data-placement="bottom"
              title="Descending"
              data-test-id="sort-desc"
              @click="sort = 'asc'"
            ></font-awesome-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="row mx-1 px-5 pb-3 w-80">
      <div class="col mx-auto">
        <div v-for="item in items" :key="item.id">
          <TodoItem :item="item"></TodoItem>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
select {
  border-color: black;
}
.btn:hover,
.btn:focus {
  border-color: transparent;
  background: none;
}
</style>

<script setup lang="ts">
import { ref } from '@vue/reactivity';
import { computed } from '@vue/runtime-core';
import { Todo } from '../../../models/todo/todo';
import { store } from '../../../services/store';
import { TodoService } from '../../../services/todo/todoService';
import { default as TodoItem } from '../todo-item/TodoItem.vue';

type FilterType = 'done' | 'pending' | 'all';
type SortType = 'created' | 'completed';
type SelectOption<T> = { value: T; text: string };

type Sort = 'asc' | 'desc';

const filterOptions: SelectOption<FilterType>[] = [
  { value: 'all', text: 'All' },
  { value: 'pending', text: 'Pending' },
  { value: 'done', text: 'Done' },
];

const sortOptions: SelectOption<SortType>[] = [
  { value: 'created', text: 'Created' },
  { value: 'completed', text: 'Completed' },
];

const todoService = TodoService.instance;

const filter = ref<FilterType>('all');
const sortBy = ref<SortType>('created');
const sort = ref<Sort>('asc');
const isLoading = computed(() => store.isLoading);

const sync = async () => {
  await todoService.pushEvents();
  await todoService.getAll();
};

const items = computed<Todo[]>(() => {
  let list = store.todos;
  if (filter.value != 'all') {
    list = list.filter((item) =>
      filter.value == 'done' ? !!item.completed_at : !item.completed_at,
    );
  }

  return list.sort((a, b) => {
    const propA =
      a[sortBy.value == 'created' ? 'created_at' : 'completed_at'] ?? -1;
    const propB =
      b[sortBy.value == 'created' ? 'created_at' : 'completed_at'] ?? -1;

    return sort.value == 'asc' ? propA - propB : propB - propA;
  });
});
</script>
