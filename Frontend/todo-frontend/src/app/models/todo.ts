export interface Todo {
    _id?: string;
    title: string;
    description?: string;
    completed: boolean;
    user?: string;
    createdAt?: Date;
  }