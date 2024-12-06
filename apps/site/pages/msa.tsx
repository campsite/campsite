/* eslint-disable max-lines */
import { NextSeo } from 'next-seo'
import Link from 'next/link'

import { SITE_URL } from '@campsite/config'

import { WidthContainer } from '@/components/Layouts/WidthContainer'

import { PageHead } from '../components/Layouts/PageHead'

export default function MSA() {
  return (
    <>
      <NextSeo
        title='Master Service Agreement · Campsite'
        description='For questions and support, contact us at support@campsite.com.'
        canonical={`${SITE_URL}/msa`}
      />

      <WidthContainer className='3xl:pt-32 4xl:pt-36 max-w-4xl pt-12 md:pt-16 lg:pt-20 xl:pt-24 2xl:pt-28'>
        <PageHead title='Master Service Agreement' subtitle='Effective June 21, 2024' />
      </WidthContainer>

      <WidthContainer className='max-w-3xl gap-12 py-16 lg:py-24'>
        <div className='prose lg:prose-lg'>
          <p>
            This Master Services Agreement (this <strong>“Agreement”</strong>) is dated as of the effective date of the
            initial Order Form (as defined below) (the <strong>“Effective Date”</strong>) and is entered into between
            Campsite Software Co., a Delaware corporation (<strong>“Campsite”</strong>), and the customer identified on
            the initial Order Form (<strong>“Customer”</strong>) (Customer and Campsite are referred to herein
            individually as a <strong>“Party”</strong> and collectively as the <strong>“Parties”</strong>).
          </p>
          <p>
            If you (the person accepting this Agreement) are accepting this Agreement on behalf of the Customer, you
            agree that: (i) you have full legal authority to bind the Customer to this Agreement, and (ii) you agree to
            this Agreement on behalf of the Customer.{' '}
          </p>
          <p>
            By clicking on the “Agree” (or similar button or checkbox) that is presented to you at the time of executing
            an Order Form, you bind the Customer to this Agreement. If you do not wish to bind the Customer to this
            Agreement, do not click “Agree” (or similar button or checkbox).
          </p>
          <p>
            In consideration of the foregoing premises and the mutual covenants set forth herein and for other good and
            valuable consideration, the receipt and sufficiency of which is hereby acknowledged, the Parties agree as
            follows:
          </p>
          <h2>
            <strong>1. Access to Platform</strong>
          </h2>
          <p>
            <strong>1.1 Platform Overview</strong>
          </p>
          <p>
            Campsite has developed a proprietary platform for software teams to share and organize works-in-progress,
            give feedback, and create social connection across team boundaries (the <strong>“Platform”</strong>).
          </p>
          <p>
            <strong>1.2 Platform License</strong>
          </p>
          <p>
            Subject to Customer’s compliance with the terms and conditions hereof, Campsite hereby grants to Customer a
            limited, non-transferable, and non-exclusive license (the <strong>“License”</strong>) to access and use the
            Platform during the Term solely in accordance with the terms of this Agreement and any specifications,
            instructions, and documentation (collectively, the <strong>“Documentation”</strong>) provided by Campsite
            from time to time. The License shall be subject to the terms and conditions of one or more order forms to be
            executed between Campsite and Customer (each, an <strong>“Order Form”</strong>). Customer shall use the
            Platform and the Documentation solely for its own internal business purposes and in accordance with the
            limitations, if any, set forth on an Order Form.
          </p>
          <p>
            <strong>1.3 Modifications to the Platform</strong>
          </p>
          <p>
            Campsite may modify and/or update the Platform from time to time, so long as such modification(s) do not
            materially reduce the Platform’s performance or capabilities. Campsite shall have no liability for any
            damage, liabilities, losses (including any loss of data or profits), or any other consequences that
            Customer, any of Customer’s authorized employees and personnel who are authorized to access the Platform and
            Documentation on behalf of Customer (<strong>“Authorized Users”</strong>), or any other third party may
            incur as a result of modifications to the Platform in accordance with this Section 1.3.
          </p>
          <p>
            <strong>1.4 Platform Support</strong>
          </p>
          <p>
            Campsite will provide technical support to Customer via both telephone and email on weekdays during the
            hours of 9:00 am through 5:00 pm Pacific time, with the exclusion of federal holidays.
          </p>

          <h2>
            <strong>2. Financial Terms</strong>
          </h2>
          <p>
            <strong>2.1 Fees</strong>
          </p>
          <p>
            In consideration for the grant of the License, Customer shall pay to Campsite the fees set forth in the
            applicable Order Form (the “Fees”) in accordance with this Section 2. Any Fees expressed in a fixed monthly
            amount shall be prorated for any partial month of service based on the number of days the applicable Order
            Form was in effect during the month and the actual number of days in such month.
          </p>
          <p>
            <strong>2.2 Invoices</strong>
          </p>
          <p>
            Unless otherwise indicated on an Order Form, all invoices shall be due and payable within thirty (30) days
            of the date of the invoice.
          </p>
          <p>
            <strong>2.3 Method of Payment</strong>
          </p>
          <p>
            Unless Campsite states otherwise in writing, all amounts due and payable hereunder shall be paid (a) in U.S.
            Dollars, and (b) by check or cash in immediately available funds to an account designated by Campsite, by
            credit/debit card via an authorized Campsite payment processor, or by any other method approved in writing
            by Campsite.
          </p>
          <p>
            <strong>2.4 Interest and Taxes</strong>
          </p>
          <p>
            Interest on any late payments will accrue at the rate of 1% per month, or the highest rate permitted by
            applicable law, whichever is lower, from the date such amount is due until the date such amount is paid in
            full. Customer will be responsible for, and will pay all sales and similar taxes, and all similar fees
            levied upon the provision of the Platform, excluding only taxes based solely on Campsite’s income. Customer
            will indemnify and hold Campsite harmless from and against any and all such taxes and related amounts levied
            upon the provision of the Platform and any costs associated with the collection or withholding thereof,
            including penalties and interest.
          </p>
          <h2>
            <strong>3. Customer Restrictions and Responsibilities</strong>
          </h2>
          <p>
            <strong>3.1 Restrictions on Use of Platform</strong>
          </p>
          <p>
            Restrictions on Use of Platform. Except as expressly authorized by this Agreement, Customer may not: (a)
            modify, disclose, alter, translate or create derivative works of the Platform or the Documentation (or any
            components of the foregoing); (b) sublicense, resell, distribute, lease, rent, lend, transfer, assign or
            otherwise dispose of the Platform or the Documentation (or any components of the foregoing); (c) reverse
            engineer, disassemble, decompile, decode, adapt, or otherwise attempt to derive or gain access to any source
            code, object code, or underlying structure, ideas, or algorithms of the Platform, in whole or in part; (d)
            use the Platform to store or transmit any viruses, software routines or other code designed to permit
            unauthorized access, to disable, erase or otherwise harm software, hardware or data, or to perform any other
            harmful actions; (e) use the Platform or Documentation in any manner or for any purpose that infringes,
            misappropriates, or otherwise violates any intellectual property right or other right of any person, or that
            violates any applicable Laws; (f) interfere with or disable any features, functionality, or security
            controls of the Platform or otherwise circumvent any protection mechanisms for the Platform; (g) copy, frame
            or mirror any part or content of the Platform; (h) build a competitive product or service, or copy any
            features or functions of the Platform; (i) interfere with or disrupt the integrity or performance of the
            Platform; (j) attempt to gain unauthorized access to the Platform or related systems or networks; (k)
            disclose to any third party any performance information or analysis relating to the Platform; (l) use the
            components of the Platform or allow the transfer, transmission, export or re-export of such software
            components or any portion thereof in violation of any export control Laws administered by the U.S. Commerce
            Department, OFAC, or any other government agency; (m) remove, alter or obscure any proprietary notices in or
            on the Platform, including any copyright notices, or (n) cause its personnel or any third party to do any of
            the foregoing. Customer shall use its best efforts to prevent unauthorized access to, and use of, any
            passwords, and will immediately notify Campsite in writing of any unauthorized use that comes to Customer’s
            attention. Notwithstanding anything to the contrary in this Agreement, Campsite may temporarily suspend or
            permanently revoke Customer’s access to the Platform if Campsite determines or reasonably suspects that
            Customer has or intends to violate, or has assisted others in violating or preparing to violate, any
            provision of this Section 3 (any such temporary suspension, a <strong>“Service Suspension”</strong> and any
            such revocation, a <strong>“Service Revocation”</strong>). Campsite shall have no liability for any damage,
            liabilities, losses (including any loss of data or profits), or any other consequences that Client or any
            third party may incur as a result of a Service Suspension or Service Revocation, and Client shall not be
            entitled to any refunds of any Fees on account of any Service Suspension or Service Revocation. Any breach
            by Customer of any provision of this Section 3 shall be a material breach.
          </p>
          <p>
            <strong>3.2 Customer Responsibilities</strong>
          </p>
          <p>
            Customer shall be solely responsible for: (a) obtaining and maintaining any equipment and ancillary services
            needed to connect to, access or otherwise use the Platform; (b) maintaining the security of Customer’s
            infrastructure, equipment, accounts, passwords (including but not limited to administrative and user
            passwords) and files; and (c) all acts and omissions of Authorized Users in connection with their use of the
            Platform. Customer acknowledges that each Authorized User’s use of the Platform is also subject to
            Campsite’s Terms of Service, available at <Link href='/terms'>https://www.campsite.com/terms</Link>, and
            Campsite’s Privacy Policy, available at <Link href='/privacy'>https://www.campsite.com/privacy</Link>.
          </p>
          <p>
            <strong>3.3 Inappropriate and Illegal Content Prohibited</strong>
          </p>
          <p>
            Customer agrees not to transmit any inappropriate content on the Platform including, but not limited to,
            content that advocates or encourages conduct that could constitute a criminal offense, give rise to civil
            liability, or otherwise violate any applicable local, state, national, or foreign law or regulation.
            Campsite may remove such content from Campsite’s servers, and Campsite may suspend or revoke Customer’s
            access to the Platform. Campsite reserves the right to investigate, and seek applicable remedies for,
            violations of applicable law to the fullest extent of the law.
          </p>
          <p>
            <strong>3.4 Customer’s Use of Others’ Intellectual Property</strong>
          </p>
          <p>
            Campsite reserves the right to suspend and/or revoke access to the Platform for any Authorized User who is
            alleged to, or is found to have infringed on the intellectual property rights of Campsite or third parties,
            or otherwise is alleged to, or is found to have violated any intellectual property laws.
          </p>
          <p>
            <strong>3.5 Third Party App Integrations</strong>
          </p>
          <p>
            Customer may have the ability to use certain third party products or services in connection with Platform
            (the “Third Party Apps”). Customer’s use of any Third Party App is subject to a separate agreement between
            Customer and the provider of that Third Party App (the “Third Party Provider”). If Customer enables or uses
            Third Party Apps within the Platform, Campsite will allow the Third Party Provider to access or use Customer
            Data and Customer Content as required for the interoperation of the Third Party App and the Platform. Any
            Third Party Provider’s use of Customer Data and Customer Content is subject to the applicable agreement
            between Customer and such Third Party Provider. Campsite is not responsible for any access to or use of
            Customer Data or Customer Content by Third Party Providers. Customer is solely responsible for its decision
            to permit any Third Party Provider to use Customer Data or Customer Content. CAMPSITE HEREBY DISCLAIMS ALL
            LIABILITY AND RESPONSIBILITY FOR ANY THIRD PARTY APPS OR FOR THE ACTS OR OMISSIONS OF ANY THIRD PARTY
            PROVIDERS.
          </p>
          <h2>
            <strong>4. Confidentiality</strong>
          </h2>

          <p>
            <strong>4.1 Definition</strong>
          </p>
          <p>
            <strong>“Confidential Information”</strong> means all information disclosed (whether in oral, written, or
            other tangible or intangible form) by one Party (the <strong>“Disclosing Party”</strong>) to the other Party
            (the <strong>“Receiving Party”</strong>) concerning or related to this Agreement or the Disclosing Party
            (whether before, on, or after the Effective Date) that is marked “Confidential” or “Proprietary” or with
            similar designation by the Disclosing Party, or that otherwise should reasonably be deemed to be
            confidential based on the context and nature of the information. Confidential Information includes, but is
            not limited to, computer programs in source and/or object code, technical drawings, algorithms, know-how,
            prototypes, models, samples, formulas, processes, ideas, inventions (whether patentable or not),
            discoveries, methods, strategies and techniques, research, development, design details and specifications,
            financial information, procurement and/or purchasing requirements, customer lists, information about
            investors, employees, business or contractual relationships, sales and merchandising data, business
            forecasts and marketing plans, and similar information.
          </p>
          <p>
            <strong>4.2 Obligations</strong>
          </p>
          <p>
            The Receiving Party shall maintain in confidence the Confidential Information during the Term and for a
            period of two (2) years thereafter, and will not use such Confidential Information except as expressly
            permitted in this Agreement; provided, however, that any trade secrets shall be treated confidentially for
            so long as such information qualifies for protection as trade secret under applicable law. The Receiving
            Party will use the same degree of care in protecting the Confidential Information as the Receiving Party
            uses to protect its own confidential and proprietary information from unauthorized use or disclosure, but in
            no event less than reasonable care. Confidential Information will be used by the Receiving Party solely for
            the purpose of carrying out the Receiving Party’s obligations under this Agreement. In addition, the
            Receiving Party will only disclose Confidential Information to its directors, officers, employees and/or
            contractors who have a need to know such Confidential Information in order to perform their duties under
            this Agreement, and only if such directors, officers, employees and/or contractors are bound by
            confidentiality obligations with respect to such Confidential Information no less restrictive than the
            non-disclosure obligations contained in this Section 4.2. The Parties agree that Customer Data and Customer
            Content (each as defined below) shall be considered Customer’s Confidential Information and the terms and
            conditions of this Agreement will be treated as Confidential Information of both Parties and will not be
            disclosed to any third party; provided, however, that each Party may disclose the terms and conditions of
            this Agreement (a) to such Party’s legal counsel, accountants, banks, financing sources and their advisors,
            (b) in connection with the enforcement of this Agreement or rights under this Agreement, or (c) in
            connection with an actual or proposed merger, acquisition, or similar transaction.
          </p>
          <p>
            <strong>4.3 Exceptions</strong>
          </p>
          <p>
            Notwithstanding anything to the contrary herein, Confidential Information will not include information that:
            (a) is in or enters the public domain without breach of this Agreement and through no fault of the Receiving
            Party; (b) the Receiving Party can reasonably demonstrate was in its possession prior to first receiving it
            from the Disclosing Party; (c) the Receiving Party can demonstrate was developed by the Receiving Party
            independently, and without use of or reference to, the Confidential Information; or (d) the Receiving Party
            receives from a third party without restriction on disclosure and without breach of a nondisclosure
            obligation. In addition, the Receiving Party may disclose Confidential Information that is required to be
            disclosed by applicable Laws or by a subpoena or order issued by a court of competent jurisdiction or other
            governmental authority (each, an <strong>“Order”</strong>), but solely on the conditions that the Receiving
            Party, to the extent permitted by applicable Laws: (i) gives the Disclosing Party written notice of the
            Order promptly after receiving it; and (ii) cooperates fully with the Disclosing Party before disclosure to
            provide the Disclosing Party with the opportunity to interpose any objections it may have to the disclosure
            of the information required by the Order and seek a protective order or other appropriate relief. In the
            event of any dispute between the Parties as to whether specific information is within one or more of the
            exceptions set forth in this Section 4.3, the Receiving Party will bear the burden of proof, by clear and
            convincing evidence, that such information is within the claimed exception(s).
          </p>
          <p>
            <strong>4.4 Remedies</strong>
          </p>
          <p>
            The Receiving Party acknowledges that any unauthorized disclosure of Confidential Information will result in
            irreparable injury to the Disclosing Party, which injury could not be adequately compensated by the payment
            of money damages. In addition to any other legal and equitable remedies that may be available, the
            Disclosing Party will be entitled to seek and obtain injunctive relief against any breach or threatened
            breach by the Receiving Party of the confidentiality obligations hereunder, from any court of competent
            jurisdiction, without being required to show any actual damage or irreparable harm, prove the inadequacy of
            its legal remedies, or post any bond or other security.
          </p>
          <h2>
            <strong>5. Intellectual Property Rights</strong>
          </h2>
          <p>
            <strong>5.1 Generally</strong>
          </p>
          <p>
            Except as specified in Section 5.3, no provision of this Agreement shall be construed as an assignment or
            transfer of ownership of any copyrights, patents, trade secrets, trademarks, or any other intellectual
            property rights (collectively, <strong>“Intellectual Property Rights”</strong>) from either Party to the
            other.
          </p>
          <p>
            <strong>5.2 Platform</strong>
          </p>
          <p>
            Campsite shall own and retain all right, title and interest in and to: (a) the name, logo, trademarks, and
            service marks (collectively, <strong>“Marks”</strong>) associated with its business; (b) the Platform and
            the Documentation; (c) all improvements, enhancements and modifications to the Platform and the
            Documentation; and (d) all Intellectual Property Rights related to any of the foregoing. Campsite reserves
            all rights in and to the Platform and the Documentation not expressly granted to Customer in this Agreement.
            Except for the rights and licenses expressly granted in this Agreement, nothing in this Agreement grants to
            Customer or any third party, by implication, waiver, estoppel, or otherwise, any right, title, or interest
            in or to the Platform or the Documentation.
          </p>
          <p>
            <strong>5.3 Feedback</strong>
          </p>
          <p>
            If Customer or any of its Authorized Users submits written suggestions or recommended changes to the
            Platform, including without limitation, new features or functionality relating thereto, or any comments,
            questions, suggestions, or the like (collectively, the <strong>“Feedback”</strong>), Campsite is free to use
            such Feedback regardless of any other obligation or limitation between the Parties governing such Feedback.
            Customer hereby assigns to Campsite, on Customer’s behalf and on behalf of its Authorized Users and/or
            agents, all Intellectual Property Rights in and to the Feedback, for any purpose whatsoever, although
            Campsite is not required to use any Feedback.
          </p>
          <p>
            <strong>5.4 Use of Customer Marks and Customer Consent</strong>
          </p>
          <p>
            Customer shall own and retain all right, title and interest in and to the Marks relating to Customer’s
            business, the Customer Content, and all Intellectual Property Rights related thereto. Customer hereby grants
            Campsite the right to access, use, and process the Customer Marks and Customer Content to provide the
            functionality of the Platform to Customer during the Term. As used herein,{' '}
            <strong>“Customer Content”</strong> means any content uploaded by Customer to the Platform, including as
            modified by Customer through the Platform.
          </p>
          <h2>
            <strong>6. Data</strong>
          </h2>
          <p>
            <strong>6.1 Ownership of Customer Data</strong>
          </p>
          <p>
            All Customer Data (as defined below), including any Customer Data input into the Platform by Customer or
            generated through Customer’s use of the Platform, shall belong to Customer, provided that Customer hereby
            grants Campsite the right to access, use, and process such Customer Data to provide the functionality of the
            Platform to Customer during the Term. Customer acknowledges and agrees that Customer is solely responsible
            for any and all Customer Data that is input into the Platform by Customer, including such Customer Data’s
            legality, reliability, and appropriateness. As used herein, <strong>“Customer Data”</strong> means data
            uploaded by Customer or resulting from Customer’s use of the Platform, including Employee Personal Data and
            Third Party Personal Data (as such terms are defined below).
          </p>
          <p>
            <strong>6.2 Anonymized Data</strong>
          </p>
          <p>
            Customer acknowledges and agrees that Campsite may anonymize and aggregate Customer Data in a manner that it
            can no longer reasonably be used to identify individuals (<strong>“Anonymized Data”</strong>). Customer
            grants Campsite and its affiliates, an unlimited, perpetual, and irrevocable license to use the Anonymized
            Data for the purpose of improving the Platform, and to understand and analyze trends across Campsite’s
            customers.
          </p>
          <p>
            <strong>6.3 Data Protection Measures</strong>
          </p>
          <p>
            To the extent that Customer Data includes personal data subject to applicable data protection laws,
            including the EU General Data Protection Regulation and the California Consumer Privacy Act, the terms of
            the Data Processing Agreement available at <Link href='/dpa'>https://campsite.com/dpa</Link> (the{' '}
            <strong>“DPA”</strong>) shall govern the processing of such data. The Parties agree that Campsite may amend
            the terms of the DPA from time to time to the extent that Campsite reasonably determines that such amendment
            is necessary to comply with applicable data protection laws. The latest posted version of the DPA shall
            govern the processing of personal data subject to applicable data protection laws.
          </p>
          <p>
            <strong>6.4 Employee and Third Party Data</strong>
          </p>
          <p>
            Customer acknowledges that, as part of its use of the Platform, Customer may transmit personal data of
            Employees (<strong>“Employee Personal Data”</strong>) and personal data of third parties (
            <strong>“Third Party Personal Data”</strong>). To the extent Customer transmits or inputs any Employee
            Personal Data or Third Party Personal Data through or into the Platform, Customer represents and warrants
            that it has obtained all legally required consent to capture, collect, display, input, share and transmit
            such Employee Personal Data and Third Party Personal Data into and through the Platform.
          </p>
          <h2>
            <strong>7. Representations, Warranties and Remedies</strong>
          </h2>
          <p>
            <strong>7.1 Generally</strong>
          </p>
          <p>
            Each Party represents and warrants that (a) it is validly existing and in good standing under the Laws of
            the place of its establishment or incorporation, (b) it has full corporate power and authority to execute,
            deliver and perform its obligations under this Agreement, (c) the person signing this Agreement on its
            behalf has been duly authorized and empowered to enter into this Agreement, and (d) this Agreement is valid,
            binding and enforceable against it in accordance with its terms, except to the extent limited under Laws
            relating to insolvency, bankruptcy, and the like.
          </p>
          <p>
            <strong>7.2 Campsite’s Representations and Warranties</strong>
          </p>
          <p>
            Campsite represents and warrants that the Platform will conform, in all material respects, to the
            Documentation and any other specifications set forth in the applicable Order Form.
          </p>
          <p>
            <strong>7.3 Customer’s Representations and Warranties</strong>
          </p>
          <p>
            Customer represents and warrants that Customer: (a) will use the Platform only in compliance with this
            Agreement and all applicable local, state, federal and international laws and regulations, rules, orders,
            and ordinances (collectively, <strong>“Laws”</strong>); and (b) shall not infringe upon any third party’s
            Intellectual Property Rights in its use of the Platform.
          </p>
          <p>
            <strong>7.4 Disclaimer</strong>
          </p>
          <p>
            THE PLATFORM IS PROVIDED “AS-IS” AND “AS-AVAILABLE.” EXCEPT AS EXPRESSLY SET FORTH IN THIS AGREEMENT,
            CAMPSITE DISCLAIMS ANY AND ALL REPRESENTATIONS OR WARRANTIES (EXPRESS OR IMPLIED, ORAL OR WRITTEN) WITH
            RESPECT TO THE PLATFORM PROVIDED UNDER THIS AGREEMENT, WHETHER ALLEGED TO ARISE BY OPERATION OF LAW, BY
            REASON OF CUSTOM OR USAGE IN THE TRADE, BY COURSE OF DEALING OR OTHERWISE, INCLUDING ANY AND ALL: (A)
            WARRANTIES OF MERCHANTABILITY; (B) WARRANTIES OF FITNESS OR SUITABILITY FOR ANY PURPOSE (WHETHER OR NOT
            CAMPSITE KNOWS, HAS REASON TO KNOW, HAS BEEN ADVISED, OR IS OTHERWISE AWARE OF ANY SUCH PURPOSE); AND (C)
            WARRANTIES OF NONINFRINGEMENT OR CONDITION OF TITLE.
          </p>
          <h2>
            <strong>8. Indemnification Obligations</strong>
          </h2>
          <p>
            <strong>8.1 Campsite Indemnity</strong>
          </p>
          <p>
            Campsite, at its sole expense, will defend Customer and its affiliates, directors, officers, employees, and
            agents (<strong>“Customer Indemnitees”</strong>) from and against third-party claims, suits, actions or
            proceedings (each a <strong>“Claim”</strong>) and indemnify Customer from any related damages, payments,
            deficiencies, fines, judgments, settlements, liabilities, losses, costs, and expenses (including, but not
            limited to, reasonable attorneys’ fees, costs, penalties, interest and disbursements) (collectively,{' '}
            <strong>“Losses”</strong>) that are awarded by a court of competent jurisdiction or included in a settlement
            approved, in advance and in writing, by Campsite to the extent arising from or relating to (a) a Claim that
            the Platform infringes the Intellectual Property Rights of any third party, (b) any gross negligence or
            willful misconduct by Campsite; or (c) any alleged or actual breach of Campsite’s representations,
            warranties and obligations under this Agreement. In the event of a Claim pursuant to Section 8.1(a),
            Campsite may, at its option and expense (i) obtain for Customer the right to continue to exercise the rights
            granted to Customer under this Agreement; (ii) substitute the allegedly infringing component for an
            equivalent non-infringing component; or (iii) modify the Platform to make it non-infringing. If none of
            subparts (i), (ii), or (iii) in the foregoing sentence are obtainable on commercially reasonable terms,
            Campsite may terminate this Agreement, effective immediately, by written notice to Customer. Upon a
            termination of this Agreement pursuant to this Section 8.1, Customer must cease using the Platform and
            Campsite will refund the Fees Customer paid to Campsite for the Platform adjusted pro-rata for any period
            during the Term when the Platform was provided to Customer. Campsite’s indemnification obligations do not
            extend to Claims arising from or relating to: (i) any negligent or willful misconduct of Customer
            Indemnitees; (ii) any combination of the Platform (or any portion thereof) by Customer Indemnitees with any
            equipment, software, data (including Customer Data) or any other materials not approved by Campsite; (iii)
            any modification to the Platform by Customer Indemnitees not expressly authorized by Campsite; (iv) the use
            of the Platform by Customer Indemnitees in a manner contrary to the terms of this Agreement where the
            infringement would not have occurred but for such use; (v) the continued use of the Platform after Campsite
            has provided substantially equivalent non-infringing software or services; or (vi) any Customer services or
            products.
          </p>
          <p>
            <strong>8.2 Customer Indemnity</strong>
          </p>
          <p>
            Customer, at its sole expense, will defend Campsite and its affiliates, directors, officers, employees, and
            agents (<strong>“Campsite Indemnitees”</strong>) from and against any Claims and indemnify Campsite
            Indemnitees from any related Losses to the extent arising from or relating to (a) any gross negligence or
            willful misconduct by Customer Indemnitees or any other party acting on Customer’s behalf; (b) any alleged
            or actual breach of Customer’s representations, warranties and obligations under this Agreement; (c) the use
            of the Platform by Customer Indemnitees, including without limitation any claim by Customer’s employees or
            agents related to the use of the Platform by Customer Indemnitees; (d) any violation of applicable Laws and
            Orders by Customer Indemnitees; and (e) a Claim that the Customer Content infringes the Intellectual
            Property Rights of any third party.
          </p>
          <p>
            <strong>8.3 Procedures</strong>
          </p>
          <p>
            The obligations of each Party to indemnify the other pursuant to this Section 8 are conditioned upon the
            indemnified Party: (a) giving prompt written notice of the Claim to the indemnifying Party once the
            indemnified Party becomes aware of the Claim (provided that failure to provide prompt written notice to the
            indemnifying Party will only alleviate an indemnifying Party’s obligations under Section 8 to the extent
            that any associated delay materially prejudices or impairs the defense of the related Claims); (b) granting
            the indemnifying Party the option to take sole control of the defense (including granting the indemnifying
            Party the right to select and use counsel of its own choosing) and settlement of the Claim (except that the
            indemnified Party’s prior written approval will be required for any settlement that reasonably can be
            expected to require an affirmative obligation of the indemnified Party); and (c) providing reasonable
            cooperation to the indemnifying Party and, at the indemnifying Party’s request and expense, assistance in
            the defense or settlement of the Claim.
          </p>
          <h2>
            <strong>9. Limitation of Liability</strong>
          </h2>
          <p>
            TO THE EXTENT PERMITTED BY APPLICABLE LAW, (A) NEITHER PARTY WILL BE LIABLE FOR ANY LOSS OF PROFITS OR ANY
            INDIRECT, SPECIAL, INCIDENTAL, RELIANCE OR CONSEQUENTIAL DAMAGES OF ANY KIND, REGARDLESS OF THE FORM OF
            ACTION, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY OR OTHERWISE, EVEN IF INFORMED OF
            THE POSSIBILITY OF SUCH DAMAGES IN ADVANCE; AND (B) EXCEPT FOR CUSTOMER’S OBLIGATION TO PAY THE FEES, A
            BREACH OF SECTION 4 (CONFIDENTIALITY) OR SECTION 5 (INTELLECTUAL PROPERTY RIGHTS), AND EACH PARTY’S
            INDEMNIFICATION OBLIGATIONS AS SET FORTH IN SECTION 8, EACH PARTY’S AGGREGATE LIABILITY TO THE OTHER PARTY
            WILL NOT EXCEED THE FEES ACTUALLY PAID BY CUSTOMER TO CAMPSITE DURING THE TWELVE (12) MONTH PERIOD
            IMMEDIATELY PRECEDEING THE EVENT WHICH GAVE RISE TO SUCH LIABILITY.
          </p>
          <h2>
            <strong>10. Term, Termination and Effect of Termination</strong>
          </h2>
          <p>
            <strong>10.1. Term</strong>
          </p>
          <p>
            This Agreement commences upon the Effective Date and continues in effect until the expiration of the period
            specified in the initial Order Form (the <strong>“Initial Term”</strong>). After the expiration of the
            Initial Term, this Agreement shall automatically renew for successive terms of the duration set forth in the
            Order Form (each, a <strong>“Renewal Term”</strong>, and together with the Initial Term, the{' '}
            <strong>“Term”</strong>), unless either Party gives the other Party notice of non-renewal at least thirty
            (30) days prior to the end of the then-current term, in which case the Agreement will terminate at the
            expiration of the then-current term.
          </p>
          <p>
            <strong>10.2 Termination</strong>
          </p>
          <p>
            Notwithstanding Section 10.1, either Party may terminate this Agreement as follows: (a) if the other Party
            materially breaches this Agreement (including, without limitation, in the case of Customer, nonpayment of
            the Fees) and does not remedy such failure within thirty (30) days after its receipt of written notice of
            such breach (unless the breach is of a nature that is incapable of being incurred, in which case the
            non-breaching Party may terminate this Agreement immediately upon written notice); (b) if the other Party
            terminates its business activities or becomes insolvent, admits in writing to inability to pay its debts as
            they mature, makes an assignment for the benefit of creditors, or becomes subject to direct control of a
            trustee, receiver or similar authority; or (c) as otherwise expressly set forth in this Agreement or an
            Order Form. In addition, Customer may terminate this Agreement for convenience upon thirty (30) days’ prior
            written notice to Campsite.
          </p>
          <p>
            <strong>10.3 Effect of Termination</strong>
          </p>
          <p>
            Upon any termination of this Agreement: (a) the License and any other rights granted to Customer under this
            Agreement with respect to the Platform will immediately cease, (b) Customer shall immediately pay to
            Campsite all amounts due and payable up to and through the effective date of termination, (c) except for a
            termination by Customer pursuant to Section 10.2(a) or a termination for convenience by Customer, Campsite
            shall have no obligation to refund any prepaid Fees, and (d) the Receiving Party will, at the option of the
            Disclosing Party, promptly return to the Disclosing Party or destroy all Confidential Information of
            Disclosing Party then in the Receiving Party’s possession. Notwithstanding any terms to the contrary in this
            Agreement, any provision of this Agreement that, by its nature and context, is intended to survive this
            Agreement (including, without limitation, Customer’s obligation to pay any unpaid Fees and Sections 4
            through 6, 7.4, 8, 9, 10.3, and 11) will survive any termination of this Agreement.
          </p>
          <h2>
            <strong>11. General Provisions</strong>
          </h2>
          <p>
            <strong>11.1 Entire Agreement</strong>
          </p>
          <p>
            This Agreement, including the Order Form, which is incorporated herein by reference, sets forth the entire
            agreement and understanding of the Parties relating to the subject matter hereof, and supersedes all prior
            or contemporaneous agreements, proposals, negotiations, conversations, discussions and understandings,
            written or oral, with respect to such subject matter and all past dealing or industry custom. In the event
            of a conflict between the terms of this Agreement and the terms of the Order Form, the terms of this
            Agreement shall prevail except to the extent the Order Form expressly states that it amends the Agreement.
          </p>
          <p>
            <strong>11.2 Independent Contractors</strong>
          </p>
          <p>
            Neither Party will, for any purpose, be deemed to be an agent, franchisor, franchise, employee,
            representative, owner or partner of the other Party, and the relationship between the Parties will only be
            that of independent contractors. Neither Party will have any right or authority to assume or create any
            obligations or to make any representations or warranties on behalf of any other Party, whether express or
            implied, or to bind the other Party in any respect whatsoever.
          </p>
          <p>
            <strong>11.3 Dispute Resolution</strong>
          </p>
          <p>
            The Parties agree to resolve any dispute, claim or controversy arising out of or relating to this Agreement
            according to the terms of this Section 11.3. First, the Parties agree to attempt in good faith to resolve
            the dispute through informal resolution. Second, if the dispute is not resolved through informal resolution,
            the Parties agree to participate in binding arbitration administered by the American Arbitration Association
            under its Commercial Arbitration Rules in San Francisco, California. The Parties agree that, in the event of
            arbitration (or in the event of a lawsuit if this arbitration clause is deemed invalid or does not apply to
            a given dispute) the prevailing Party shall be entitled to costs and fees (including reasonable attorneys’
            fees). Either Party may bring a lawsuit solely for injunctive relief without first engaging in the dispute
            resolution process described in this Section 11.3. In the event that the dispute resolution procedures in
            this Section 11.3 are found not to apply to a given claim, or in the event of a claim for injunctive relief
            as specified in the previous sentence, the Parties agree that any judicial proceeding will be brought in the
            state courts of San Francisco, California. Both Parties consent to venue and personal jurisdiction there.
            ALL CLAIMS MUST BE BROUGHT IN THE PARTIES’ INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN
            ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING, AND, UNLESS AGREED TO OTHERWISE BY THE PARTIES, THE
            ARBITRATOR MAY NOT CONSOLIDATE MORE THAN ONE PERSON’S CLAIMS.
          </p>
          <p>
            <strong>11.4 Governing Law</strong>
          </p>
          <p>
            The validity, interpretation, construction and performance of this Agreement, and all acts and transactions
            pursuant hereto and the rights and obligations of the Parties hereto shall be governed, construed and
            interpreted in accordance with the laws of the State of California, without giving effect to principles of
            conflicts of law.
          </p>
          <p>
            <strong>11.5 Assignment</strong>
          </p>
          <p>
            Neither this Agreement nor any right or duty under this Agreement may be transferred, assigned or delegated
            by either Party, by operation of applicable Laws or otherwise, without the prior written consent of other
            Party, and any attempted transfer, assignment or delegation without such consent will be void and without
            effect. Notwithstanding the foregoing, either Party may assign its rights and obligations hereunder in
            connection with a merger, reorganization, consolidation, or sale of all or substantially all of its assets.
            Subject to the foregoing, this Agreement will be binding upon, and will inure to the benefit of, the Parties
            and their respective representatives, heirs, administrators, successors and permitted assigns.
          </p>
          <p>
            <strong>11.6 Amendments and Waivers</strong>
          </p>
          <p>
            No modification, addition or deletion, or waiver of any rights under this Agreement will be binding on a
            Party unless in writing and signed by a duly authorized representative of each Party. No failure or delay
            (in whole or in part) on the part of a Party to exercise any right or remedy hereunder will operate as a
            waiver thereof or effect any other right or remedy. All rights and remedies hereunder are cumulative and are
            not exclusive of any other rights or remedies provided hereunder or by applicable Laws. The waiver of one
            breach or default or any delay in exercising any rights will not constitute a waiver of any subsequent
            breach or default.
          </p>
          <p>
            <strong>11.7 Notices</strong>
          </p>
          <p>
            Any notice made pursuant to this Agreement will be in writing and will be deemed delivered on (a) the date
            of delivery if delivered personally, (b) five (5) calendar days (or upon written confirmed receipt) after
            mailing if duly deposited in registered or certified mail or express commercial carrier, or (c) one (1)
            calendar (or upon written confirmed receipt) after being sent by email, addressed to Customer or to
            Campsite, as the case may be, at the address or email address shown on the signature page of this Agreement
            or to such other address or email address as may be hereafter designated by either Party. Any notice to
            Customer pertaining to an Order Form may be made by Campsite to the contact listed by Customer for such
            purpose in the applicable Order Form.
          </p>
          <p>
            <strong>11.8 Severability</strong>
          </p>
          <p>
            If any provision of this Agreement is invalid, illegal, or incapable of being enforced by any rule of law or
            public policy, all other provisions of this Agreement will nonetheless remain in full force and effect. Upon
            such determination that any provision is invalid, illegal, or incapable of being enforced, the Parties will
            negotiate in good faith to modify this Agreement so as to effect the original intent of the Parties as
            closely as possible in an acceptable manner to the end that the transactions contemplated hereby are
            fulfilled.
          </p>
          <p>
            <strong>11.9 Counterparts</strong>
          </p>
          <p>
            This Agreement may be executed: (a) in two or more counterparts, each of which will be deemed an original
            and all of which will together constitute the same instrument; and (b) by the Parties by exchange of
            signature pages by mail, facsimile or email (if email, signatures in Adobe PDF or similar format).
          </p>
          <p>
            <strong>11.10 Force Majeure</strong>
          </p>
          <p>
            Neither Party will be responsible for any failure to perform or delay attributable in whole or in part to
            any cause beyond its reasonable control including, but not limited to, natural disasters (fire, storm,
            floods, earthquakes, etc.), a pandemic, acts of terrorism, civil disturbances, disruption of
            telecommunications, disruption of power or other essential services, interruption or termination of any
            third party services, labor disturbances, vandalism, cable cut, computer viruses or other similar
            occurrences, or any malicious or unlawful acts of any third party.
          </p>
          <p>
            <strong>11.11 Construction</strong>
          </p>
          <p>
            This Agreement shall be deemed to be the product of all of the Parties, and no ambiguity shall be construed
            in favor of or against any one of the Parties.
          </p>
        </div>
      </WidthContainer>
    </>
  )
}
