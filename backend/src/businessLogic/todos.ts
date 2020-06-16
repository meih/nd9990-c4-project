import * as uuid from 'uuid'

import { TodoItem } from '../models/todoItem'
import { TodoItemAccess } from '../dataLayer/todoItemAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoItemAccess = new TodoItemAccess()

export async function getAllTodoItems(): Promise<TodoItem[]> {
  return todoItemAccess.getAllTodoItems()
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
