import { Arrows, Buffer, Cal, Clad, Luma, Plaid, Retro } from '@/components/Home/LogoSvgs'

const logos = [
  {
    alt: 'Plaid logo',
    url: 'https://plaid.com',
    color: '#000000',
    svg: <Plaid />,
    featured: true
  },
  {
    alt: 'Cal.com logo',
    url: 'https://cal.com',
    color: '#292929',
    svg: <Cal />
  },
  {
    alt: 'Luma logo',
    url: 'https://lu.ma',
    color: '#000000',
    svg: <Luma />
  },

  {
    alt: 'Clad logo',
    url: 'https://www.withclad.com/',
    color: '#4819D2',
    svg: <Clad />
  },
  {
    alt: 'Arrows logo',
    url: 'https://arrows.to',
    color: '#F6C546',
    svg: <Arrows />
  },
  {
    alt: 'Buffer logo',
    url: 'https://buffer.com',
    color: '#000000',
    svg: <Buffer />
  },
  {
    alt: 'Retro logo',
    url: 'https://retro.app',
    color: '#000000',
    svg: <Retro />
  }
] as Logo[]

interface Logo {
  alt: string
  url: string
  color: string
  svg: React.ReactNode
  featured?: boolean
}

export function CustomerLogos() {
  return (
    <div className='flex flex-col items-center justify-center gap-2 pb-4 pt-8'>
      <p className='text-quaternary text-xs font-semibold uppercase tracking-wider'>Loved by teams at</p>
      <div className='flex flex-wrap items-center justify-center gap-x-4'>
        {logos.map((logo) => (
          <Logo logo={logo} key={logo.url} />
        ))}
      </div>
    </div>
  )
}

function Logo({ logo }: { logo: Logo }) {
  return (
    <div
      className='text-quaternary hover:text-primary max-h-11 scale-[85%] transition-colors duration-200'
      key={logo.url}
    >
      {logo.svg}
    </div>
  )
}
