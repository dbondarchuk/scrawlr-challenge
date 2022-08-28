import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createRouterMock } from 'vue-router-mock';

import { nextTick } from 'vue';
import { TodoService } from '../../../services/todo/todoService';

vi.mock('bootstrap-vue-3');
vi.mock('../../../services/user/userService');
vi.mock('../../../services/todo/todoService');
vi.mock('../../../services/store', () => ({
  store: {},
}));

import CreateTodo from './CreateTodo.vue';

describe('Create Todo', async () => {
  const router = createRouterMock({});
  let view: VueWrapper<any>;
  let mockTodoService: Partial<TodoService>;

  beforeEach(() => {
    router.reset();
    mockTodoService = {
      add: vi.fn().mockResolvedValue(true),
    };

    // @ts-expect-error Tests
    TodoService.instance = mockTodoService;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows all elements', async () => {
    view = mount(CreateTodo, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
    });

    await nextTick();

    const input = view.find('input');
    expect(input.element.value).toBe('');
    expect(input.element.getAttribute('disabled')).toBeNull();

    const loader = view.find('[data-test-id="loader"]');
    expect(loader.isVisible()).toBeFalsy();

    const submit = view.find('[type="submit"]');
    expect(submit.isVisible()).toBeTruthy();
  });

  it('does nothing on submit if input is empty', async () => {
    view = mount(CreateTodo, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
    });

    await nextTick();

    await view.find('form').trigger('submit');

    await nextTick();

    expect(mockTodoService.add).not.toBeCalled();
  });

  it('adds on submit if input not empty', async () => {
    const text = 'Buy groceries';

    const promise = new Promise((resolve) => setTimeout(resolve, 1));

    //vi.useFakeTimers();
    mockTodoService.add = vi.fn().mockReturnValue(promise);

    view = mount(CreateTodo, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
    });

    const input = view.find('input');
    await input.setValue(text);

    view.find('form').trigger('submit');

    await nextTick();

    expect(mockTodoService.add).toBeCalledWith({ todo: text });

    expect(input.element.getAttribute('disabled')).toBe('');

    const loader = view.find('[data-test-id="loader"]');
    expect(loader.isVisible()).toBeTruthy();

    await promise;
    await flushPromises();
    await nextTick();

    expect(loader.isVisible()).toBeFalsy();
    expect(input.element.value).toBe('');
    expect(input.element.getAttribute('disabled')).toBeNull();
  });
});
