/**
 * Demo context configuration.
 * Centralizes all hardcoded demo/persona values used across the app.
 * Replace with real auth/session data when moving beyond MVP.
 */

export const DEMO_CONTEXT = {
  user: {
    name: 'Sarah Reynolds',
    role: 'Partner, AI & Digital',
    email: 'sarah.reynolds@kpmg.com',
    office: 'London',
    initials: 'SR',
  },
  firm: {
    name: 'KPMG',
    product: 'AI Intelligence Hub',
    reportingPeriod: 'Q2 2026',
  },
  defaults: {
    reportTitle: 'KPMG AI Portfolio Review — Q2 2026',
    defaultScenarioId: 'scen-002',
    defaultSelectedCaseIds: ['case-001', 'case-002', 'case-005'],
  },
} as const;
