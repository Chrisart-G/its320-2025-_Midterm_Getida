import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Todo } from '../../models/todo';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  todoForm: FormGroup;
  isLoading = false;
  isEditing = false;
  currentTodoId: string | null = null;
  error = '';

  constructor(
    private todoService: TodoService,
    private fb: FormBuilder
  ) {
    this.todoForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.isLoading = true;
    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load todos';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.todoForm.invalid) {
      return;
    }

    const todoData = {
      title: this.todoForm.value.title,
      description: this.todoForm.value.description,
      completed: false
    };

    if (this.isEditing && this.currentTodoId) {
      this.updateTodo(this.currentTodoId, todoData);
    } else {
      this.addTodo(todoData);
    }
  }

  addTodo(todoData: Partial<Todo>): void {
    this.todoService.addTodo(todoData).subscribe({
      next: (newTodo) => {
        this.todos.unshift(newTodo);
        this.resetForm();
      },
      error: (err) => {
        this.error = 'Failed to add todo';
        console.error(err);
      }
    });
  }

  updateTodo(id: string, todoData: Partial<Todo>): void {
    this.todoService.updateTodo(id, todoData).subscribe({
      next: (updatedTodo) => {
        const index = this.todos.findIndex(t => t._id === id);
        if (index !== -1) {
          this.todos[index] = updatedTodo;
        }
        this.resetForm();
      },
      error: (err) => {
        this.error = 'Failed to update todo';
        console.error(err);
      }
    });
  }

  editTodo(todo: Todo): void {
    this.todoForm.patchValue({
      title: todo.title,
      description: todo.description || ''
    });
    this.isEditing = true;
    this.currentTodoId = todo._id??null;
  }

  deleteTodo(id: string): void {
    if (confirm('Are you sure you want to delete this todo?')) {
      this.todoService.deleteTodo(id).subscribe({
        next: () => {
          this.todos = this.todos.filter(todo => todo._id !== id);
          if (this.currentTodoId === id) {
            this.resetForm();
          }
        },
        error: (err) => {
          this.error = 'Failed to delete todo';
          console.error(err);
        }
      });
    }
  }

  toggleComplete(todo: Todo): void {
    const updatedTodo = { ...todo, completed: !todo.completed };
    this.todoService.updateTodo(todo._id!, updatedTodo).subscribe({
      next: (updated) => {
        const index = this.todos.findIndex(t => t._id === todo._id);
        if (index !== -1) {
          this.todos[index] = updated;
        }
      },
      error: (err) => {
        this.error = 'Failed to update todo';
        console.error(err);
      }
    });
  }

  resetForm(): void {
    this.todoForm.reset({ title: '', description: '' });
    this.isEditing = false;
    this.currentTodoId = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }
}