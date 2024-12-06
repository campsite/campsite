import { NextSeo } from 'next-seo'
import Link from 'next/link'

import { SITE_URL } from '@campsite/config'

import { WidthContainer } from '@/components/Layouts/WidthContainer'

import { PageHead } from '../components/Layouts/PageHead'

export default function Terms() {
  return (
    <>
      <NextSeo
        title='Terms · Campsite'
        description='Your rights and reponsibilities when using Campsite.'
        canonical={`${SITE_URL}/terms`}
      />

      <WidthContainer className='3xl:pt-32 4xl:pt-36 max-w-4xl gap-4 pt-12 md:pt-16 lg:pt-20 xl:pt-24 2xl:pt-28'>
        <PageHead title='Terms of Service' subtitle='Effective June 8, 2023' />
      </WidthContainer>

      <WidthContainer className='max-w-3xl gap-12 py-16 lg:py-24'>
        <div className='prose lg:prose-lg'>
          <ol type='1'>
            <li>
              <p>
                <strong>Agreement.</strong> The following Terms of Service (the <strong>“Terms”</strong>) constitute a
                binding agreement between you and Campsite Software Co. (<strong>“Campsite,”</strong>{' '}
                <strong>“we,”</strong> <strong>“our,”</strong> and <strong>“us”</strong>), the operator of the Campsite
                platform (the <strong>“Platform”</strong>). These Terms set forth conditions regarding your access to
                and use of the Platform.
              </p>

              <p>By accessing or using the Platform in any manner, you agree to be bound by these Terms.</p>

              <p>
                Your access to and use of the Platform is on behalf of one or more organizations that you are affiliated
                with (each, an <strong>“Organization”</strong>). Campsite and each of the Organizations have entered
                into a separate agreement (the <strong>“Organization Agreement”</strong>) governing Campsite’s provision
                of services to that Organization. These Terms do not alter in any way the terms of the Organization
                Agreements. To the extent these Terms conflict with the Organization Agreements, the terms of the
                Organization Agreements shall control.
              </p>
            </li>

            <li>
              <strong>Modification.</strong> Campsite reserves the right, at its sole discretion, to modify these Terms
              at any time and without prior notice. The date of the last modification to the Terms will be posted at the
              beginning of these Terms. It is your responsibility to check from time to time for updates. By continuing
              to access or use the Platform, you are indicating that you agree to be bound by any modified Terms.
            </li>

            <li>
              <strong>Privacy.</strong> These Terms include the provisions in this document, as well as those in our{' '}
              <Link href='/privacy'>Privacy Policy</Link>.
            </li>

            <li>
              <strong>Acceptable Use.</strong> Campsite hereby grants you permission to access and use the Platform,
              provided such use is in compliance with these Terms, and you further specifically agree that your use will
              adhere to the following restrictions and obligations:
            </li>

            <ul>
              <li>
                You may only use the Platform on behalf of the Organizations and only as permitted in the Organization
                Agreements.
              </li>
              <li>
                You may not transfer your access to others or allow others to access the Platform through your own
                access.
              </li>
              <li>
                You may only use the Platform for lawful activity. It is your responsibility to comply with all
                applicable local, state, and federal laws and regulations.
              </li>
              <li>
                You may not decompile, reverse engineer, or otherwise attempt to obtain the source code or underlying
                ideas or information of or relating to the Platform.
              </li>
              <li>
                You may not enter, store or transmit viruses, worms or other malicious code within, through, to or using
                the Platform.
              </li>
              <li>
                You may not defeat, avoid, bypass, remove, deactivate or otherwise circumvent any software protection
                mechanisms in the Platform.
              </li>
              <li>
                You may not remove or obfuscate any product identification, copyright or other proprietary notice from
                any element of the Platform or associated documentation.
              </li>
            </ul>

            <li>
              <p>
                <strong>User Accounts.</strong> You can create an account by logging into your account with certain
                third-party platforms (“Third Party Authenticators” including, but not limited to, Google). The Third
                Party Authenticator will determine what information we will be able to access and use. Your Campsite
                account will be created for your use of the Platform based on the personal information you provide us or
                that we obtain via the Third Party Authenticator.
              </p>

              <p>
                You and the Organizations are responsible for maintaining the confidentiality of your password and
                account, and are fully responsible for any and all activities that occur under your password or account.
                You agree to (a) immediately notify Campsite of any unauthorized use of your password or account or any
                other breach of security, and (b) ensure that you exit from your account at the end of each session when
                accessing the Platform. Campsite will not be liable for any loss or damage arising from your failure to
                comply with this section.
              </p>

              <p>
                If you would like us to terminate your account, please follow the procedures set forth in our{' '}
                <Link href='/privacy'>Privacy Policy.</Link>
              </p>

              <p>You may not transfer your account to anyone else without our prior written permission.</p>
            </li>

            <li>
              <p>
                <strong>Content.</strong> Each Organization owns all of the content that it submits through the
                Platform, including any content that you or other representatives of the Organization submit through the
                Platform (collectively, the <strong>“Organization Content”</strong>). Other than the Organization
                Content, Campsite owns all right, title and interest in and to the materials available through the
                Platform, including, but not limited to, text, graphics, data, articles, photos, images, videos, and
                illustrations (all of the foregoing except Organization Content, the <strong>“Campsite Content”</strong>
                ).
              </p>

              <p>
                You may not use, copy, adapt, modify, prepare derivative works based upon, distribute, license, sell,
                transfer, publicly display, transmit, broadcast, or otherwise exploit the Campsite Content, except as
                necessary to access and use the Platform on behalf of the Organizations in accordance with these Terms
                and the Organization Agreements.
              </p>
            </li>

            <li>
              <strong>Third Party Apps.</strong> You or the Organizations may choose to use certain third party products
              or services in connection with Platform (the <strong>“Third Party Apps”</strong>). Your use of any Third
              Party App is subject to a separate agreement either between the applicable Organization and the provider
              of that Third Party App (the <strong>“Third Party Provider”</strong>) or you and the Third Party Provider.
              You hereby acknowledge that Campsite does not control such Third Party Providers or Third Party Apps, and
              cannot be held responsible for their content, operation, or use. Campsite does not make any
              representation, warranty, or endorsement, express or implied, with respect to the legality, accuracy,
              quality, or authenticity of content, information, or services provided by Third Party Apps. CAMPSITE
              HEREBY DISCLAIMS ALL LIABILITY AND RESPONSIBILITY FOR ANY THIRD PARTY APPS AND FOR THE ACTS OR OMISSIONS
              OF ANY THIRD PARTY PROVIDERS, and you hereby irrevocably waive any claim against Campsite with respect to
              the content or operation of any Third Party Apps.
            </li>

            <li>
              <strong>Feedback.</strong> We welcome and encourage you to provide feedback, comments and suggestions for
              improvements to the Platform (<strong>“Feedback”</strong>). You agree that Campsite has the right, but not
              the obligation, to use such Feedback without any obligation to provide you credit, royalty payment, or
              ownership interest in the changes to the Platform.
            </li>

            <li>
              <p>
                <strong>Termination.</strong> Campsite may immediately and without notice terminate these Terms and
                disable your access to the Platform if Campsite determines, in its sole discretion, that (a) you have
                breached these Terms, or (b) you have violated applicable laws, regulations or third party rights. In
                addition, if all of the Organization Agreements expire or are terminated for any reason, Campsite will
                immediately terminate these Terms and your access to the Platform. Campsite may temporarily suspend your
                access to the Platform under certain circumstances set forth in the Organization Agreements.
              </p>

              <p>
                Provisions that, by their nature, should survive termination of these Terms shall survive termination.
                By way of example, all of the following will survive termination: any limitations on our liability, any
                terms regarding ownership or intellectual property rights, and terms regarding disputes between us.{' '}
              </p>
            </li>

            <li>
              <p>
                <strong>Disclaimer of Warranties.</strong> YOU HEREBY ACKNOWLEDGE THAT YOU ARE USING THE PLATFORM AT
                YOUR OWN RISK. THE PLATFORM AND CAMPSITE CONTENT ARE PROVIDED ”AS IS,“ AND CAMPSITE, ITS AFFILIATES AND
                ITS THIRD PARTY SERVICE PROVIDERS HEREBY DISCLAIM ANY AND ALL WARRANTIES, EXPRESS AND IMPLIED, INCLUDING
                BUT NOT LIMITED TO ANY WARRANTIES OF ACCURACY, RELIABILITY, MERCHANTABILITY, NON-INFRINGEMENT, FITNESS
                FOR A PARTICULAR PURPOSE, AND ANY OTHER WARRANTY, CONDITION, GUARANTEE OR REPRESENTATION, WHETHER ORAL,
                IN WRITING OR IN ELECTRONIC FORM. CAMPSITE, ITS AFFILIATES, AND ITS THIRD PARTY SERVICE PROVIDERS DO NOT
                REPRESENT OR WARRANT THAT ACCESS TO THE PLATFORM WILL BE UNINTERRUPTED OR THAT THERE WILL BE NO
                FAILURES, ERRORS OR OMISSIONS OR LOSS OF TRANSMITTED INFORMATION, OR THAT NO VIRUSES WILL BE TRANSMITTED
                THROUGH THE PLATFORM.
              </p>

              <p>
                Because some states do not permit disclaimer of implied warranties, you may have additional rights under
                your local laws.
              </p>
            </li>

            <li>
              <strong>Limitation of Liability.</strong> YOUR ACCESS TO AND USE OF THE PLATFORM IS ON BEHALF OF ONE OR
              MORE ORGANIZATIONS. ACCORDINGLY, TO THE FULLEST EXTENT ALLOWED BY APPLICABLE LAW, UNDER NO CIRCUMSTANCES
              AND UNDER NO LEGAL THEORY (INCLUDING, WITHOUT LIMITATION, TORT, CONTRACT, STRICT LIABILITY, OR OTHERWISE)
              SHALL CAMPSITE (OR ITS LICENSORS OR SUPPLIERS) BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, SPECIAL,
              INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND, INCLUDING DAMAGES FOR LOST PROFITS, LOSS OF GOODWILL,
              WORK STOPPAGE, ACCURACY OF RESULTS, OR COMPUTER FAILURE OR MALFUNCTION.
            </li>

            <li>
              <strong>Notices.</strong> Any notices or other communications permitted or required hereunder will be in
              writing and given by Campsite (a) via email (in each case to the address that you provide) or (b) by
              posting to the website.
            </li>

            <li>
              <strong>No Waiver.</strong> The failure of Campsite to enforce any right or provision of these Terms will
              not constitute a waiver of future enforcement of that right or provision.
            </li>

            <li>
              <strong>Assignment.</strong> You may not assign or transfer these Terms, by operation of law or otherwise,
              without Campsite’s prior written consent. Any attempt by you to assign or transfer these Terms without
              such consent will be null and of no effect. Campsite may assign or transfer these Terms, at its sole
              discretion, without restriction. Subject to the foregoing, these Terms will bind and inure to the benefit
              of the parties, their successors and permitted assigns. Unless a person or entity is explicitly identified
              as a third party beneficiary to these Terms, these Terms do not and are not intended to confer any rights
              or remedies upon any person or entity other than the parties.
            </li>

            <li>
              <strong>Severability.</strong> If for any reason an arbitrator or a court of competent jurisdiction finds
              any provision of these Terms invalid or unenforceable, that provision will be enforced to the maximum
              extent permissible and the other provisions of these Terms will remain in full force and effect.
            </li>

            <li>
              <strong>Governing Law; Venue.</strong> The laws of the State of California, without reference to its
              choice or law or conflict of law rules or principles, shall govern these Terms and any dispute of any sort
              that might arise between you and Campsite with respect to these Terms. Notwithstanding the foregoing, you
              acknowledge that since your access and use of the Platform is on behalf of one or more Organizations and
              subject to the Organization Agreements, any dispute arising out of your use of the Platform shall be
              handled in accordance with the dispute resolution process set forth in the applicable Organization
              Agreements.
            </li>

            <li>
              <strong>Entire Agreement.</strong> These Terms constitute the entire agreement between you and Campsite
              regarding your use of the Platform, and supersede all prior written or oral agreements other than the
              Organization Agreements.
            </li>

            <li>
              <strong>Contact Us.</strong> If you have any questions about the Platform, please do not hesitate to
              contact us at support@campsite.com or our <Link href='/contact'>contact page</Link>.
            </li>
          </ol>
        </div>
      </WidthContainer>
    </>
  )
}
