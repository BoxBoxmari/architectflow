/**
 * Framework Data — Single source of truth for Scaling AI Framework content.
 * Used by both the HTML renderer (renderFramework) and the PDF export.
 * AF-05: Externalized from scaling-ai-framework HTML and JS.
 */

const FrameworkData = (() => {
  'use strict';

  const FOCUS_ITEMS = [
    { label: 'Prioritised use cases', trend: 'up' },
    { label: 'Sustained adoption', trend: 'up' },
    { label: 'Realised business value', trend: 'up' },
    { label: 'Controlled platform cost', trend: 'down' },
  ];

  const ACTION_GROUPS = [
    {
      team: 'Central AI team',
      items: [
        'Define and track value by use case',
        'Maintain the enterprise use-case portfolio',
      ],
    },
    {
      team: 'Service line leadership',
      items: [
        'Lead implementation by service line',
        'Pilot, validate, standardise, then scale',
      ],
    },
    {
      team: 'Practitioner community',
      items: [
        'Build practitioner capability',
        'Capture quality and adoption feedback',
        'Track and improve adoption rates',
      ],
    },
  ];

  const SUPPORT = {
    teams: 'AI Innovation, KDC, L&D, QRM, NITSO',
    tools: 'AI management template package, Functional AI Platform, Copilot, aiQChat, Workbench',
  };

  const QUESTIONS = [
    'Which workflows should be prioritised first for scaled AI enablement?',
    'Where can AI release the most professional capacity within the next 12 months?',
    'What must be standardised to move from pilots to repeatable deployment?',
    'How will leaders make AI part of the default way of working, not an optional add-on?',
    'What evidence will confirm sustained adoption and realised value?',
  ];

  return { FOCUS_ITEMS, ACTION_GROUPS, SUPPORT, QUESTIONS };
})();
