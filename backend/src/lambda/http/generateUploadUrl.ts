import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import { setAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const imageId = uuid.v4()

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const userId = getUserId(event)
  
  const url = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
  console.log(url)

  const plain_url = url.replace(/\?.*$/,"");
  const items = await setAttachmentUrl(userId, todoId, plain_url)

  const response = {
    statusCode: 200,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      "uploadUrl": url
    }),
  };

  return response

}
