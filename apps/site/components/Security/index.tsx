import { Table, Tbody, Td, Th, Thead } from '../Table'

export function SubprocessorTable() {
  return (
    <Table>
      <Thead>
        <Th className='rounded-l-md'>Processor</Th>
        <Th>Description</Th>
        <Th className='rounded-r-md'>Location</Th>
      </Thead>

      <Tbody>
        {subprocessors.map((s) => (
          <tr key={s.processor}>
            <Td>{s.processor}</Td>
            <Td>{s.description}</Td>
            <Td>{s.location}</Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}

export function SecurityMeasuresTable() {
  return (
    <Table>
      <Thead>
        <Th className='rounded-l-md'>Technical and Organizational Security Measure</Th>
        <Th className='rounded-r-md'>Details</Th>
      </Thead>

      <Tbody>
        {securityMeasures.map((s) => (
          <tr key={s.measure}>
            <Td>{s.measure}</Td>
            <Td>{s.details}</Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}

const subprocessors = [
  {
    processor: 'Fly.io',
    description: 'Application hosting',
    location: 'United States'
  },
  {
    processor: 'Vercel Inc.',
    location: 'United States',
    description: 'Application hosting'
  },
  {
    processor: 'PlanetScale, Inc.',
    description: 'Data services',
    location: 'United States'
  },
  {
    processor: 'Redis Ltd.',
    description: 'Application data syncing',
    location: 'United States'
  },
  {
    processor: 'MessageBird Ltd (Pusher)',
    description: 'Application data syncing',
    location: 'United Kingdom'
  },
  {
    processor: 'WorkOS, Inc.',
    description: 'Single sign-on',
    location: 'United States'
  },
  {
    processor: 'Amazon Web Services, Inc.',
    description: 'Cloud services',
    location: 'United States'
  },
  {
    processor: 'Zebrafish Labs Inc. (Imgix)',
    description: 'Cloud services',
    location: 'United States'
  },
  {
    processor: 'June Inc.',
    description: 'Product analytics',
    location: 'United States'
  },
  {
    processor: 'Axiom, Inc.',
    description: 'Service logging',
    location: 'United States'
  },
  {
    processor: 'Functional Software, Inc. (Sentry)',
    description: 'Service logging',
    location: 'United States'
  },
  {
    processor: 'Tilde Inc. (Skylight)',
    description: 'Service Logging',
    location: 'United States'
  },
  {
    processor: 'Stripe, Inc.',
    description: 'Payment processing',
    location: 'United States'
  },
  {
    processor: 'Userlist, Inc.',
    description: 'Email communication',
    location: 'United States'
  },
  {
    processor: 'ActiveCampaign, LLC (Postmark)',
    description: 'Email communication',
    location: 'United States'
  },
  {
    processor: 'Slack Technologies, LLC',
    description: 'Messaging services',
    location: 'United States'
  },
  {
    processor: 'Linear Orbit, Inc.',
    description: 'Developer tooling',
    location: 'United States'
  },
  {
    processor: 'Retool, Inc.',
    description: 'Product analytics',
    location: 'United States'
  },
  {
    processor: 'Hex Technologies, Inc.',
    description: 'Product analytics',
    location: 'United States'
  },
  {
    processor: 'GitHub, Inc.',
    description: 'Developer tooling',
    location: 'United States'
  }
]

const securityMeasures = [
  {
    measure: 'Measures of pseudonymisation and encryption of personal data',
    details:
      'Data transmitted between customers and the Campsite application is encrypted using HTTPS/SSL and is encrypted at rest. Employee computers are required to use full-disk encryption.'
  },

  {
    measure:
      'Measures for ensuring ongoing confidentiality, integrity, availability and resilience of processing systems and services',
    details:
      'Campsite has policies and procedures in place to ensure confidentiality, integrity and resilience of processing systems and services. These include an Access Control Policy, Business Continuity and Disaster Recovery Policy, and a Secure Development Policy. Campsite will maintain and provide policies upon request.'
  },

  {
    measure:
      'Measures for ensuring the ability to restore the availability and access to personal data in a timely manner in the event of a physical or technical incident',
    details:
      'All database-stored customer data is backed up twice-daily using industry-standard database tooling. Backups and restore capabilities are tested on an annual cadence.'
  },

  {
    measure:
      'Processes for regularly testing, assessing, and evaluating the effectiveness of technical and organizational measures in order to ensure the security of the processing',
    details:
      'Campsite regularly monitors and tests controls to ensure they are operating as intended and updated as needed. Campsite uses 3rd party independent vendors to automate several of these controls, including employee activity and adherence to Campsite policies and procedures, infrastructure monitoring, and development procedures. Campsite leadership monitors these controls regularly, and is notified immediately when a control is at risk so that prompt action can be taken.'
  },

  {
    measure: 'Measures for user identification and authorization',
    details:
      'Campsite maintains an Access Control Policy, which can be provided upon request. Measures for access control and authorization include formally documented roles and permissions, encrypted connection to production systems and networks, strong passwords stored within a password manager, and single-sign on or 2FA where available.'
  },

  {
    measure: 'Measures for the protection of data during transmission',
    details:
      'Data transmitted between customers and the Campsite application is encrypted using HTTPS/SSL. All measures are outlined in the Campsite’s Data Management Policy, which can be provided upon request.'
  },

  {
    measure: 'Measures for the protection of data during storage',
    details: 'Data stored in a database is encrypted at rest.'
  },

  {
    measure: 'Measures for ensuring physical security of locations at which personal data are processed',
    details:
      'Campsite does not operate physical servers or other infrastructure. Campsite employees are required to complete physical security training. Employees are also required to enable screen lock while unattended and enable full-disk encryption.'
  },

  {
    measure: 'Measures for ensuring events logging',
    details: 'Campsite maintains logs and monitors when production systems and data are accessed.'
  },

  {
    measure: 'Measures for ensuring system configuration, including default configuration',
    details:
      'Campsite monitors changes to in-scope systems to ensure that changes follow the process and to mitigate the risk of un-detected changes to production. Changes are tracked in a version control system.'
  },

  {
    measure: 'Measures for certification/assurance of processes and products',
    details: 'Campsite has completed its SOC2 Type II audit and is pending certification.'
  },

  {
    measure: 'Measures for ensuring data minimisation',
    details:
      'Data is collected to serve commercial or business purposes, such as providing, customizing and improving Services, marketing and selling the Services, corresponding with customers about Services, and meeting legal requirements. Campsite will not collect additional categories of Personal Data or use the Personal Data we collected for materially different, unrelated or incompatible purposes without providing customer notice.'
  },

  {
    measure: 'Measures for ensuring data quality',
    details:
      'All data collection is instrumented by the Campsite’s software engineering team and all data collection changes are peer reviewed. Data is tested during development and verified after deployment. Campsite uses reporting tools to understand and validate the data that is stored.'
  },

  {
    measure: 'Measures for ensuring limited data retention',
    details:
      'Campsite retains data as long as there is a need for its use, or to meet regulatory or contractual requirements. Campsite, in consultation with legal counsel, may determine retention periods for data. Retention periods shall be documented in the Data Management Policy.'
  },

  {
    measure: 'Measures for ensuring accountability',
    details:
      'Campsite employees are required to review and acknowledge Campsite security practices and policies, complete security training, and go through a security walkthrough with a senior member of the engineering organization. Campsite requires all employees to sign a non-disclosure agreement before gaining access to Campsite information.'
  },

  {
    measure: 'Measures for allowing data portability and ensuring erasure',
    details:
      'Customer can ask for a copy of its Personal Data in a machine-readable format. Customer can also request that Campsite transmit the data to another controller where technically feasible. The Service allows ability to export relevant application data in a standard CSV format. In the case that a customer wishes to exercise portability or erasure rights, the Campsite has measures of retrieving securely stored data and has a process in place to ensure access is restricted only to those who have a business justification for accessing data during the copy, transfer, or erasure.'
  },

  {
    measure: 'Technical and organizational measures of sub-processors',
    details: 'Campsite collects and reviews the most security assessments from sub-processors on an annual basis.'
  }
]
