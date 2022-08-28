export type TodoEventType =
  | 'create'
  | 'delete'
  | 'edit'
  | 'complete'
  | 'uncomplete';

export interface TodoEvent {
  type: TodoEventType;
  timestamp: number;
  text?: string;
}

export type TodoEvents = Record<number, TodoEvent[]>;
