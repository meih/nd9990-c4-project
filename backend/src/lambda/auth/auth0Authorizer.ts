import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-mkhh6q9k.us.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJBMHxqHkWfCtwMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1ta2hoNnE5ay51cy5hdXRoMC5jb20wHhcNMjAwNjExMTM1MjQyWhcN
MzQwMjE4MTM1MjQyWjAkMSIwIAYDVQQDExlkZXYtbWtoaDZxOWsudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3+WXQBnXACi459Yt
CMe9YCoi6G9Rcduv8Ighwhvg59XjpKVHitpz9udEseI/LCZWkJfN4v3kZo/4TBX7
bRBVjzDZEfrJ3L8G+GIs0Qv7i000CNkeDB6hX6TNLejQJvF9YI1bKxa4v4QkaESZ
4DS8F7dN7GwhZ+tV9az/SA1iZuJFUe2xIbf5UUQUBJT4rMzqeH0z05xmLQrQJxAI
zQAvKGkocpu/Bj5Jk3HquQNAtN305zdbHEOcapby98rrFP0QdKBG5KzUUXvoi7rR
yLlkPkJzvHbfyVGLgMKmuVJO0mIstVZiCzxxh2mDBzpMA6QbyQ3H4IHjXpHT4n7i
ion6pwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSWxRxbu7G7
4dLm72qBboz/MncCuTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AGQKICMpwYgELWCmtSqLpajDVqW3vCzFWzRrwtri9oPtZ8PjlSo+XOmLHy1z+v+e
Wv47MriqFDR4HbAII4VRWLdtiyB5ZZO3aZ714FBtZqOTU7k+JgVBvo32z6OJu+TS
Jw1Z6+UonXHLsp9JSZzo1eUyEnT4hunmIYsKKxxWtOfgQNb03/lluz3ujd49kO/I
WA5jz+peiDcYXoO1YqQD8u5NvfYeG9QD8QndEOBzDjkx2p7SMZo7/1D6/eZgTdl0
FSoc+o+9Ex5DyPwurlrN18+3jnN25k/0McxUQnIC1QRGOqKfCjkQM03AsXqmK8fe
MD4EbcPguCzbGRS03TCv5NE=
-----END CERTIFICATE-----
`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(
    token,           // Token from an HTTP header to validate
    cert,            // A certificate copied from Auth0 website
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
