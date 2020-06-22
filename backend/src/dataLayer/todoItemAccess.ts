import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoItemAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodoItems(
    userId: string
  ): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const result = await this.docClient.query({
      TableName : this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodoItem(
    userId: string,
    todoId: string,
    todo: TodoUpdate
    ): Promise<TodoItem> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        'userId': userId,
        'todoId': todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name' : todo.name,
        ':dueDate' : todo.dueDate,
        ':done' : todo.done
      }
    }).promise()

    return
  }

  async deleteTodoItem(userId: string, todoId: string): Promise<TodoItem> {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        'userId': userId,
        'todoId': todoId
      }
    }).promise()

    return
  }


  async setAttachmentUrl(
    userId: string,
    todoId: string,
    attachmentUrl: string
    ): Promise<TodoItem> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        'userId': userId,
        'todoId': todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl' : attachmentUrl
      }
    }).promise()

    return
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
