import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
}

function ApiEndpoint({method, path}: ApiEndpointProps) {
  const className = `endpoint-badge endpoint-badge--${method.toLowerCase()}`;
  return (
    <div style={{display: 'flex', alignItems: 'center', margin: '0.5rem 0'}}>
      <span className={className}>{method}</span>
      <code style={{fontSize: '0.95em'}}>{path}</code>
    </div>
  );
}

interface DecisionOutcomeProps {
  outcome: 'PERMITTED' | 'DENIED' | 'ESCALATED';
}

function DecisionOutcome({outcome}: DecisionOutcomeProps) {
  const classMap: Record<string, string> = {
    PERMITTED: 'badge--permitted',
    DENIED: 'badge--denied',
    ESCALATED: 'badge--escalated',
  };
  return <span className={classMap[outcome] || 'badge--denied'}>{outcome}</span>;
}

interface BreakdownItem {
  label: string;
  ms: number;
}

interface LatencyBudgetProps {
  total: string;
  breakdown: BreakdownItem[];
}

function LatencyBudget({total, breakdown}: LatencyBudgetProps) {
  const totalMs = parseFloat(total);
  const colors = ['#1a56db', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

  return (
    <div style={{margin: '1rem 0'}}>
      <strong>Latency Budget: {total}</strong>
      <div
        style={{
          display: 'flex',
          height: '24px',
          borderRadius: '4px',
          overflow: 'hidden',
          margin: '0.5rem 0',
        }}
      >
        {breakdown.map((item, i) => (
          <div
            key={item.label}
            style={{
              width: `${(item.ms / totalMs) * 100}%`,
              backgroundColor: colors[i % colors.length],
              minWidth: '2px',
            }}
            title={`${item.label}: ${item.ms}ms`}
          />
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Time</th>
            <th>% of Budget</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((item, i) => (
            <tr key={item.label}>
              <td>
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    backgroundColor: colors[i % colors.length],
                    borderRadius: '2px',
                    marginRight: '6px',
                    verticalAlign: 'middle',
                  }}
                />
                {item.label}
              </td>
              <td>{item.ms}ms</td>
              <td>{((item.ms / totalMs) * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PolicyRuleProps {
  operator: string;
  field: string;
  value: string;
  action: 'PERMIT' | 'DENY' | 'ESCALATE';
}

function PolicyRule({operator, field, value, action}: PolicyRuleProps) {
  const operatorMap: Record<string, string> = {
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    eq: '==',
    neq: '!=',
    in: 'in',
    contains: 'contains',
  };
  const actionColors: Record<string, string> = {
    PERMIT: '#059669',
    DENY: '#dc2626',
    ESCALATE: '#d97706',
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '6px',
        border: '1px solid var(--ifm-color-emphasis-300)',
        fontFamily: 'monospace',
        fontSize: '0.9em',
        margin: '2px 0',
      }}
    >
      <span style={{color: 'var(--ifm-color-primary)'}}>{field}</span>
      <span style={{fontWeight: 700}}>{operatorMap[operator] || operator}</span>
      <span style={{color: '#7c3aed'}}>{value}</span>
      <span style={{margin: '0 4px'}}>→</span>
      <span
        style={{
          backgroundColor: actionColors[action] || '#6b7280',
          color: 'white',
          padding: '1px 6px',
          borderRadius: '3px',
          fontWeight: 600,
        }}
      >
        {action}
      </span>
    </div>
  );
}

export default {
  ...MDXComponents,
  ApiEndpoint,
  DecisionOutcome,
  LatencyBudget,
  PolicyRule,
};
