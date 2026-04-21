/**
 * Framework Data — Single source of truth for Scaling AI Framework content.
 * Used by both the HTML renderer (renderFramework) and the PDF export.
 * AF-05: Externalized from scaling-ai-framework HTML and JS.
 */

const FrameworkData = (() => {
  'use strict';

  /** Focus area items */
  const FOCUS_ITEMS = [
    { label: 'Use Case',      trend: 'up' },
    { label: 'Adoption',      trend: 'up' },
    { label: 'Value',         trend: 'up' },
    { label: 'Platform Cost', trend: 'down' },
  ];

  /** Action groups — team + bullet items */
  const ACTION_GROUPS = [
    {
      team: 'AI Function Core Team',
      items: ['Measure use case values', 'Use case portfolio'],
    },
    {
      team: 'AI Service Line Team',
      items: ['Implementation', 'Testing, Pilot, Apply, Scale'],
    },
    {
      team: 'Employees',
      items: ['Skill training', 'Quality feedback', 'Adoption rate'],
    },
  ];

  /** Support section */
  const SUPPORT = {
    teams: 'AI Innovation, KDC, L&D, QRM, NITSO',
    tools: 'AI management template package Functional AI Platform, Copilot, alQChat, Workbench',
  };

  /** Key questions */
  const QUESTIONS = [
    'Who are best for "AI-enabled workflow" program?',
    'Your top 03 areas can free up human capacity?',
    'How to speed up AI use case enablement?',
    'How to avoid AI is just "optional"?',
    'How use cases can be 100% adopted daily?',
  ];

  return { FOCUS_ITEMS, ACTION_GROUPS, SUPPORT, QUESTIONS };
})();
