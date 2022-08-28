import { reactive } from 'vue';
import { UserToken } from '../models/auth/userToken';
import { Todo } from '../models/todo/todo';
import { TodoEvents } from '../models/todo/todoEvent';

export interface Store {
  user?: UserToken;
  todos: Todo[];
  events: TodoEvents;
  isLoading: boolean;
}

export const store = reactive<Store>({
  user: undefined,
  todos: [],
  events: {},
  isLoading: false,
});
