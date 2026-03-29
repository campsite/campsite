import { AuthEntryPage } from '@/components/Auth/AuthEntryPage'

export default function SignUpPage() {
  return (
    <AuthEntryPage
      actionHref='/auth/sign-up'
      actionLabel='Continue to sign up'
      description='Continue to the secure sign-up screen to create your Campsite account.'
      footer={
        <>
          By signing up, you agree to Campsite’s Terms of Service and Privacy Policy.
        </>
      }
      switchHref='/login'
      switchLabel='Sign in'
      switchPrompt='Already have an account?'
      title='Sign up'
    />
  )
}
