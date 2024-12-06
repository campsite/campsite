import { PageWithLayout } from '@/utils/types'

const OrganizationInvitePage: PageWithLayout<any> = () => {
  return null
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: '/me/settings/organizations',
      permanent: false
    }
  }
}

export default OrganizationInvitePage
