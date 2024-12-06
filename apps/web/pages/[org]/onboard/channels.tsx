import { zodResolver } from '@hookform/resolvers/zod'
import Router from 'next/router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, TextField } from '@campsite/ui'

import { Container, Form, HeadOrgName, OrgAvatar, Title } from '@/components/OrgOnboarding/Components'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { BasicTitlebar } from '@/components/Titlebar'
import { useScope } from '@/contexts/scope'
import { useCreateProject } from '@/hooks/useCreateProject'
import { useSignoutUser } from '@/hooks/useSignoutUser'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { PageWithLayout } from '@/utils/types'

const OnboardChannelsPage: PageWithLayout<any> = () => {
  const signout = useSignoutUser()

  return (
    <>
      <HeadOrgName />

      <main className='flex h-full w-full flex-col'>
        <BasicTitlebar
          leadingSlot={null}
          trailingSlot={
            <Button variant='plain' onClick={() => signout.mutate()}>
              Log out
            </Button>
          }
          disableBottomBorder
        />

        <Container>
          <OrgAvatar />
          <Title
            title='What are you working on?'
            subtitle='This will create a new channel in Campsite. You can add more channels later.'
          />

          <NewProjectsForm />
        </Container>
      </main>
    </>
  )
}

const newProjectsSchema = z.object({
  channel_name: z
    .string()
    .nonempty({ message: 'Channel name is required' })
    .max(32, { message: 'Channel name is too long' })
})

type NewProjectsSchema = z.infer<typeof newProjectsSchema>

const DEFAULT_NEW_PROJECTS: NewProjectsSchema = {
  channel_name: ''
}

function NewProjectsForm() {
  const createProject = useCreateProject()
  const { handleSubmit, formState, watch, setValue } = useForm<NewProjectsSchema>({
    resolver: zodResolver(newProjectsSchema),
    defaultValues: DEFAULT_NEW_PROJECTS
  })
  const { scope } = useScope()

  const onSubmit = handleSubmit(async (data) => {
    createProject.mutate(
      { name: data.channel_name, onboarding: true },
      {
        onSuccess: ({ id }) => Router.push(`/${scope}/onboard/invite?projectId=${id}`),
        onError: apiErrorToast
      }
    )
  })

  const channelName = watch('channel_name')

  return (
    <Form onSubmit={onSubmit}>
      <div className='pr-8.5 flex flex-1 flex-row items-center gap-1'>
        <TextField
          label='Channel name'
          value={channelName}
          onChange={(value) => setValue('channel_name', value, { shouldValidate: true })}
          placeholder='e.g. Product launch'
          containerClasses='flex-1'
          required
        />
      </div>

      <Button
        type='submit'
        variant='primary'
        size='large'
        className='mt-6'
        disabled={createProject.isPending || createProject.isSuccess || !formState.isValid}
        tooltip={formState.errors.channel_name?.message}
      >
        Continue
      </Button>
    </Form>
  )
}

OnboardChannelsPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default OnboardChannelsPage
