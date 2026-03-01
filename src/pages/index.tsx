import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
  link: string;
};

const features: FeatureItem[] = [
  {
    title: 'Sub-10ms Decision Governance',
    description: (
      <>
        Evaluate deterministic policies against AI action proposals in under
        10ms. No ML classifiers in the critical path — rules evaluate in
        microseconds with guaranteed reproducibility.
      </>
    ),
    link: '/docs/architecture/policy-engine',
  },
  {
    title: 'Tamper-Evident Audit Trail',
    description: (
      <>
        Every decision is recorded in an append-only, SHA-256 hash-chained
        audit log. Legally defensible in regulatory proceedings with
        cryptographic integrity verification.
      </>
    ),
    link: '/docs/architecture/audit-system',
  },
  {
    title: 'Human-in-the-Loop Escalations',
    description: (
      <>
        High-risk decisions are automatically escalated for human review with
        SLA deadlines. Threshold policies and agent risk levels control when
        humans must approve actions.
      </>
    ),
    link: '/docs/user-manual/escalation-workflow',
  },
  {
    title: 'TypeScript + Python SDKs',
    description: (
      <>
        5 lines of code to govern any AI decision. Native integrations with
        OpenAI, LangChain, and CrewAI. Offline resilience with local policy
        cache fallback.
      </>
    ),
    link: '/docs/sdks/typescript/installation',
  },
  {
    title: 'Self-Hosted First-Class',
    description: (
      <>
        <code>docker compose up</code> produces a fully functional, production-grade
        deployment. No data leaves your network. HA architecture with PostgreSQL
        streaming replication.
      </>
    ),
    link: '/docs/operations/self-hosted',
  },
  {
    title: 'SOC 2 Compliance Built-In',
    description: (
      <>
        Generate evidence reports across Trust Service Criteria: access control,
        change management, monitoring, and data protection. Policy versioning
        ensures full traceability.
      </>
    ),
    link: '/docs/operations/compliance',
  },
];

function Feature({title, description, link}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="padding-horiz--md padding-vert--md">
        <Heading as="h3">
          <Link to={link} style={{color: 'inherit', textDecoration: 'none'}}>
            {title}
          </Link>
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/quickstart">
            Get Started
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/api-reference/overview"
            style={{marginLeft: '1rem'}}>
            API Reference
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="AI Decision Control Infrastructure"
      description="Policy enforcement, audit trails, and governance for enterprise AI. Sub-10ms decision governance with tamper-evident audit chains.">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
