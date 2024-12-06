import { NextSeo } from 'next-seo'
import Link from 'next/link'

import { SITE_URL } from '@campsite/config'

import { WidthContainer } from '@/components/Layouts/WidthContainer'

import { PageHead } from '../components/Layouts/PageHead'

export default function CookiePolicy() {
  return (
    <>
      <NextSeo
        title='Cookie Policy · Campsite'
        description='How Campsite uses cookies.'
        canonical={`${SITE_URL}/cookies`}
      />

      <WidthContainer className='3xl:pt-32 4xl:pt-36 max-w-4xl pt-12 md:pt-16 lg:pt-20 xl:pt-24 2xl:pt-28'>
        <PageHead title='Cookie Policy' subtitle='Effective June 8, 2023' />
      </WidthContainer>

      <WidthContainer className='max-w-3xl gap-12 py-16 lg:py-24'>
        <div className='prose lg:prose-lg'>
          <p>
            This Cookie Policy provides information about cookies, how we and third parties use them on the Platform,
            and how you can manage our use of cookies with respect to your experience on the Platform.
          </p>
          <p>
            <strong>What is a Cookie?</strong>
          </p>
          <p>
            A cookie is a small text file that can be stored on and accessed from your device when you visit and use our
            Platform. Cookies enable us to “personalize” the Platform for users by remembering information about our
            users. The Platform uses cookies to administer the Platform, store your preferences, display content to
            personalize your visit, analyze trends on the Platform, and track your movements around the Platform.{' '}
          </p>
          <p>
            <strong>How to Manage Cookies</strong>
          </p>
          <p>
            Cookies are managed through web browsers, so please review your web browser settings to modify your cookie
            settings, to disable the use of cookies, or to delete cookies. Please note that if you delete, or choose not
            to accept, cookies from the Platform, you may not be able to utilize the features of the Platform to their
            fullest potential.
          </p>
          <p>
            <strong>Types of Cookies</strong>
          </p>
          <p>Cookies can be categorized in different ways:</p>
          <ul>
            <li>
              First-Party vs. Third-Party Cookies: We put first-party cookies on your device. Third party cookies are
              placed on your device by a third party. You can learn more about the third-party cookies used on the
              Platform below.
            </li>
            <li>Duration:</li>
            <ul>
              <li>
                Session Cookies: Temporary cookies that expire once your session on the Platform ends or your web
                browser is closed.
              </li>
              <li>
                Persistent Cookies: Cookies that remain on your device for a longer period until you manually erase them
                or until their expiration date.
              </li>
            </ul>
            <li>Purpose:</li>
            <ul>
              <li>
                Necessary Cookies - These cookies are necessary for us to operate the Platform and its core features
                (e.g., account login).
              </li>
              <li>
                Functionality Cookies — These cookies enable us to operate the Platform in accordance with the choices
                you make. These cookies permit us to “remember” you in between visits. For instance, we will remember
                how you customized the Platform (e.g., language preference, location), and these cookies allow us to
                provide you with the same customizations during future visits.
              </li>
              <li>
                Analytical — These cookies analyze how the Platform is used (e.g., browsing habits) and how the Platform
                is performing. These cookies include, for example, Google Analytics cookies.
              </li>
              <li>
                Marketing — These cookies track your online activity to help advertisers deliver more personalized
                content and targeted ads. These cookies can share that information with other organizations or
                advertisers. We do not use any marketing cookies.
              </li>
            </ul>
          </ul>

          <p>
            <strong>First-Party Cookies That We Use</strong>
          </p>
          <p>We use the following necessary cookies for login and authentication purposes.</p>
          <ul>
            <li>
              We store an “API session” to authenticate the application with our API service. This expires every 30
              days.
            </li>
            <li>
              We store a “scope” which tracks the Organization that is currently active. This is used to identify which
              Organization should be performing actions with our API.
            </li>
          </ul>

          <p>
            <strong>Third-Party Cookies That We Use</strong>
          </p>
          <ul>
            <li>
              <Link href='https://axiom.co'>Axiom</Link> for performance and stability monitoring.
            </li>
            <li>
              <Link href='https://sentry.io'>Sentry</Link> for error monitoring.
            </li>
          </ul>

          <p>
            <strong>Web Beacons.</strong>
          </p>
          <p>
            A web beacon is an unobtrusive feature on web pages or emails that enables us to check whether a user has
            accessed some content. We may use web beacons to better understand how you and other users interact with the
            Platform.
          </p>
        </div>
      </WidthContainer>
    </>
  )
}
