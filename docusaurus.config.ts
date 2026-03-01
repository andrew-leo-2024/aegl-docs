import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'E-AEGL Documentation',
  tagline: 'AI Decision Control Infrastructure — Policy enforcement, audit trails, and governance for enterprise AI',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://andrew-leo-2024.github.io',
  baseUrl: '/aegl-docs/',

  organizationName: 'andrew-leo-2024',
  projectName: 'aegl-docs',

  onBrokenLinks: 'throw',
  trailingSlash: false,

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/andrew-leo-2024/aegl-docs/tree/main/',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'E-AEGL',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'gettingStartedSidebar',
          position: 'left',
          label: 'Getting Started',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiReferenceSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          type: 'docSidebar',
          sidebarId: 'sdkSidebar',
          position: 'left',
          label: 'SDKs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'architectureSidebar',
          position: 'left',
          label: 'Architecture',
        },
        {
          type: 'dropdown',
          label: 'Governance',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'projectCharterSidebar',
              label: 'Project Charter',
            },
            {
              type: 'docSidebar',
              sidebarId: 'businessProcessesSidebar',
              label: 'Business Processes',
            },
            {
              type: 'docSidebar',
              sidebarId: 'sopSidebar',
              label: 'SOPs',
            },
            {
              type: 'docSidebar',
              sidebarId: 'featuresSidebar',
              label: 'Features',
            },
          ],
        },
        {
          type: 'docSidebar',
          sidebarId: 'operationsSidebar',
          position: 'left',
          label: 'Operations',
        },
        {
          type: 'docSidebar',
          sidebarId: 'referenceSidebar',
          position: 'left',
          label: 'Reference',
        },
        {
          href: 'https://github.com/frankmax-com/aegl',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Quickstart', to: '/docs/getting-started/quickstart' },
            { label: 'API Reference', to: '/docs/api-reference/overview' },
            { label: 'TypeScript SDK', to: '/docs/sdks/typescript/installation' },
            { label: 'Python SDK', to: '/docs/sdks/python/installation' },
          ],
        },
        {
          title: 'Architecture',
          items: [
            { label: 'System Overview', to: '/docs/architecture/overview' },
            { label: 'Policy Engine', to: '/docs/architecture/policy-engine' },
            { label: 'Data Flows', to: '/docs/data-flows/system-context' },
            { label: 'Security Model', to: '/docs/architecture/security' },
          ],
        },
        {
          title: 'Governance',
          items: [
            { label: 'Project Charter', to: '/docs/project-charter/mission-and-vision' },
            { label: 'Business Processes', to: '/docs/business-processes/catalog' },
            { label: 'SOPs', to: '/docs/sops/' },
            { label: 'Feature Catalog', to: '/docs/features/catalog' },
          ],
        },
        {
          title: 'Operations',
          items: [
            { label: 'Deployment', to: '/docs/operations/deployment' },
            { label: 'Monitoring', to: '/docs/operations/monitoring' },
            { label: 'Troubleshooting', to: '/docs/troubleshooting/common-issues' },
            { label: 'Glossary', to: '/docs/glossary' },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} E-AEGL. Enterprise AI Decision Control Infrastructure.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'yaml', 'json', 'docker'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
