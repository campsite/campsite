import { AuthEntryPage } from '@/components/Auth/AuthEntryPage'

export default function LoginPage() {
  return (
    <AuthEntryPage
      actionHref='/auth/login'
      actionLabel='Continue to sign in'
      description='Continue to the secure sign-in screen for email, password, or Google authentication.'
      switchHref='/sign-up'
      switchLabel='Sign up'
      switchPrompt='New to Campsite?'
      title='Sign in'
    />
  )
}
