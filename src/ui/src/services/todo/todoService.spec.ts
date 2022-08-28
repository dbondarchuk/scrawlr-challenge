import { ToastInstance } from 'bootstrap-vue-3/dist/components/BToast/plugin';
import { afterAll, assert, beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../models/errors/unauthorizedError';
import { CreateTodoRequest } from '../../models/todo/createTodo';
import { Todo } from '../../models/todo/todo';
import { TodoEvents } from '../../models/todo/todoEvent';
import { getCurrentTimestamp } from '../helpers';
import { store } from '../store';

import { TodoService } from './todoService';

const fakeUrl = 'http://localhost:4321';
const token = '1242';

vi.unmock('./todoService');
vi.mock('../store', () => ({
  store: {},
}));

vi.mock('../helpers', () => ({
  getApiUrl: () => fakeUrl,
  toFormData: (obj: any) => obj,
  getCurrentTimestamp: vi.fn(),
}));

describe('TodoService', async () => {
  const toast = {
    show: vi.fn(),
    success: vi.fn(),
    danger: vi.fn(),
  } as Partial<ToastInstance>;

  const localStorageMock = {
    setItem: vi.fn(),
    getItem: vi.fn(),
  };

  const dateNowMock = vi.fn();

  const fetchCopy = global.fetch;
  const localStorageCopy = global.window.localStorage;

  afterAll(() => {
    global.fetch = fetchCopy;
    global.window.localStorage = localStorageCopy;
  });

  beforeEach(() => {
    store.user = {
      username: 'user',
      token: token,
    };
    store.todos = [];
    store.events = {};
    store.isLoading = false;

    vi.mocked(toast.show).mockReset();
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.danger).mockReset();

    vi.mocked(getCurrentTimestamp).mockReset();

    vi.mocked(localStorageMock.getItem).mockReset();
    vi.mocked(localStorageMock.setItem).mockReset();

    // @ts-expect-error Reset id
    TodoService._id = -1;
  });

  describe('getAll', async () => {
    it('returns false if response not okay', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
      });

      global.fetch = fetchMock;

      const todoService = TodoService.create(toast as ToastInstance);
      const result = await todoService.getAll();

      expect(result).toBeFalsy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(
        `${fakeUrl}/todonotes?api_token=${token}`,
        {
          method: 'GET',
        },
      );

      expect(toast.danger).toBeCalledTimes(1);
    });

    it('returns false if request has failed', async () => {
      const fetchMock = vi.fn().mockRejectedValue(false);

      global.fetch = fetchMock;

      // @ts-expect-error Mock
      global.window.localStorage = localStorageMock;

      const todos: Todo[] = [{ id: 1, text: 'text', created_at: 4433443 }];
      const events: TodoEvents = {
        1: [
          {
            type: 'edit',
            timestamp: 1344334,
            text: 'new text',
          },
        ],
      };

      localStorageMock.getItem.mockImplementation((key) => {
        return JSON.stringify(key == 'todos' ? todos : events);
      });

      const todoService = TodoService.create(toast as ToastInstance);
      const result = await todoService.getAll();

      expect(result).toBeFalsy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(
        `${fakeUrl}/todonotes?api_token=${token}`,
        {
          method: 'GET',
        },
      );

      expect(toast.danger).toBeCalledTimes(1);

      expect(localStorageMock.getItem).toBeCalledTimes(2);

      expect(store.todos).toStrictEqual(todos);
      expect(store.events).toStrictEqual(events);
    });

    it('throws UnauthorizedError on 401', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });

      global.fetch = fetchMock;

      const todoService = TodoService.create(toast as ToastInstance);
      try {
        await todoService.getAll();
        assert.fail('Exception was expected');
      } catch (e) {
        if (!(e instanceof UnauthorizedError)) {
          assert.fail('UnauthorizedError was expected');
        }
      }

      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(
        `${fakeUrl}/todonotes?api_token=${token}`,
        {
          method: 'GET',
        },
      );

      expect(toast.danger).not.toBeCalled();
    });

    it('returns okay if request successful', async () => {
      const todos: Todo[] = [{ id: 1, text: 'text', created_at: 4433443 }];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(todos),
      });

      global.fetch = fetchMock;

      // @ts-expect-error Mock
      global.window.localStorage = localStorageMock;

      const todoService = TodoService.create(toast as ToastInstance);
      const result = await todoService.getAll();

      expect(result).toBeTruthy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(
        `${fakeUrl}/todonotes?api_token=${token}`,
        {
          method: 'GET',
        },
      );

      expect(toast.danger).not.toBeCalled();

      expect(localStorageMock.setItem).toBeCalledTimes(1);
      expect(localStorageMock.setItem).toBeCalledWith(
        'todos',
        JSON.stringify(todos),
      );

      expect(store.todos).toStrictEqual(todos);
    });
  });

  describe('add', () => {
    it('adds new todo and pushes events', async () => {
      const todoService = TodoService.create(toast as ToastInstance);
      const request: CreateTodoRequest = {
        todo: 'Buy groceries',
      };

      todoService.pushEvents = vi.fn().mockResolvedValue(true);

      const timestamp = 43345454;

      vi.mocked(getCurrentTimestamp).mockReturnValue(timestamp);

      const result = await todoService.add(request);

      expect(result).toBeTruthy();

      const expectedTodos: Todo[] = [
        {
          id: -1,
          created_at: timestamp,
          text: request.todo,
        },
      ];

      const expectedEvents: TodoEvents = {
        [-1]: [
          {
            timestamp: timestamp,
            type: 'create',
            text: request.todo,
          },
        ],
      };

      expect(store.todos).toStrictEqual(expectedTodos);
      expect(store.events).toStrictEqual(expectedEvents);

      expect(todoService.pushEvents).toBeCalledTimes(1);
    });
  });

  describe('mark', () => {
    it('marks completed and adds new event', async () => {
      const todoService = TodoService.create(toast as ToastInstance);
      const todo: Todo = {
        text: 'Buy groceries',
        id: 1,
        created_at: 12243,
      };

      todoService.pushEvents = vi.fn().mockResolvedValue(true);

      const timestamp = 43345454;

      vi.mocked(getCurrentTimestamp).mockReturnValue(timestamp);

      const result = await todoService.mark(todo, true);

      expect(result).toBeTruthy();

      const expectedEvents: TodoEvents = {
        1: [
          {
            timestamp: timestamp,
            type: 'complete',
          },
        ],
      };

      expect(store.events).toStrictEqual(expectedEvents);

      expect(todoService.pushEvents).toBeCalledTimes(1);
    });

    it('marks pending and adds new event', async () => {
      const todoService = TodoService.create(toast as ToastInstance);
      const todo: Todo = {
        text: 'Buy groceries',
        id: 1,
        created_at: 12243,
        completed_at: 373487,
      };

      todoService.pushEvents = vi.fn().mockResolvedValue(true);

      const timestamp = 43345454;

      vi.mocked(getCurrentTimestamp).mockReturnValue(timestamp);

      const result = await todoService.mark(todo, false);

      expect(result).toBeTruthy();

      const expectedEvents: TodoEvents = {
        1: [
          {
            timestamp: timestamp,
            type: 'uncomplete',
          },
        ],
      };

      expect(store.events).toStrictEqual(expectedEvents);

      expect(todoService.pushEvents).toBeCalledTimes(1);
    });

    it('cancels previous mark event', async () => {
      const todoService = TodoService.create(toast as ToastInstance);
      const todo: Todo = {
        text: 'Buy groceries',
        id: 1,
        created_at: 12243,
        completed_at: 373487,
      };

      const originalEvents: TodoEvents = {
        1: [
          {
            timestamp: todo.created_at,
            type: 'create',
            text: todo.text,
          },
        ],
      };

      store.events = {
        1: [
          originalEvents[1][0],
          {
            timestamp: 4334,
            type: 'complete',
          },
        ],
      };

      todoService.pushEvents = vi.fn().mockResolvedValue(true);

      const timestamp = 43345454;

      vi.mocked(getCurrentTimestamp).mockReturnValue(timestamp);

      const result = await todoService.mark(todo, false);

      expect(result).toBeTruthy();

      expect(store.events).toStrictEqual(originalEvents);

      expect(todoService.pushEvents).toBeCalledTimes(1);
    });
  });

  describe('edit', () => {
    it('adds new event', async () => {
      const todoService = TodoService.create(toast as ToastInstance);
      const todo: Todo = {
        text: 'Buy groceries',
        id: 1,
        created_at: 12243,
      };

      todoService.pushEvents = vi.fn().mockResolvedValue(true);

      const timestamp = 43345454;

      vi.mocked(getCurrentTimestamp).mockReturnValue(timestamp);

      const result = await todoService.edit(todo);

      expect(result).toBeTruthy();

      const expectedEvents: TodoEvents = {
        1: [
          {
            timestamp: timestamp,
            type: 'edit',
            text: todo.text,
          },
        ],
      };

      expect(store.events).toStrictEqual(expectedEvents);

      expect(todoService.pushEvents).toBeCalledTimes(1);
    });

    it('cancels previous edit event', async () => {
      const todoService = TodoService.create(toast as ToastInstance);
      const todo: Todo = {
        text: 'Buy groceries',
        id: 1,
        created_at: 12243,
        completed_at: 373487,
      };

      const originalEvents: TodoEvents = {
        1: [
          {
            timestamp: todo.created_at,
            type: 'create',
            text: 'Initial text',
          },
        ],
      };

      store.events = {
        1: [
          originalEvents[1][0],
          {
            timestamp: 4334,
            type: 'edit',
            text: 'Before text',
          },
        ],
      };

      todoService.pushEvents = vi.fn().mockResolvedValue(true);

      const timestamp = 43345454;

      vi.mocked(getCurrentTimestamp).mockReturnValue(timestamp);

      const result = await todoService.edit(todo);

      expect(result).toBeTruthy();

      const expectedEvents: TodoEvents = {
        1: [
          ...originalEvents[1],
          {
            timestamp: timestamp,
            type: 'edit',
            text: todo.text,
          },
        ],
      };

      expect(store.events).toStrictEqual(expectedEvents);

      expect(todoService.pushEvents).toBeCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('adds new event', async () => {
      const todoService = TodoService.create(toast as ToastInstance);
      todoService.pushEvents = vi.fn().mockResolvedValue(true);

      const timestamp = 43345454;

      vi.mocked(getCurrentTimestamp).mockReturnValue(timestamp);

      const result = await todoService.delete(1);

      expect(result).toBeTruthy();

      const expectedEvents: TodoEvents = {
        1: [
          {
            timestamp: timestamp,
            type: 'delete',
          },
        ],
      };

      expect(store.events).toStrictEqual(expectedEvents);

      expect(todoService.pushEvents).toBeCalledTimes(1);
    });

    it('removes todo all events', async () => {
      const todoService = TodoService.create(toast as ToastInstance);
      const todo: Todo = {
        text: 'Buy groceries',
        id: 1,
        created_at: 12243,
        completed_at: 373487,
      };

      store.events = {
        1: [
          {
            timestamp: todo.created_at,
            type: 'create',
            text: 'Initial text',
          },
          {
            timestamp: 4334,
            type: 'edit',
            text: 'Before text',
          },
        ],
      };

      todoService.pushEvents = vi.fn().mockResolvedValue(true);

      const timestamp = 43345454;

      vi.mocked(getCurrentTimestamp).mockReturnValue(timestamp);

      const result = await todoService.delete(todo.id);

      expect(result).toBeTruthy();

      expect(store.events).toStrictEqual({});

      expect(todoService.pushEvents).toBeCalledTimes(1);
    });

    it('removes todo all events but creates a delete one if no create event', async () => {
      const todoService = TodoService.create(toast as ToastInstance);
      const todo: Todo = {
        text: 'Buy groceries',
        id: 1,
        created_at: 12243,
        completed_at: 373487,
      };

      store.events = {
        1: [
          {
            timestamp: todo.created_at,
            type: 'complete',
          },
          {
            timestamp: 4334,
            type: 'edit',
            text: 'Before text',
          },
        ],
      };

      todoService.pushEvents = vi.fn().mockResolvedValue(true);

      const timestamp = 43345454;

      vi.mocked(getCurrentTimestamp).mockReturnValue(timestamp);

      const result = await todoService.delete(todo.id);

      expect(result).toBeTruthy();

      const expectedEvents: TodoEvents = {
        1: [
          {
            timestamp: timestamp,
            type: 'delete',
          },
        ],
      };

      expect(store.events).toStrictEqual(expectedEvents);

      expect(todoService.pushEvents).toBeCalledTimes(1);
    });
  });
});
