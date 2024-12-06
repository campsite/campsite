import { NextSeo } from 'next-seo'
import Link from 'next/link'

import { SITE_URL } from '@campsite/config'

import { WidthContainer } from '@/components/Layouts/WidthContainer'

import { PageHead } from '../components/Layouts/PageHead'

export default function Privacy() {
  return (
    <>
      <NextSeo
        title='Privacy · Campsite'
        description='How Campsite collects and uses data.'
        canonical={`${SITE_URL}/privacy`}
      />

      <WidthContainer className='3xl:pt-32 4xl:pt-36 max-w-4xl pt-12 md:pt-16 lg:pt-20 xl:pt-24 2xl:pt-28'>
        <PageHead title='Privacy' subtitle='Effective July 3, 2024' />
      </WidthContainer>

      <WidthContainer className='max-w-3xl gap-12 py-16 lg:py-24'>
        <div className='prose lg:prose-lg'>
          <ol type='1'>
            <li>
              <strong>Introduction.</strong> This Privacy Policy (the <strong>“Policy”</strong>) explains how Campsite
              Software Co. (“Campsite”) collects, uses, and discloses personal information through its online platform
              (the “Platform”). By using or accessing the Platform in any manner, you acknowledge that you accept the
              practices and policies outlined in this Policy, and you hereby consent that we will collect, use, and
              share your personal information in the following ways. Any capitalized terms that are not defined in this
              Policy are defined in our <Link href='/terms'>Terms of Service</Link>.
            </li>

            <li>
              <strong>Information collected and how we use it.</strong> As explained further in this section, you will
              have the opportunity to provide us with certain personal information. In addition, we may collect certain
              information automatically through your use of the Platform. We will use this information to provide you
              and your Organizations with the functionality of our Platform, to improve our Platform, and to provide you
              with information about our Platform. The rest of this section provides a more detailed explanation of the
              personal information we collect and how we use that information.
            </li>

            <ol type='a'>
              <li>
                <strong>Voluntarily Disclosed Information.</strong>
              </li>

              <ol type='i'>
                <li>
                  <strong>Account Creation.</strong> In order to create your account on the Platform, you will need to
                  provide information through a Third Party Authenticator. This information will include, at a minimum,
                  your name, email address, and you may provide a photo if you choose. We use this information so that
                  we can provide you with access to the Platform, perform our contract with you, and communicate with
                  you about your account and the accounts for Organizations that you are affiliated with on the
                  Platform. In addition, we may use your email address to send you promotional emails about the Platform
                  and Campsite’s services. You hereby consent to receipt of these promotional emails.
                </li>

                <li>
                  <strong>Posts and Comments.</strong> You will have the option to post content and text to the
                  Platform, and to comment on content and text that other users within the Organizations post to the
                  Platform (collectively, “User Content”). If you or the Organizations choose to use Third Party Apps in
                  connection with the Platform, you will be able to post User Content to the Platform from those Third
                  Party Apps.
                </li>
              </ol>
            </ol>

            <ol type='a'>
              <li>
                <strong>Automatically Collected Information.</strong>
              </li>

              <ol>
                <li>
                  <strong>Browser & Device Information.</strong> Whenever you interact with the Platform, we
                  automatically receive and record information on our server logs from your browser or device, which may
                  include your IP address, geolocation data, device identification, “cookie” information, the type of
                  device you’re using to access the Platform, the amount of time spent on the Platform, and the page or
                  feature you requested. You can learn more about our use of cookies and related technologies in our{' '}
                  <Link href='/cookies'>Cookie Policy</Link>. We use the data we automatically collect from you to
                  customize content for you that we think you might like, based on your usage patterns. We may also use
                  it to improve the Platform – for example, this data can tell us how often users use a particular
                  feature of the Platform, and we can use that knowledge to make the Platform interesting to as many
                  users as possible.
                </li>
                <li>
                  <strong>Emails.</strong> We may receive a confirmation when you open an email from us.
                </li>
              </ol>
            </ol>

            <li>
              <strong>Disclosure of information.</strong> We may disclose your personal information to the categories of
              third parties identified in this section.
            </li>

            <ol type='a'>
              <li>
                <strong>Personnel and Third Party Service Providers.</strong> We employ personnel and engage other
                companies and people to perform tasks on our behalf and need to share your personal information with
                them to provide products or services to you. For example, we use Amazon Web Services to store video and
                images that users post to the Platform.
              </li>

              <li>
                <strong>Organization Access.</strong> Please note that if you submit any personal information or User
                Content to a portion of the Platform that is accessible by other users within an Organization, other
                users affiliated with the Organization will be able to see that personal information and User Content.
                Accordingly, only include personal information in such submissions that you are comfortable sharing with
                other users affiliated with the Organization.
              </li>

              <li>
                <strong>Third Party Apps.</strong> If you or an Organization use Third Party Apps within the Platform,
                Campsite will allow the Third Party Providers to access or use your personal information and User
                Content as required for the interoperation of the Third Party Apps and the Platform. Any Third Party
                Provider’s use of your personal information and User Content is subject to the applicable agreement
                between either (i) the applicable Organization and such Third Party Provider, or (ii) you and the Third
                Party Provider. Campsite is not responsible for any access to or use of your personal information or
                User Content by Third Party Providers. You and the Organizations are solely responsible for the decision
                to permit any Third Party Provider to use your personal information or User Content.
              </li>

              <ol>
                <li>
                  Campsite’s use and transfer to any other app of information received from Google APIs will adhere to{' '}
                  <Link
                    href='https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Google API Services User Data Policy
                  </Link>
                  , including the Limited Use requirements.
                </li>
              </ol>

              <li>
                <strong>Business Transfers.</strong> If we (or our assets) are acquired, or if we go out of business,
                enter bankruptcy, or go through some other change of control, personal information could be one of the
                assets transferred to or acquired by a third party.
              </li>

              <li>
                <strong>Legal Compliance.</strong> We reserve the right to access, read, preserve, and disclose any
                information that we believe is necessary to comply with governmental requests, law or court order, or
                enforce or apply our Terms of Service and other agreements.
              </li>
            </ol>

            <li>
              <strong>Security.</strong> We use commercially reasonable physical, managerial, and technical safeguards
              to preserve the integrity and security of your personal information. In addition, we rely on the technical
              safeguards provided by the third party service providers we use to host, store, and process your personal
              information. We cannot, however, ensure or warrant that your personal information on the Platform may not
              be accessed, disclosed, altered, or destroyed by breach of any of our physical, technical, or managerial
              safeguards. We are not responsible to our users or to any third party due to any such loss, misuse, or
              alteration.
            </li>

            <li>
              <p>
                <strong>Your rights.</strong> Because we have collected your personal information as a result of the
                Organization Agreements, we are a “processor” of your personal information and the Organizations control
                our use of your personal information and determine how and for what purpose we process your personal
                information. If you have any questions or concerns about how your personal information is handled or
                would like to exercise rights you may have as a data subject (including the modification and deletion of
                your personal information), you should contact the applicable Organizations. We will provide assistance
                to the Organizations to address any concerns you may have, in accordance with the terms of the
                Organization Agreements and applicable law.
              </p>

              <p>
                Subject to your right to request deletion of your personal information, we will retain your personal
                information as long as needed for your use of the Platform, your approved receipt of marketing
                communications from us, our compliance with legal obligations, and to protect our or other’s interests.
              </p>
              <p>
                If you have any questions about your rights, please contact us at{' '}
                <Link href='mailto:support@campsite.com'>support@campsite.com</Link>.
              </p>
            </li>

            <li>
              <strong>How we respond to Do Not Track signals.</strong> We do not track you or collect your personal
              information across third party websites or online services. Thus, we do not receive Do-Not-Track signals,
              or other similar signals. To the extent that we do receive any such signals, we will not comply with them
              as it is not an aspect of the functionality of the Platform.
            </li>

            <li>
              <strong>Changes to policy.</strong> We’re constantly trying to improve the Platform, so we may need to
              change this Policy from time to time as well. The date of the last modification will also be posted at the
              beginning of this Policy. It is your responsibility to check from time to time for updates. By continuing
              to access or use the Platform, you are indicating that you agree to be bound by the modified Policy.
            </li>

            <li>
              <strong>Contact us.</strong> If you have any questions or concerns regarding this Policy, please send us a
              detailed message to <Link href='mailto:support@campsite.com'>support@campsite.com</Link>, and we will try
              to resolve your concerns.
            </li>
          </ol>
        </div>
      </WidthContainer>
    </>
  )
}
