import { GetServerSideProps } from 'next'

export default function IndexPage() {
  return null
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/login',
      permanent: false
    }
  }
}
