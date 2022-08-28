<template>
  <div class="row px-3 align-items-center todo-item rounded">
    <div class="col-auto m-1 p-0 d-flex align-items-center">
      <h2 class="m-0 p-0" data-test-id="checkbox">
        <font-awesome-icon
          icon="far fa-square"
          class="text-primary btn btn-lg m-0 p-0"
          data-toggle="tooltip"
          data-placement="bottom"
          title="Mark as done"
          v-if="!props.item.completed_at"
          @click="mark(true)"
        ></font-awesome-icon>
        <font-awesome-icon
          icon="fa fa-check-square"
          class="text-primary btn btn-lg m-0 p-0"
          data-toggle="tooltip"
          data-placement="bottom"
          title="Mark as pending"
          v-if="props.item.completed_at"
          @click="mark(false)"
        ></font-awesome-icon>
      </h2>
    </div>
    <div class="col px-1 m-1 d-flex align-items-center">
      <b-form-input
        type="text"
        class="form-control form-control-lg border-0 edit-todo-input bg-transparent rounded px-3"
        :readonly="!isEdit"
        v-model="props.item.text"
        :title="props.item.text"
        @click="!isEdit && toggleEdit()"
        @touchstart="!isEdit && toggleEdit()"
        @blur="isEdit && toggleEdit()"
        @keypress="(event) => onKeyPressed(event)"
      />
    </div>
    <!-- <div class="col-auto m-1 p-0 px-3" v-if="props.item.completed_at">
      <div class="row">
        <div
          class="
            col-auto
            d-flex
            align-items-center
            rounded
            bg-white
            border border-success
          "
          :title="'Completed on ' + formatedDate(props.item.completed_at)"
        >
          <font-awesome-icon
            icon="fa fa-check"
            class="my-2 px-2 text-success btn"
            data-toggle="tooltip"
            data-placement="bottom"
          ></font-awesome-icon>
          <h6 class="text my-2 pr-2">
            {{ relativeDate(props.item.completed_at) }}
          </h6>
        </div>
      </div>
    </div> -->
    <div
      class="col-sm-3 m-1 p-0 todo-actions d-flex justify-content-end align-items-center"
    >
      <div
        class="m-0 p-2"
        data-test-id="created_at"
        :timestamp="props.item.created_at"
        :title="'Created on ' + formatedDate(props.item.created_at)"
      >
        <font-awesome-icon
          icon="fa fa-info-circle"
          class="text-black-50 btn"
        ></font-awesome-icon>
        <label class="date-label my-2 text-black-50">{{
          relativeDate(props.item.created_at)
        }}</label>
      </div>
      <div
        class="m-0 p-2 text-success"
        v-if="props.item.completed_at"
        data-test-id="completed_at"
        :timestamp="props.item.completed_at"
        :title="'Completed on ' + formatedDate(props.item.completed_at)"
      >
        <font-awesome-icon
          icon="fa fa-check"
          class="text-black-50 btn"
        ></font-awesome-icon>
        <label class="date-label my-2 text-black-50">{{
          relativeDate(props.item.completed_at)
        }}</label>
      </div>
      <div class="m-0 p-2">
        <font-awesome-icon
          data-test-id="remove"
          icon="far fa-trash-can"
          class="text-danger btn m-0 p-0"
          title="Delete todo"
          @click="remove()"
        ></font-awesome-icon>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-actions {
  visibility: hidden !important;
}

.todo-item:hover .todo-actions {
  visibility: visible !important;
}

.todo-item.editing .todo-actions .edit-icon {
  display: none !important;
}
.edit-todo-input {
  outline: none;
}

.edit-todo-input:focus {
  border: none !important;
  box-shadow: none !important;
}

.view-opt-label,
.date-label {
  font-size: 0.8rem;
}

.edit-todo-input {
  font-size: 1.7rem !important;
}
svg.btn:hover {
  border-color: transparent;
  background: none;
}
</style>

<script setup lang="ts">
import { ref } from '@vue/reactivity';
import { Todo } from '../../../models/todo/todo';
import moment from 'moment';
import { TodoService } from '../../../services/todo/todoService';

interface TodoItemProps {
  item: Todo;
}

const props = defineProps<TodoItemProps>();
const isEdit = ref(false);

const todoService = TodoService.instance;

const formatedDate = (date: number) =>
  moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a');
const relativeDate = (date: number) => moment(date).fromNow();

let oldValue = props.item.text;

const onKeyPressed = async (event: KeyboardEvent) => {
  if (event.key == 'Enter' && isEdit.value) {
    await toggleEdit();
  }
};

const toggleEdit = async () => {
  if (!isEdit.value) {
    oldValue = props.item.text;
    isEdit.value = true;
  } else {
    if (props.item.text !== oldValue) {
      await todoService.edit(props.item);
    }

    isEdit.value = false;
  }
};

const mark = async (completed: boolean) => {
  await todoService.mark(props.item, completed);
};

const remove = async () => {
  const confirmAction = confirm('Are you sure?');
  if (!confirmAction) return;
  await todoService.delete(props.item.id);
};
</script>
