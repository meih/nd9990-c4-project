import * as uuid from 'uuid'

import { TodoItem } from '../models/todoItem'
import { TodoItemAccess } from '../dataLayer/todoItemAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoItemAccess = new TodoItemAccess()

export async function getAllTodoItems(
  jwtToken: string
): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoItemAccess.getAllTodoItems(userId)
}

export async function createTodoItem(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
//  const userId = "testuser"
  const userId = parseUserId(jwtToken)

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
  jwtToken: string,
  todoId: string
): Promise<TodoItem> {
  const userId = parseUserId(jwtToken)
  return todoItemAccess.deleteTodoItem(userId, todoId)
}

export async function setAttachmentUrl(
  jwtToken: string,
  todoId: string,
  url: string
): Promise<TodoItem> {
  const userId = parseUserId(jwtToken)
  return todoItemAccess.setAttachmentUrl(userId, todoId, url)
}
