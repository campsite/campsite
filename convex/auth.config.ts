const clientId = process.env.WORKOS_CLIENT_ID

if (!clientId) {
  throw new Error('WORKOS_CLIENT_ID must be set for Convex auth')
}

const authConfig = {
  providers: [
    {
      type: 'customJwt',
      issuer: 'https://api.workos.com/',
      algorithm: 'RS256',
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
      applicationID: clientId
    },
    {
      type: 'customJwt',
      issuer: `https://api.workos.com/user_management/${clientId}`,
      algorithm: 'RS256',
      jwks: `https://api.workos.com/sso/jwks/${clientId}`
    }
  ]
}

export default authConfig
