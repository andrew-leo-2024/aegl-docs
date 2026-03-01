import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  gettingStartedSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/quickstart',
        'getting-started/installation',
        'getting-started/concepts',
        'getting-started/first-decision',
      ],
    },
    {
      type: 'category',
      label: 'User Manual',
      items: [
        'user-manual/dashboard',
        'user-manual/policy-management',
        'user-manual/escalation-workflow',
        'user-manual/audit-logs',
        'user-manual/agent-management',
        'user-manual/model-registry',
        'user-manual/webhooks',
        'user-manual/team-settings',
        'user-manual/billing',
      ],
    },
  ],

  apiReferenceSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api-reference/overview',
        'api-reference/authentication',
        'api-reference/decisions',
        'api-reference/policies',
        'api-reference/agents',
        'api-reference/models',
        'api-reference/escalations',
        'api-reference/audit',
        'api-reference/webhooks',
        'api-reference/organization',
        'api-reference/compliance',
        'api-reference/billing',
        'api-reference/errors',
      ],
    },
  ],

  sdkSidebar: [
    {
      type: 'category',
      label: 'TypeScript SDK',
      collapsed: false,
      items: [
        'sdks/typescript/installation',
        'sdks/typescript/client',
        'sdks/typescript/decide',
        'sdks/typescript/policy-cache',
        'sdks/typescript/openai-integration',
        'sdks/typescript/langchain-integration',
      ],
    },
    {
      type: 'category',
      label: 'Python SDK',
      items: [
        'sdks/python/installation',
        'sdks/python/client',
        'sdks/python/decide',
        'sdks/python/policy-cache',
        'sdks/python/crewai-integration',
        'sdks/python/langchain-integration',
      ],
    },
    {
      type: 'category',
      label: 'CLI',
      items: [
        'sdks/cli/installation',
        'sdks/cli/commands',
        'sdks/cli/policy-as-code',
      ],
    },
  ],

  architectureSidebar: [
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: [
        'architecture/overview',
        'architecture/four-layer-pipeline',
        'architecture/policy-engine',
        'architecture/action-gate',
        'architecture/audit-system',
        'architecture/security',
        'architecture/multi-tenancy',
        'architecture/data-model',
      ],
    },
    {
      type: 'category',
      label: 'Business Processes (Legacy)',
      items: [
        'architecture/business-processes/decision-flow',
        'architecture/business-processes/escalation-flow',
        'architecture/business-processes/policy-lifecycle',
        'architecture/business-processes/audit-verification',
      ],
    },
    {
      type: 'category',
      label: 'Data Flows',
      items: [
        'data-flows/system-context',
      ],
    },
  ],

  projectCharterSidebar: [
    {
      type: 'category',
      label: 'Project Charter',
      collapsed: false,
      items: [
        'project-charter/mission-and-vision',
        'project-charter/enterprise-mandate',
        'project-charter/objectives-and-kpis',
        'project-charter/stakeholder-map',
        'project-charter/product-roadmap',
      ],
    },
  ],

  businessProcessesSidebar: [
    {
      type: 'category',
      label: 'BPMN Process Catalog',
      collapsed: false,
      items: [
        'business-processes/catalog',
        'business-processes/bpmn-decision-pipeline',
        'business-processes/bpmn-escalation-lifecycle',
        'business-processes/bpmn-policy-lifecycle',
        'business-processes/bpmn-audit-verification',
        'business-processes/bpmn-authentication',
        'business-processes/bpmn-webhook-dispatch',
        'business-processes/bpmn-sla-timeout',
        'business-processes/bpmn-onboarding',
        'business-processes/bpmn-compliance-reporting',
        'business-processes/bpmn-billing-metering',
        'business-processes/bpmn-backup-restore',
      ],
    },
  ],

  sopSidebar: [
    {
      type: 'category',
      label: 'Standard Operating Procedures',
      collapsed: false,
      items: [
        'sops/index',
        'sops/sop-001-incident-response',
        'sops/sop-002-secrets-rotation',
        'sops/sop-003-database-backup',
        'sops/sop-004-deployment',
        'sops/sop-005-audit-chain-repair',
        'sops/sop-006-tenant-onboarding',
        'sops/sop-007-escalation-sla-breach',
        'sops/sop-008-capacity-planning',
        'sops/sop-009-compliance-audit',
      ],
    },
  ],

  featuresSidebar: [
    {
      type: 'category',
      label: 'Feature Catalog',
      collapsed: false,
      items: [
        'features/catalog',
      ],
    },
  ],

  operationsSidebar: [
    {
      type: 'category',
      label: 'Operations',
      collapsed: false,
      items: [
        'operations/deployment',
        'operations/self-hosted',
        'operations/monitoring',
        'operations/disaster-recovery',
        'operations/compliance',
        'operations/testing',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
      ],
    },
  ],

  referenceSidebar: [
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'glossary',
        'agent-recovery/context-recovery',
      ],
    },
  ],
};

export default sidebars;
