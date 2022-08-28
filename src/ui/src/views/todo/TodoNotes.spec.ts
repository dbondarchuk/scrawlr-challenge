import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRouterMock } from 'vue-router-mock';

import { nextTick } from 'vue';
import { UserService } from '../../services/user/userService';
import { TodoService } from '../../services/todo/todoService';
import { store } from '../../services/store';

vi.mock('bootstrap-vue-3');
vi.mock('../../services/user/userService');
vi.mock('../../services/todo/todoService');
vi.mock('../../services/store', () => ({
  store: {},
}));

import TodoNotes from './TodoNotes.vue';

describe('Todo Notes', async () => {
  const toast = {
    show: vi.fn().mockImplementation(() => {}),
    success: vi.fn().mockImplementation(() => {}),
  };

  const mockTodoService: Partial<TodoService> = {
    loadFromLocalStorage: vi.fn(),
    pushEvents: vi.fn().mockResolvedValue(true),
    getAll: vi.fn().mockResolvedValue(true),
  };

  // @ts-expect-error Tests
  TodoService.instance = mockTodoService;

  // @ts-expect-error Tests
  (await import('bootstrap-vue-3')).useToast.mockReturnValue(toast);

  const router = createRouterMock({});
  let view: VueWrapper<any>;

  beforeEach(() => {
    router.reset();
  });

  it('redirects to sign in if no user', async () => {
    store.user = null;

    view = mount(TodoNotes, {
      global: {
        stubs: ['router-link', 'font-awesome-icon', 'CreateTodo', 'TodoList'],
        plugins: [router],
      },
    });

    expect(router.push).toBeCalledWith('/signin');
    expect(router.push).toBeCalledTimes(1);

    expect(mockTodoService.loadFromLocalStorage).not.toBeCalled();
    expect(mockTodoService.pushEvents).not.toBeCalled();
    expect(mockTodoService.getAll).not.toBeCalled();
  });

  it('renders properly if signed in', async () => {
    const username = 'user';
    // @ts-expect-error Tests
    store.user = {
      username: username,
    };

    view = mount(TodoNotes, {
      global: {
        stubs: ['router-link', 'font-awesome-icon', 'CreateTodo', 'TodoList'],
        plugins: [router],
      },
    });

    await nextTick();

    // @ts-expect-error Testq
    vi.spyOn(TodoService, 'instance', 'get').mockImplementation(
      () => mockTodoService,
    );
    //Object.defineProperty(TodoService, 'instance', { get(){ return mockTodoService; } });

    expect(router.push).not.toBeCalled();

    expect(mockTodoService.loadFromLocalStorage).toBeCalled();
    expect(mockTodoService.pushEvents).toBeCalled();

    await nextTick();
    await flushPromises();

    expect(view.find('#welcome-message').text()).toBe(
      `Welcome back, ${username}!`,
    );
    expect(view.find('#logout').isVisible()).toBeTruthy();
    expect(view.find('create-todo-stub').isVisible()).toBeTruthy();
    expect(view.find('todo-list-stub').isVisible()).toBeTruthy();

    await nextTick();
    expect(mockTodoService.getAll).toBeCalled();
  });

  it('redirects to sign in if log out was clicked', async () => {
    const username = 'user';

    const logOutMock = vi.fn().mockResolvedValueOnce(true);
    UserService.prototype.logout = logOutMock;
    // @ts-expect-error Tests
    store.user = {
      username: username,
    };

    view = mount(TodoNotes, {
      global: {
        stubs: ['router-link', 'font-awesome-icon', 'CreateTodo', 'TodoList'],
        plugins: [router],
      },
    });

    await nextTick();
    await view.find('#logout').trigger('click');

    expect(router.push).toBeCalledWith('/signin');
    expect(router.push).toBeCalledTimes(1);
    expect(toast.success).toBeCalledTimes(1);
    expect(logOutMock).toBeCalledTimes(1);
  });
});
