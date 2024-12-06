import Head from 'next/head'

import { FullPageLoading } from '@/components/FullPageLoading'
import { AppLayout } from '@/components/Layout/AppLayout'
import { Project404 } from '@/components/Projects/Project404'
import { ProjectView } from '@/components/Projects/ProjectView'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useGetProject } from '@/hooks/useGetProject'
import { useGetProjectId } from '@/hooks/useGetProjectId'
import { PageWithLayout } from '@/utils/types'

const ProjectPage: PageWithLayout<any> = () => {
  const projectId = useGetProjectId()
  const getProject = useGetProject({ id: projectId })

  if (!projectId) return <FullPageLoading />
  if (getProject.isLoading) return <FullPageLoading />
  if (getProject.isError) return <Project404 />
  if (!getProject.data) return <Project404 />

  const project = getProject.data

  return (
    <>
      <Head>
        <title>{project.name} docs</title>
        {project.description && <meta name='description' content={project.description} />}
      </Head>

      <ProjectView project={project} />
    </>
  )
}

ProjectPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default ProjectPage
