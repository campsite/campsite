export interface Context {
  token: string
  schemaVersion: number
}

export type AuthenticationErrorType = 'no-token' | 'invalid-type'

export class AuthenticationError extends Error {
  reason: AuthenticationErrorType

  constructor(reason: AuthenticationErrorType) {
    super(reason)
    this.reason = reason
  }
}
