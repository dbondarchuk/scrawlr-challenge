import { ToastInstance } from 'bootstrap-vue-3/dist/components/BToast/plugin';
import { UnauthorizedError } from '../../models/errors/unauthorizedError';
import { CreateTodoRequest } from '../../models/todo/createTodo';
import { Todo } from '../../models/todo/todo';
import { TodoEvent, TodoEvents } from '../../models/todo/todoEvent';
import { getApiUrl, getCurrentTimestamp } from '../helpers';
import { store } from '../store';

const localStorageEventsKey = 'events';
const localStorageTodosKey = 'todos';

const retryIntervalSeconds = 10;

interface EventsResponse {
  ids: Record<number, number>;
  errors?: Array<string | Record<string, string[]>>;
}

export class TodoService {
  private static _instance: TodoService;
  private static _id = -1;

  private readonly toast: ToastInstance;

  private retryTimeout: NodeJS.Timeout | string | number | undefined =
    undefined;

  private constructor(toast: ToastInstance) {
    this.toast = toast;
  }

  public static create(toast: ToastInstance): TodoService {
    TodoService._instance = new TodoService(toast);
    return TodoService._instance;
  }

  public static get instance(): TodoService {
    if (!TodoService._instance)
      throw new Error('TodoService is not initialized');
    return TodoService._instance;
  }

  public async getAll(): Promise<boolean> {
    try {
      store.isLoading = true;
      const response = await fetch(
        `${getApiUrl()}/todonotes?api_token=${store.user?.token}`,
        {
          method: 'GET',
        },
      );

      if (response.status == 401) {
        throw new UnauthorizedError();
      }
      if (!response.ok) throw new Error('Request has failed');

      const todos = (await response.json()) as Todo[];
      store.todos = todos;

      this.saveTodosLocally();

      return true;
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        throw e;
      }

      this.toast.danger({
        title: 'Oops!',
        body: "Seems like you've lost your internet connection. You can still work with your offline copy",
      });

      this.loadFromLocalStorage();

      return false;
    } finally {
      store.isLoading = false;
    }
  }

  public async add(request: CreateTodoRequest): Promise<boolean> {
    const todo: Todo = {
      id: TodoService._id--,
      text: request.todo,
      created_at: getCurrentTimestamp(),
    };

    this.addEvent(todo.id, {
      type: 'create',
      timestamp: todo.created_at,
      text: todo.text,
    });

    store.todos.push(todo);

    return await this.pushEvents();
  }

  public async mark(todo: Todo, completed: boolean): Promise<boolean> {
    const timestamp = getCurrentTimestamp();
    todo.completed_at = completed ? timestamp : undefined;

    const previous = store.events[todo.id]?.findIndex(
      (event) => event.type == 'complete' || event.type == 'uncomplete',
    );
    if (previous >= 0) {
      store.events[todo.id].splice(previous, 1);
    } else {
      this.addEvent(todo.id, {
        type: completed ? 'complete' : 'uncomplete',
        timestamp: timestamp,
      });
    }

    return await this.pushEvents();
  }

  public async edit(todo: Todo): Promise<boolean> {
    const previous = store.events[todo.id]?.findIndex(
      (event) => event.type == 'edit',
    );
    if (previous >= 0) {
      store.events[todo.id].splice(previous, 1);
    }

    this.addEvent(todo.id, {
      type: 'edit',
      timestamp: getCurrentTimestamp(),
      text: todo.text,
    });

    return await this.pushEvents();
  }

  public async delete(id: number): Promise<boolean> {
    const hadCreate =
      store.events[id]?.findIndex((event) => event.type == 'create') >= 0;
    if (store.events[id]) {
      delete store.events[id];
    }

    const todoIndex = store.todos.findIndex((todo) => todo.id == id);
    if (todoIndex >= 0) {
      store.todos.splice(todoIndex, 1);
    }

    if (!hadCreate) {
      this.addEvent(id, {
        type: 'delete',
        timestamp: getCurrentTimestamp(),
      });
    }

    return await this.pushEvents();
  }

  public async pushEvents(isRetry = false): Promise<boolean> {
    try {
      store.isLoading = true;
      this.saveEventsLocally();
      this.saveTodosLocally();
      if (Object.keys(store.events).length == 0) {
        return true;
      }

      const response = await fetch(
        `${getApiUrl()}/todonotes/events?api_token=${store.user?.token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(store.events),
        },
      );

      if (response.status == 401) {
        throw new UnauthorizedError();
      }
      if (!response.ok) throw new Error('Request has failed');

      const body = (await response.json()) as EventsResponse;
      store.events = {};
      if (body?.ids) {
        for (const todo of store.todos) {
          if (body.ids.hasOwnProperty(todo.id)) {
            todo.id = body.ids[todo.id];
          }
        }
      }

      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }

      if (isRetry) {
        this.toast.success({
          title: 'Great news!',
          body: 'You are back online and we successfully saved your work!',
        });
      }

      return true;
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        throw e;
      }

      if (!isRetry) {
        this.toast.danger({
          title: 'Oops!',
          body: "Seems like you've lost your internet connection. We will try to save your work once you get back online. In meanwhile, you can still work with your offline copy! ",
        });
      }

      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }

      this.retryTimeout = setTimeout(
        async () => await this.pushEvents(true),
        retryIntervalSeconds * 1000,
      );

      return false;
    } finally {
      store.isLoading = false;
      this.saveEventsLocally();
      this.saveTodosLocally();
    }
  }

  public loadFromLocalStorage() {
    store.todos = this.getTodosLocally();
    store.events = this.getEventsLocally();
  }

  private addEvent(id: number, event: TodoEvent) {
    if (!store.events[id]) store.events[id] = [];
    store.events[id].push(event);
  }

  private saveTodosLocally(): void {
    if (window.localStorage) {
      window.localStorage.setItem(
        localStorageTodosKey,
        JSON.stringify(store.todos),
      );
    }
  }

  private getTodosLocally(): Todo[] {
    if (window.localStorage) {
      const saved = window.localStorage.getItem(localStorageTodosKey);
      if (saved) {
        return JSON.parse(saved) as Todo[];
      }
    }

    return [];
  }

  private saveEventsLocally(): void {
    if (window.localStorage) {
      window.localStorage.setItem(
        localStorageEventsKey,
        JSON.stringify(store.events),
      );
    }
  }

  private getEventsLocally(): TodoEvents {
    if (window.localStorage) {
      const saved = window.localStorage.getItem(localStorageEventsKey);
      if (saved) {
        return JSON.parse(saved) as TodoEvents;
      }
    }

    return [];
  }
}
