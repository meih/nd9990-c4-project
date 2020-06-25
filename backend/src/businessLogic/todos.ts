import * as uuid from 'uuid'

import { TodoItem } from '../models/todoItem'
import { TodoItemAccess } from '../dataLayer/todoItemAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoItemAccess = new TodoItemAccess()

export async function getAllTodoItems(
  userId: string
): Promise<TodoItem[]> {
  return todoItemAccess.getAllTodoItems(userId)
}

export async function createTodoItem(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {

  const itemId = uuid.v4()

  return await todoItemAccess.createTodoItem({
    todoId: itemId,
    userId: userId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: null
  })
}

export async function updateTodoItem(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> {
  return todoItemAccess.updateTodoItem(userId, todoId, updateTodoRequest)
}

export async function deleteTodoItem(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  return todoItemAccess.deleteTodoItem(userId, todoId)
}

export async function setAttachmentUrl(
  userId: string,
  todoId: string,
  url: string
): Promise<TodoItem> {
  return todoItemAccess.setAttachmentUrl(userId, todoId, url)
}
