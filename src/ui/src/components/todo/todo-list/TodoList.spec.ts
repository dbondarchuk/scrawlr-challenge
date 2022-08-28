import { mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRouterMock } from 'vue-router-mock';

import { nextTick } from 'vue';
import { TodoService } from '../../../services/todo/todoService';
import { store } from '../../../services/store';

vi.mock('bootstrap-vue-3');
vi.mock('../../../services/user/userService');
vi.mock('../../../services/todo/todoService');
vi.mock('../../../services/store', () => ({
  store: {},
}));

import TodoList from './TodoList.vue';
import { Todo } from '../../../models/todo/todo';

const getItems: () => Todo[] = () => [
  { id: 1, created_at: 1000, text: '1' },
  { id: 2, created_at: 3000, text: '2', completed_at: 6000 },
  { id: 3, created_at: 4000, text: '3', completed_at: 5000 },
  { id: 4, created_at: 5000, text: '4', completed_at: 7000 },
];

const sortFn = (direction: 'asc' | 'desc') => (a: number, b: number) => {
  return direction == 'asc' ? a - b : b - a;
};

describe('Todo List', async () => {
  const router = createRouterMock({});
  let view: VueWrapper<any>;
  let mockTodoService: Partial<TodoService>;

  beforeEach(() => {
    router.reset();
    mockTodoService = {
      getAll: vi.fn().mockResolvedValue(true),
      pushEvents: vi.fn().mockResolvedValue(true),
    };

    // @ts-expect-error Tests
    TodoService.instance = mockTodoService;
  });

  it('renders right amount of items', async () => {
    const items = getItems();
    store.todos = items;

    view = mount(TodoList, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon', 'TodoItem'],
      },
    });

    await nextTick();

    expect(view.findAll('todo-item-stub').length).toBe(items.length);
  });

  it('filters active correctly', async () => {
    const items = getItems();
    store.todos = items;

    view = mount(TodoList, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon', 'TodoItem'],
      },
    });

    await nextTick();

    await view
      .find('[data-test-id="filter"]')
      .find('option[value="pending"]')
      // @ts-expect-error setSelected is function
      .setSelected();

    const itemsComponents = view.findAllComponents('todo-item-stub');
    expect(itemsComponents.length).toBe(
      items.filter((item) => !item.completed_at).length,
    );

    expect(
      // @ts-expect-error VM should be defined
      itemsComponents.every((comp) => !comp.vm.item.completed_at),
    ).toBeTruthy();
  });

  it('filters completed correctly', async () => {
    const items = getItems();
    store.todos = items;

    view = mount(TodoList, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon', 'TodoItem'],
      },
    });

    await nextTick();

    await view
      .find('[data-test-id="filter"]')
      .find('option[value="done"]')
      // @ts-expect-error setSelected is function
      .setSelected();

    const itemsComponents = view.findAllComponents('todo-item-stub');
    expect(itemsComponents.length).toBe(
      items.filter((item) => item.completed_at).length,
    );

    expect(
      // @ts-expect-error VM should be defined
      itemsComponents.every((comp) => comp.vm.item.completed_at),
    ).toBeTruthy();
  });

  it('sorts by created_at correctly', async () => {
    const items = getItems();
    store.todos = items;

    view = mount(TodoList, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon', 'TodoItem'],
      },
    });

    await nextTick();

    await view
      .get('[data-test-id="sortBy"]')
      .get('option[value="created"]')
      // @ts-expect-error setSelected is function
      .setSelected();

    let itemsComponents = view.findAllComponents('todo-item-stub');
    expect(itemsComponents.length).toBe(items.length);

    // @ts-expect-error VM should be defined
    let timestamps = itemsComponents.map((comp) => comp.vm.item.created_at);
    expect(timestamps).toStrictEqual(
      items.map((item) => item.created_at).sort(sortFn('asc')),
    );

    await view.get('[data-test-id="sort-asc"]').trigger('click');
    itemsComponents = view.findAllComponents('todo-item-stub');

    // @ts-expect-error VM should be defined
    timestamps = itemsComponents.map((comp) => comp.vm.item.created_at);
    expect(timestamps).toStrictEqual(
      items.map((item) => item.created_at).sort(sortFn('desc')),
    );
  });

  it('sorts by completed_at correctly', async () => {
    const items = getItems();
    store.todos = items;

    view = mount(TodoList, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon', 'TodoItem'],
      },
    });

    await nextTick();

    await view
      .get('[data-test-id="sortBy"]')
      .get('option[value="completed"]')
      // @ts-expect-error setSelected is function
      .setSelected();

    let itemsComponents = view.findAllComponents('todo-item-stub');
    expect(itemsComponents.length).toBe(items.length);

    // @ts-expect-error VM should be defined
    let timestamps = itemsComponents.map((comp) => comp.vm.item.completed_at);
    expect(timestamps).toStrictEqual(
      items
        .map((item) => item.completed_at ?? -1)
        .sort(sortFn('asc'))
        .map((n) => (n != -1 ? n : undefined)),
    );

    await view.get('[data-test-id="sort-asc"]').trigger('click');
    itemsComponents = view.findAllComponents('todo-item-stub');

    // @ts-expect-error VM should be defined
    timestamps = itemsComponents.map((comp) => comp.vm.item.completed_at);
    expect(timestamps).toStrictEqual(
      items
        .map((item) => item.completed_at ?? -1)
        .sort(sortFn('desc'))
        .map((n) => (n != -1 ? n : undefined)),
    );
  });
});
