import { mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRouterMock } from 'vue-router-mock';

import { nextTick } from 'vue';
import { TodoService } from '../../../services/todo/todoService';

vi.mock('bootstrap-vue-3');
vi.mock('../../../services/user/userService');
vi.mock('../../../services/todo/todoService');
vi.mock('../../../services/store', () => ({
  store: {},
}));

import TodoItem from './TodoItem.vue';
import { Todo } from '../../../models/todo/todo';
import moment from 'moment';

const timeFormat = 'dddd, MMMM Do YYYY, h:mm:ss a';

describe('Todo Item', async () => {
  const router = createRouterMock({});
  let view: VueWrapper<any>;
  let mockTodoService: Partial<TodoService>;

  beforeEach(() => {
    router.reset();
    mockTodoService = {
      loadFromLocalStorage: vi.fn(),
      edit: vi.fn().mockResolvedValue(true),
      delete: vi.fn().mockResolvedValue(true),
      mark: vi.fn().mockResolvedValue(true),
      pushEvents: vi.fn().mockResolvedValue(true),
      getAll: vi.fn().mockResolvedValue(true),
    };

    // @ts-expect-error Tests
    TodoService.instance = mockTodoService;
  });

  it('shows all elements', async () => {
    const item: Todo = {
      id: 1,
      text: 'Buy groceries',
      created_at: 1234,
      completed_at: 2234,
    };

    view = mount(TodoItem, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
      props: { item },
    });

    await nextTick();

    const input = view.find('input');
    expect(input.element.value).toBe(item.text);
    expect(input.element.getAttribute('readonly')).toBe('');

    const checkbox = view.find(
      '[data-test-id="checkbox"] font-awesome-icon-stub',
    );
    expect(checkbox.isVisible()).toBeTruthy();
    expect(checkbox.element.getAttribute('icon')).toContain('check');

    const created_at = view.find('[data-test-id="created_at"]');
    expect(created_at.isVisible()).toBeTruthy();
    expect(created_at.element.getAttribute('timestamp')).toBe(
      item.created_at.toString(),
    );
    expect(created_at.element.getAttribute('title')).toContain(
      moment(item.created_at).format(timeFormat),
    );

    const completed_at = view.find('[data-test-id="completed_at"]');
    expect(completed_at.isVisible()).toBeTruthy();
    expect(completed_at.element.getAttribute('timestamp')).toBe(
      item.completed_at.toString(),
    );
    expect(completed_at.element.getAttribute('title')).toContain(
      moment(item.completed_at).format(timeFormat),
    );
  });

  it('shows proper elements if not completed', async () => {
    const item: Todo = {
      id: 1,
      text: 'Buy groceries',
      created_at: 1234,
    };

    view = mount(TodoItem, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
      props: { item },
    });

    await nextTick();

    const input = view.find('input');
    expect(input.element.value).toBe(item.text);
    expect(input.element.getAttribute('readonly')).toBe('');

    const checkbox = view.find(
      '[data-test-id="checkbox"] font-awesome-icon-stub',
    );
    expect(checkbox.isVisible()).toBeTruthy();
    expect(checkbox.element.getAttribute('icon')).toContain('fa-square');

    const created_at = view.find('[data-test-id="created_at"]');
    expect(created_at.isVisible()).toBeTruthy();
    expect(created_at.element.getAttribute('timestamp')).toBe(
      item.created_at.toString(),
    );
    expect(created_at.element.getAttribute('title')).toContain(
      moment(item.created_at).format(timeFormat),
    );

    const completed_at = view.find('[data-test-id="completed_at"]');
    expect(completed_at.exists()).toBeFalsy();
  });

  it('on click start edit', async () => {
    const item: Todo = {
      id: 1,
      text: 'Buy groceries',
      created_at: 1234,
    };

    view = mount(TodoItem, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
      props: { item },
    });

    await nextTick();

    const input = view.find('input');
    expect(input.element.getAttribute('readonly')).toBe('');

    await input.trigger('click');
    await nextTick();

    expect(input.element.getAttribute('readonly')).toBeNull();
  });

  it("on blur stops edit and doesn't send event if not edited", async () => {
    const item: Todo = {
      id: 1,
      text: 'Buy groceries',
      created_at: 1234,
    };

    view = mount(TodoItem, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
      props: { item },
    });

    await nextTick();

    const input = view.find('input');
    expect(input.element.getAttribute('readonly')).toBe('');

    await input.trigger('click');
    await nextTick();

    expect(input.element.getAttribute('readonly')).toBeNull();

    await input.trigger('blur');
    await nextTick();

    expect(input.element.getAttribute('readonly')).toBe('');
    expect(mockTodoService.edit).not.toBeCalled();
  });

  it('on hit enter stops edit and send edit event if changed text', async () => {
    const item: Todo = {
      id: 1,
      text: 'Buy groceries',
      created_at: 1234,
    };

    view = mount(TodoItem, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
      props: { item },
    });

    await nextTick();

    const input = view.find('input');
    expect(input.element.getAttribute('readonly')).toBe('');

    await input.trigger('click');
    await nextTick();

    expect(input.element.getAttribute('readonly')).toBeNull();

    const newValue = 'Buy a car';

    await input.setValue(newValue);
    await nextTick();

    await input.trigger('keypress', {
      key: 'Enter',
    });

    await nextTick();

    expect(input.element.getAttribute('readonly')).toBe('');

    expect(mockTodoService.edit).toBeCalledTimes(1);
    expect(mockTodoService.edit).toHaveBeenCalledWith({
      ...item,
      text: newValue,
    });
  });

  it('on checkbox click marks complete if not completed', async () => {
    const item: Todo = {
      id: 1,
      text: 'Buy groceries',
      created_at: 1234,
    };

    view = mount(TodoItem, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
      props: { item },
    });

    await nextTick();

    const checkbox = view.find(
      '[data-test-id="checkbox"] font-awesome-icon-stub',
    );

    await checkbox.trigger('click');
    await nextTick();

    expect(mockTodoService.mark).toBeCalledTimes(1);
    expect(mockTodoService.mark).toHaveBeenCalledWith(item, true);
  });

  it('on checkbox click marks undone if completed', async () => {
    const item: Todo = {
      id: 1,
      text: 'Buy groceries',
      created_at: 1234,
      completed_at: 1234,
    };

    view = mount(TodoItem, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
      props: { item },
    });

    await nextTick();

    const checkbox = view.find(
      '[data-test-id="checkbox"] font-awesome-icon-stub',
    );

    await checkbox.trigger('click');
    await nextTick();

    expect(mockTodoService.mark).toBeCalledTimes(1);
    expect(mockTodoService.mark).toHaveBeenCalledWith(item, false);
  });

  it('on delete click deletes if confrimed', async () => {
    const item: Todo = {
      id: 1,
      text: 'Buy groceries',
      created_at: 1234,
      completed_at: 1234,
    };

    view = mount(TodoItem, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
      props: { item },
    });

    await nextTick();

    global.confirm = () => true;

    const remove = view.find('[data-test-id="remove"]');
    await remove.trigger('click');
    await nextTick();

    expect(mockTodoService.delete).toBeCalledTimes(1);
    expect(mockTodoService.delete).toHaveBeenCalledWith(item.id);
  });

  it('on delete click does nothing if not confrimed', async () => {
    const item: Todo = {
      id: 1,
      text: 'Buy groceries',
      created_at: 1234,
      completed_at: 1234,
    };

    view = mount(TodoItem, {
      global: {
        plugins: [router],
        stubs: ['font-awesome-icon'],
      },
      props: { item },
    });

    await nextTick();

    global.confirm = () => false;

    const remove = view.find('[data-test-id="remove"]');
    await remove.trigger('click');
    await nextTick();

    expect(mockTodoService.delete).not.toBeCalled();
  });
});
