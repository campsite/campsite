/* eslint-disable max-lines */
import { NextSeo } from 'next-seo'
import Link from 'next/link'

import { SITE_URL } from '@campsite/config'

import { WidthContainer } from '@/components/Layouts/WidthContainer'

import { PageHead } from '../components/Layouts/PageHead'
import { SecurityMeasuresTable, SubprocessorTable } from '../components/Security'

export default function DPA() {
  return (
    <>
      <NextSeo
        title='Data Processing Agreement · Campsite'
        description='Have questions about Campsite’s legal process? Get in touch at support@campsite.com.'
        canonical={`${SITE_URL}/dpa`}
      />

      <WidthContainer className='3xl:pt-32 4xl:pt-36 max-w-4xl pt-12 md:pt-16 lg:pt-20 xl:pt-24 2xl:pt-28'>
        <PageHead title='Data Processing Agreement' subtitle='Effective June 8, 2023' />
      </WidthContainer>

      <WidthContainer className='max-w-3xl gap-12 py-16 lg:py-24'>
        <div className='flex flex-col gap-12'>
          <div className='prose lg:prose-lg'>
            <p>
              This Data Processing Agreement (including any terms set forth in a schedule, appendix or addendum hereto,{' '}
              <strong>“DPA”</strong>), dated as of the effective date of the Agreement (
              <strong>“Effective Date”</strong>), is by and between the customer identified in the Agreement (
              <strong>“Customer”</strong>), and Campsite Software Co., a Delaware corporation (<strong>“Vendor”</strong>
              ). Customer and Vendor may be referred to herein together as the <strong>“Parties”</strong>, and each may
              be referred to herein as a <strong>“Party”</strong>. To the extent that the Parties have entered into a
              prior agreement governing the processing of personal data (the <strong>“Prior Agreement”</strong>), the
              Parties understand and agree that this DPA shall supersede and replace such Prior Agreement. For good and
              valuable consideration, the receipt and sufficiency of which is hereby acknowledged, Customer and Vendor
              hereby agree as follows:
            </p>
            <p>
              <strong>1. Definitions</strong>
            </p>
            <p>
              1.1. <strong>“Applicable Laws”</strong> means, collectively, all now existing or hereinafter enacted or
              amended laws, rules, regulations (including, without limitation, self-regulatory obligations), and/or
              sanctions programs applicable to a Party’s performance hereunder and/or obligations with respect to data
              protection.
            </p>
            <p>
              1.2. <strong>“CCPA”</strong> means the California Consumer Privacy Act of 2018 (Title 1.81.5 of the Civil
              Code of the State of California), together with all effective regulations adopted thereunder (in each
              case, as amended from time to time).
            </p>
            <p>
              1.3. <strong>“Customer Data”</strong> means all information, data, content and other materials, in any
              form or medium, that is submitted, posted, collected, transmitted or otherwise provided by or on behalf of
              Customer through the Services.
            </p>
            <p>
              1.4. <strong>“Customer Personal Data”</strong> means Customer Data that is Personal Data processed by
              Vendor on behalf of Customer in the provision of the Services under the Service Agreement(s).
            </p>
            <p>
              1.5. <strong>“Controller”</strong> means (i) under and in the context of European Data Protection Law, the
              data “controller” (as defined by GDPR), (ii) under and in the context of CCPA, the “business” (or third
              party) (each, as defined by CCPA), and (iii) under and in the context of any other privacy or data
              protection law, rule, or regulation applicable to a Party’s performance hereunder, a “controller”,
              “business”, or corresponding term denoting a substantially similar definition, role, and obligations under
              such law, rule or regulation.
            </p>
            <p>
              1.6. <strong>“EU GDPR”</strong> means Regulation (EU) 2016/679 of the European Parliament and of the
              Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal
              data and on the free movement of such data, and repealing Directive 95/46/EC (and each successor
              regulation, directive or other text of the foregoing, in each case as amended from time to time).
            </p>
            <p>
              1.7. <strong>“European Data Protection Law”</strong> means each of EU GDPR, UK GDPR, and the Federal Data
              Protection Act of 19 June 1992 (Switzerland) (as the same may be superseded by the Swiss Data Protection
              Act 2020 and as amended from time to time).
            </p>
            <p>
              1.8. <strong>“GDPR”</strong> means, as applicable, (i) the EU GDPR and/or (ii) the UK GDPR.
            </p>
            <p>
              1.9. <strong>“Personal Data”</strong> means any information that constitutes (a) “personal information”
              (as defined by, and in the context of, CCPA), (b) “personal data” (as defined by, and in the context of,
              European Data Protection Law), and/or (c) “personal data,” “personal information,” or other term denoting
              a substantially similar definition and obligations under, and in the context of, any other Applicable
              Laws, in each case that is (i) made available or otherwise provided by Customer to Vendor in connection
              with the Services and/or (ii) collected or accessed by Vendor under a Service Agreement(s) via a pixel,
              cookie, tag, or similar technology on any of Customer’s digital properties.
            </p>
            <p>
              1.10. <strong>“Process”</strong> means any operation or set of computer operations performed on Personal
              Data, including, but not limited to, collection, recording, organization, structuring, storage, access,
              adaptation, alteration, retrieval, consultation, use, transfer, transmit, sale, rental, disclosure,
              dissemination, making available, alignment, combination, deletion, erasure, or destruction.
            </p>
            <p>
              1.11. <strong>“Processor”</strong> means (i) under and in the context of European Data Protection Law, the
              data “processor” (as defined by GDPR), (ii) under and in the context of CCPA, a “service provider” (as
              defined by CCPA), and (iii) under and in the context of any other privacy or data protection law, rule, or
              regulation applicable to a Party’s performance hereunder, a “processor”, “service provider”, or
              corresponding term denoting a substantially similar definition, role, and obligations under such law, rule
              or regulation.
            </p>
            <p>
              1.12. <strong>“Security Incident”</strong> means (i) any accidental, unauthorized, or unlawful
              destruction, loss, alteration, disclosure of, or access to, Personal Data or (ii) any other event that
              constitutes a “security breach”, “personal data breach”, or substantially similar term with respect to
              Personal Data under an Applicable Law(s).
            </p>
            <p>
              1.13. <strong>“Service Agreements”</strong> or <strong>“Agreement”</strong> means, collectively, the
              agreements and/or terms of service (including, as applicable, each of the Statements of
              Work/SOWs/Orders/Order Forms and exhibits thereunder) between Customer and Vendor.
            </p>
            <p>
              1.14. <strong>“Services”</strong> means, collectively, the products and/or services provided by Vendor to
              Customer under the Service Agreements.
            </p>
            <p>
              1.15. <strong>“Sub-Processor”</strong> means a contractor, subcontractor, consultant, third-party service
              provider, or agent engaged by Vendor for further Processing of Personal Data.
            </p>
            <p>
              1.16. <strong>“UK GDPR”</strong> has the meaning ascribed thereto in section 3(10) (as supplemented by
              section 205(4)) of the UK Data Protection Act 2018 (as amended from time to time).
            </p>
            <p>
              <strong>2. Data Processing Obligations</strong>
            </p>
            <p>2.1. General</p>
            <p>
              (a) Each Party shall comply with its obligations relating to Personal Data under this DPA and under
              Applicable Laws at its own cost. With respect to Personal Data, (i) Customer is a Controller and (ii)
              Vendor is a Processor that acts upon the instructions of Customer, including, without limitation, in
              accordance with the applicable Service Agreement, this DPA, and any other documented instructions provided
              by Customer.
            </p>
            <p>
              (b) With regard to Vendor employees engaged in Processing Personal Data, Vendor shall ensure that such
              employees are informed of the confidential nature of the Personal Data and are subject to appropriate
              confidentiality obligations sufficient to comply with the terms of the applicable Service Agreement(s) and
              this DPA, which confidentiality obligations shall survive following termination of this DPA for at least
              as long as the period(s) required by the applicable Service Agreement(s) and this DPA.
            </p>
            <p>
              (c) Customer will have sole responsibility for the accuracy, quality, and legality of Customer Personal
              Data and the means by which Customer obtained the Customer Personal Data, including, without limitation,
              obtaining appropriate consent to collect the Customer Personal Data and share such data with Vendor in
              accordance with Applicable Laws.
            </p>
            <p>2.2 Standard Contractual Clauses</p>
            <p>
              If Vendor Processes Personal Data relating to an EEA, United Kingdom, or Switzerland data subject
              (including, without limitation, the transfer of such Personal Data from the EEA, United Kingdom, or
              Switzerland to a third country not providing an adequate level of protection) outside of the EEA, United
              Kingdom, and Switzerland, the Processing will be further governed by Schedule I to this Agreement, with
              Customer as data exporter and Vendor as data importer (together with all Appendixes and Annexes thereto,
              and as the same may be amended, supplemented, or otherwise modified from time to time,{' '}
              <strong>“Personal Data SCCs”</strong>), which is incorporated by reference into this DPA solely with
              respect to Personal Data relating to EEA, United Kingdom and/or Switzerland data subjects. If there is any
              conflict between (x) the terms and conditions of either this DPA or the applicable Service Agreement(s),
              on the one hand, and (y) the terms and conditions of the Personal Data SCCs, on the other hand, then, with
              respect to Personal Data relating to an EEA, United Kingdom and/or Switzerland data subject(s), the terms
              and conditions of the Personal Data SCCs will prevail and control. Vendor may only transfer Personal Data
              relating to an EEA, United Kingdom, or Switzerland data subject outside the EEA, United Kingdom, and
              Switzerland in compliance with Applicable Laws and the Personal Data SCCs.
            </p>
            <p>2.3. CCPA</p>
            <p>
              Without limiting any of the restrictions on or obligations of Vendor under this DPA, under any of the
              Service Agreements, or under Applicable Laws, with respect to Personal Data relating to a California
              “consumer” (as defined by CCPA) or household (<strong>“CCPA Personal Data”</strong>):
            </p>
            <p>
              (a) Customer shall be disclosing such CCPA Personal Data under the applicable Service Agreement(s) to
              Vendor for a “business purpose” (as defined by CCPA), and Vendor shall Process such CCPA Personal Data
              solely on behalf of Customer and only as necessary to perform such business purpose for Customer; and
            </p>
            <p>
              (b) Vendor shall not: (i) “sell” (as defined by CCPA) CCPA Personal Data; or (ii) retain, use, or disclose
              CCPA Personal Data (x) for any purpose (including a “commercial purpose” (as defined by CCPA)) other than
              for the specific purpose of performing for Customer the services specified in the particular Service
              Agreement(s) or (y) outside of the direct business relationship between Vendor and Customer; Vendor
              certifies that it understands the restrictions set forth in this Section 2.3(b) and shall comply with
              them; and
            </p>
            <p>
              (c) Notwithstanding anything to the contrary in this DPA (including, for purposes of clarification and
              without limitation, clauses (a) and (b) of this Section 2.3), in no event shall Vendor process any CCPA
              Personal Data in such a manner as would constitute (i) a sale (as defined by CCPA) of CCPA Personal Data
              by Customer to Vendor or (ii) on or after January 1, 2023, the sharing (as defined under CCPA (as amended
              by the California Privacy Rights Act of 2020)) of CCPA Personal Data by Customer with Vendor; and
            </p>
            <p>
              (d) If directed by Customer with regard to a particular California consumer or household, Vendor shall
              delete the CCPA Personal Data of such consumer or household.
            </p>
            <p>2.4. Changes in Applicable Laws</p>
            <p>
              If, due to any change in Applicable Laws, a Party reasonably believes that (a) Vendor ceases to be able to
              provide a Service(s) in whole or in part (e.g., with respect to a particular jurisdiction) and/or Customer
              ceases to be able to use a Service(s) in whole or in part under the then-current terms and conditions of
              the applicable Service Agreement(s) and this DPA, each Party may terminate the applicable Service
              Agreement(s) (in whole or, if reasonably practicable, in part).
            </p>
            <p>
              <strong>3. Security</strong>
            </p>
            <p>
              3.1. Taking into account the state of the art, the costs of implementation and the nature, scope, context
              and purposes of processing as well as the risk of varying likelihood and severity for the rights and
              freedoms of natural persons, Vendor will implement and maintain appropriate technical and organizational
              measures to ensure a level of security appropriate to the risks. Such measures will include reasonable
              administrative, physical, and technical security controls (including those required by Applicable Laws)
              that prevent the collection, use, disclosure, or access to Personal Data and Customer confidential
              information that the Service Agreements do not expressly authorize, including maintaining a comprehensive
              information security program that safeguards Personal Data and Customer confidential information. These
              security measures include, but are not limited to: (i) the pseudonymization and encryption of personal
              data; (ii) the ability to ensure the ongoing confidentiality, integrity, availability and resilience of
              processing systems and services; and (iii) the ability to restore the availability and access to personal
              data in a timely manner in the event of a physical or technical incident.
            </p>
            <p>
              3.2. When assessing the appropriate level of security, account shall be taken in particular of the risks
              that are presented by processing, in particular from accidental or unlawful destruction, loss, alteration,
              unauthorized disclosure of, or access to personal data transmitted, stored or otherwise processed.
            </p>
            <p>
              <strong>4. Supplementary Measures and Safeguards</strong>
            </p>
            <p>4.1. Assistance; Risk Assessment</p>
            <p>
              (a) Vendor shall assist Customer to ensure compliance with Applicable Laws in connection with the
              Processing of Personal Data.
            </p>
            <p>4.2. Orders.</p>
            <p>
              Vendor shall notify Customer in writing of any subpoena or other judicial or administrative order by a
              government authority or proceeding seeking access to or disclosure of Personal Data. Customer shall have
              the right to defend such action in lieu of and/or on behalf of Vendor. Customer may, if it so chooses,
              seek a protective order. Vendor shall reasonably cooperate with Customer in such defense.
            </p>
            <p>
              <strong>5. Notifications</strong>
            </p>
            <p>5.1. Security Incidents</p>
            <p>
              Vendor has and will maintain a security incident response plan that includes procedures to be followed in
              the event of a Security Incident. Vendor will provide Customer with written notice promptly after
              discovering a Security Incident (including those affecting Vendor or its Sub-Processors), including any
              information that Customer is required by law to provide to an applicable regulatory agency or to the
              individuals whose personal data was involved in the Security Incident.
            </p>
            <p>5.2. Data Subject Requests</p>
            <p>
              Vendor shall (i) promptly notify Customer about any request under Applicable Law(s) with respect to
              Personal Data received from or on behalf of the applicable data subject and (ii) reasonably cooperate with
              Customer’s reasonable requests in connection with data subject requests with respect to Personal Data.
              Vendor shall assist Customer, through appropriate technical and organizational measures, to fulfill its
              obligations with respect to requests of data subjects seeking to exercise rights under Applicable Law with
              respect to Personal Data.
            </p>
            <p>
              <strong>6. Sub-Processors.</strong>
            </p>
            <p>
              6.1. Vendor shall not have Personal Data Processed by a Sub-Processor unless such Sub-Processor is bound
              by a written agreement with Vendor that includes data protection obligations at least as protective as
              those contained in this DPA and the applicable Service Agreement(s) and that meet the requirements of
              Applicable Laws. Vendor is and shall remain fully liable to Customer for any failure by any Sub-Processor
              to fulfill Vendor’s data protection obligations under Applicable Laws.
            </p>
            <p>
              6.2. Vendor provides a of lists all Sub-Processors who access Personal Data, available at:{' '}
              <Link href='/security/subprocessors'>https://campsite.com/security/subprocessors</Link> (the “Website”).
              Customer specifically authorizes and instructs Vendor to engage the Sub-Processors listed on the Website
              as of the Effective Date. Vendor will notify Customer of any changes to the Sub-Processors listed on the
              Website and grant Customer the opportunity to object to such change. Upon Customer’s request, Vendor will
              provide all information necessary to demonstrate that the Sub-Processors will meet all requirements
              pursuant to Section 6.1. In the case Customer objects to any Sub-Processor, Vendor can choose to either
              not engage the Sub-Processor or to terminate this DPA with thirty (30) days’ prior written notice.
            </p>
            <p>
              6.3. Third-party providers that maintain IT systems whereby access to Personal Data is not needed but can
              technically also not be excluded do not qualify as Sub-Processors within the meaning of this Section 6.
              They can be engaged based on regular confidentiality undertakings and subject to Vendor’s reasonable
              monitoring.
            </p>
            <p>
              <strong>7. Deletion</strong>
            </p>
            <p>
              Vendor shall, at the choice of Customer: (i) delete or return all Customer Data to Customer after such
              Customer Data is no longer necessary for the provision of the Services, and (ii) delete existing copies of
              such Customer Data.
            </p>
            <p>
              <strong>Documentation</strong>
            </p>
            <p>
              8.1. Vendor shall, upon Customer’s request, provide Customer (a) comprehensive documentation of Vendor’s
              technical and organizational security measures, (b) any and all third-party audits and certifications
              available with respect to such security measures, and (c) and all other information reasonably necessary
              to demonstrate compliance with the Vendor’s obligations under this DPA and/or under Applicable Laws.
            </p>
            <p>
              <strong>9. Term; Termination.</strong>
            </p>
            <p>
              This DPA shall remain in effect until (a) all Service Agreements have terminated and (b) all obligations
              that Vendor has under the Service Agreements and under Applicable Laws with respect to Personal Data, and
              all rights that Customer has under the Service Agreements and under Applicable Laws with respect to
              Personal Data, have terminated. Notwithstanding termination of this DPA, any provisions hereof that by
              their nature are intended to survive, shall survive termination.
            </p>
            <p>
              <strong>10. Miscellaneous</strong>
            </p>
            <p>
              10.1. Any notice made pursuant to this DPA will be in writing and will be deemed delivered on (a) the date
              of delivery if delivered personally, (b) five (5) calendar days (or upon written confirmed receipt) after
              mailing if duly deposited in registered or certified mail or express commercial carrier, or (c) one (1)
              calendar day (or upon written confirmed receipt) after being sent by email, addressed to Customer at the
              address or email address on record with Vendor, or addressed to Vendor at the address or email address
              designated below, or to such other address or email address as may be hereafter designated by either
              Party:
            </p>
            <p>
              Brian Lovin, CEO
              <br />
              brian@campsite.com
              <br />
              2261 Market Street #10319 San Francisco, CA 94114
              <br />
            </p>
            <p>
              10.2. This DPA shall be governed by and construed in accordance with governing law and jurisdiction
              provisions in the applicable Service Agreements, unless required otherwise by Applicable Laws.
            </p>
            <p>
              10.3. Neither Party may assign or transfer any part of this DPA without the written consent of the other
              Party; provided, however, that this DPA, collectively with all Service Agreements, may be assigned without
              the other Party’s written consent by either Party to a person or entity who acquires, by sale, merger or
              otherwise, all or substantially all of such assigning Party’s assets, stock or business. Subject to the
              foregoing, this DPA shall bind and inure to the benefit of the Parties, their respective successors and
              permitted assigns. Any attempted assignment in violation of this Section 12.3 shall be void and of no
              effect.
            </p>
            <p>
              10.4. This DPA is the Parties’ entire agreement relating to its subject and supersedes any prior or
              contemporaneous agreements on that subject; provided, however, that, notwithstanding the foregoing but
              subject to the last sentence of this Section 10.4, nothing in this DPA shall be deemed to supersede any of
              the Service Agreements. Vendor may modify the terms of this DPA if, as reasonably determined by Vendor,
              such modification is (i) reasonably necessary to comply with Applicable Laws or any other law, regulation,
              court order or guidance issued by a governmental regulator or agency; and (ii) does not: (a) result in a
              degradation of the overall security of the Services, (b) expand the scope of, or remove any restrictions
              on, Vendor’s processing of Personal Data, and (c) otherwise have a material adverse impact on Customer’s
              rights under this DPA. Any other amendments must be executed by both of the Parties and expressly state
              that they are amending this DPA. Failure to enforce any provision of this DPA shall not constitute a
              waiver. If any provision of this DPA is found unenforceable, it and any related provisions shall be
              interpreted to best accomplish the unenforceable provision’s essential purpose. The headings contained in
              this DPA are for reference purposes only and shall not affect in any way the meaning or interpretation of
              this DPA. In the event of a conflict between the terms and conditions of this DPA and the terms and
              conditions of any Service Agreement, the terms and conditions of this DPA shall govern.
            </p>

            <h2 id='changes'>Schedule 1 EU SCCs</h2>

            <ol>
              <li>Definitions</li>

              <ol type='a'>
                <li>
                  <strong>“EU SCCs”</strong> means the Standard Contractual Clauses issued pursuant to Commission
                  Implementing Decision (EU) 2021/914 of 4 June 2021 on standard contractual clauses for the transfer of
                  personal data to third countries pursuant to Regulation (EU) 2016/679 of the European Parliament and
                  of the Council, available at http://data.europa.eu/eli/dec_impl/2021/914/oj and completed as described
                  in this Schedule I.
                </li>

                <li>
                  <strong>“UK SCCs”</strong> means the International Data Transfer Addendum to the EU Commission
                  Standard Contractual Clauses, available as of the DPA Effective Date at
                  https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/international-data-transfer-agreement-and-guidance/
                  and completed as described in this Schedule I.
                </li>
              </ol>

              <li>
                With respect to Personal Data transferred from the European Economic Area, the EU SCCs will apply and
                form part of this Schedule I, unless the European Commission issues updates to the EU SCCs, in which
                case the updated EU SCCs will control. Undefined capitalized terms used in this provision will have the
                meanings given to them (or their functional equivalents) in the definitions in the EU SCCs. For purposes
                of the EU SCCs, they will be deemed completed as follows:
              </li>

              <ol type='a'>
                <li>
                  Because Customer is a Controller and Vendor is a Processor of the Personal Data, Module 2 applies.
                </li>
                <li>Clause 7 (the optional docking clause) is not included.</li>
                <li>
                  Under Clause 11 (Redress), the optional requirement that data subjects be permitted to lodge a
                  complaint with an independent dispute resolution body is inapplicable.
                </li>
                <li>
                  Under Clause 17 (Governing law), the Parties select Option 1 (the law of an EU Member State that
                  allows for third-party beneficiary rights). The Parties select the law of Ireland.
                </li>
                <li>Under Clause 18 (Choice of forum and jurisdiction), the Parties select the courts of Ireland.</li>
                <li>
                  Annexes I, II and III of the EU SCCs are set forth in <strong>Exhibit A</strong> to this Schedule I.
                </li>
                <li>By entering into this DPA, the Parties are deemed to be signing the EU SCCs.</li>
              </ol>

              <li>
                With respect to Personal Data transferred from the United Kingdom for which the law of the United
                Kingdom (and not the law in any European Economic Area jurisdiction) governs the international nature of
                the transfer, the UK SCCs form part of this Schedule I and take precedence over the rest of this
                Schedule I as set forth in the UK SCCs, unless the United Kingdom issues updates to the UK SCCs, in
                which case the updated UK SCCs will control. Undefined capitalized terms used in this provision will
                have the meanings given to them (or their functional equivalents) in the definitions in the UK SCCs. For
                purposes of the UK SCCs, they will be deemed completed as follows:
              </li>

              <ol type='a'>
                <li>Table 1 of the UK SCCs:</li>

                <ol type='i'>
                  <li>
                    The Parties’ details are the Parties and their affiliates to the extent any of them is involved in
                    such transfer, including those set forth in <strong>Exhibit A</strong>.
                  </li>

                  <li>
                    The Key Contacts are the contacts set forth in <strong>Exhibit A</strong>.
                  </li>
                </ol>

                <li>
                  Table 2 of the UK SCCs: The Approved EU SCCs referenced in Table 2 are the EU SCCs as executed by the
                  Parties pursuant to this Schedule I.
                </li>

                <li>
                  Table 3 of the UK SCCs: Annex 1A, 1B, II and III are set forth in <strong>Exhibit A</strong>.
                </li>

                <li>
                  Table 4 of the UK SCCs: Either party may terminate the Service Agreements as set forth in Section 19
                  of the UK SCCs.
                </li>

                <li>
                  By entering into the DPA, the Parties are deemed to be signing the UK SCCs and their applicable Tables
                  and Appendix Information.
                </li>
              </ol>

              <li>
                With respect to Personal Data transferred from Switzerland for which Swiss law (and not the law in any
                European Economic Area jurisdiction) governs the international nature of the transfer, the EU SCCs will
                apply and will be deemed to have the following differences to the extent required by the Swiss Federal
                Act on Data Protection (<strong>“FADP”</strong>):
              </li>

              <ol type='a'>
                <li>
                  References to the GDPR in the EU SCCs are to be understood as references to the FADP insofar as the
                  data transfers are subject exclusively to the FADP and not to the GDPR.
                </li>

                <li>
                  The term <strong>“member state”</strong> in the EU SCCs will not be interpreted in such a way as to
                  exclude data subjects in Switzerland from the possibility of suing for their rights in their place of
                  habitual residence (Switzerland) in accordance with Clause 18(c) of the EU SCCs.
                </li>

                <li>
                  References to Personal Data in the EU SCCs also refer to data about identifiable legal entities until
                  the entry into force of revisions to the FADP that eliminate this broader scope.
                </li>

                <li>
                  Under Annex I(C) of the EU SCCs (Competent supervisory authority): where the transfer is subject
                  exclusively to the FADP and not the GDPR, the supervisory authority is the Swiss Federal Data
                  Protection and Information Commissioner, and where the transfer is subject to both the FADP and the
                  GDPR, the supervisory authority is the Swiss Federal Data Protection and Information Commissioner
                  insofar as the transfer is governed by the FADP, and the supervisory authority is as set forth in the
                  EU SCCs insofar as the transfer is governed by the GDPR.
                </li>
              </ol>
            </ol>

            <h2 id='exhibit-a'>Exhibit A</h2>
            <h3 id='annex-1'>Annex I</h3>

            <strong>A. List of Parties</strong>

            <strong>Data exporter(s):</strong>

            <p>Name: Entity identified as “Customer” in the DPA and “Client” in the Agreement.</p>
            <p>Address: See the Agreement.</p>
            <p>Contact person’s name, position and contact details: See the Agreement.</p>
            <p>
              Activities relevant to the data transferred under these Clauses: To provide Customer with the Services (as
              defined in the DPA).
            </p>
            <p>Signature and date: See the Agreement.</p>
            <p>Role (controller/processor): Controller.</p>

            <strong>Data importer(s):</strong>

            <p>Name: Campsite Software Co. (“Vendor”)</p>
            <p>Address: 2261 Market Street #10319 San Francisco, CA 94114</p>
            <p>Contact person’s name, position and contact details:</p>
            <p>Brian Lovin</p>
            <p>Role: Co-Founder, CEO</p>
            <p>Address: brian@campsite.com</p>

            <p>
              Activities relevant to the data transferred under these Clauses: To provide Customer with the Services (as
              defined in the DPA).
            </p>

            <p>Role (controller/processor): Processor.</p>

            <strong>B. Description of transfer</strong>

            <p>
              <em>Categories of data subjects whose personal data is transferred</em>
            </p>

            <p>
              Current employees, independent contractors, and other individuals providing services to Customer
              (collectively, <strong>“Users”</strong>).
            </p>
            <p>
              <em>Categories of personal data transferred</em>
            </p>
            <p>
              First name, last name, email address, IP address, and any other personal data that may be included in
              Client Data.
            </p>
            <p>
              <em>
                Sensitive data transferred (if applicable) and applied restrictions or safeguards that fully take into
                consideration the nature of the data and the risks involved, such as for instance strict purpose
                limitation, access restrictions (including access only for staff having followed specialised training),
                keeping a record of access to the data, restrictions for onward transfers or additional security
                measures.
              </em>
            </p>
            <p>None.</p>
            <p>
              <em>
                The frequency of the transfer (e.g. whether the data is transferred on a one-off or continuous basis).
              </em>
            </p>
            <p>For the duration of the Services pursuant to the Agreement.</p>
            <p>
              <em>Nature of the processing</em>
            </p>
            <p>To provide the Services pursuant to the Agreement.</p>
            <p>
              <em>Purpose(s) of the data transfer and further processing</em>
            </p>
            <p>To provide the Services pursuant to the Agreement.</p>
            <p>
              <em>
                The period for which the personal data will be retained, or, if that is not possible, the criteria used
                to determine that period
              </em>
            </p>
            <p>As long as necessary to provide the Services pursuant to the Agreement.</p>
            <p>
              <em>
                For transfers to (sub-) processors, also specify subject matter, nature and duration of the processing
              </em>
            </p>
            <p>To provide the Services pursuant to the Agreement.</p>

            <p>
              <strong>C. Competent Supervisory Authority</strong>
            </p>

            <p>
              <em>Identify the competent supervisory authority/ies in accordance with Clause 13</em>
            </p>

            <p>The Supervisory Authority where the Data Exporter is located.</p>

            <h3 id='annex-2'>Annex II</h3>
            <p>
              <strong>
                Technical and organisational measures including technical and organisational measures to ensure the
                security of the data
              </strong>
            </p>
          </div>
          <SecurityMeasuresTable />
          <div className='prose prose-lg'>
            <h3 id='annex-3'>Annex III</h3>
            <p>
              <strong>List of sub-processors</strong>
            </p>
          </div>
          <SubprocessorTable />
        </div>
      </WidthContainer>
    </>
  )
}
