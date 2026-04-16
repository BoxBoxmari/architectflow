import { calcOutputs, type SimInputs } from '@/lib/simulator/calcOutputs';

// ─── Functions ────────────────────────────────────────────────────────────────
export const FUNCTIONS = [
  { id: 'fn-audit',      name: 'Audit',         color: '#006397' },
  { id: 'fn-law',        name: 'KPMG Law',       color: '#45004F' },
  { id: 'fn-tax',        name: 'Tax',            color: '#00B8A9' },
  { id: 'fn-deal',       name: 'Deal Advisory',  color: '#F39C12' },
  { id: 'fn-consulting', name: 'Consulting',     color: '#0F6E56' },
];

// ─── Services ─────────────────────────────────────────────────────────────────
export const SERVICES = [
  // Audit
  { id: 'fin-audit',   functionId: 'fn-audit',      name: 'Financial Statement Audit' },
  { id: 'aud-data',    functionId: 'fn-audit',      name: 'Audit Data & Analytics' },
  { id: 'acct-adv',    functionId: 'fn-audit',      name: 'Accounting Advisory' },
  { id: 'risk-cons',   functionId: 'fn-audit',      name: 'Risk Consulting / Forensics' },
  // KPMG Law
  { id: 'corp-comp',   functionId: 'fn-law',        name: 'Corporate Regulatory Compliance' },
  { id: 'contracts',   functionId: 'fn-law',        name: 'Commercial Contracts & Dispute' },
  // Tax
  { id: 'tax-adv-dr',  functionId: 'fn-tax',        name: 'Tax Advisory & Dispute Resolution' },
  { id: 'tp',          functionId: 'fn-tax',        name: 'Global Transfer Pricing' },
  { id: 'gtc',         functionId: 'fn-tax',        name: 'Global Trade & Customs' },
  { id: 'gms',         functionId: 'fn-tax',        name: 'Global Mobility Services' },
  { id: 'tax-adv-svc', functionId: 'fn-tax',        name: 'Tax Advisory Services' },
  { id: 'tax-comp',    functionId: 'fn-tax',        name: 'Tax Compliance & Technology' },
  { id: 'prof-train-tax', functionId: 'fn-tax',     name: 'Professional Training' },
  // Deal Advisory
  { id: 'ma-adv',      functionId: 'fn-deal',       name: 'M&A Advisory' },
  { id: 'trans-svc',   functionId: 'fn-deal',       name: 'Transaction Services' },
  { id: 'val-mod',     functionId: 'fn-deal',       name: 'Valuation & Modelling' },
  { id: 'strat-ma',    functionId: 'fn-deal',       name: 'Strategy / M&A Advisory' },
  // Consulting
  { id: 'fs-reg',      functionId: 'fn-consulting', name: 'FS Regulatory / GRC' },
  { id: 'people',      functionId: 'fn-consulting', name: 'People & Change' },
  { id: 'fs-trans',    functionId: 'fn-consulting', name: 'FS Transform' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
export type CaseStatus = 'Concept' | 'In Development' | 'Pilot' | 'Active' | 'Scaled';
export type MaturityLevel = 'Experimental' | 'Emerging' | 'Established' | 'Mature';
export type AITechnique = 'LLM' | 'NLP' | 'ML Classification' | 'Computer Vision' | 'RAG' | 'Generative AI' | 'RAG + LLM Re-ranking' | 'RAG-based GenAI Drafting' | 'Doc Parsing + LLM + Anomaly Flag' | 'LLM Extraction + Template Gen' | 'LLM Clause Extraction + Risk Class' | 'Multi-doc Parsing + Risk Scoring';

export interface AICase {
  id: string;
  code: string;
  title: string;
  source: string;
  /** @deprecated use source */
  originatingFunction: string;
  description: string;
  aiTechnique: string;
  tech: string;
  maturityLevel: MaturityLevel;
  status: CaseStatus;
  valueScore: number;
  readinessScore: number;
  reusabilityScore: number;
  linkedFunctions: string[];
  linkedServices: string[];
  /** Exact fn→svc reach pairs for accurate graph edge drawing */
  reach: { fnId: string; svcId: string }[];
  metrics: string[];
  /** Legacy numeric metrics — kept for screens that still reference them */
  numericMetrics: {
    annualizedReturn: number;
    hoursRecoveredPerMonth: number;
    ftesFreed: number;
    adoptionRate: number;
  };
  insight: string;
  partnerInsight: string;
  governanceNotes: string;
  problemStatement: string;
  executiveSummary: string;
  architectureLineage: string;
}

// ─── AI Cases (real portfolio data) ──────────────────────────────────────────
export const AI_CASES: AICase[] = [
  {
    id: 'TAX-001',
    code: 'TAX-001',
    title: 'Vietnam Tax Chatbot',
    source: 'Tax',
    originatingFunction: 'fn-tax',
    description: 'RAG + LLM Knowledge Agent that answers Vietnam tax queries across advisory, transfer pricing, customs, mobility, and related legal and audit domains.',
    aiTechnique: 'RAG + LLM (Knowledge Agent)',
    tech: 'RAG + LLM (Knowledge Agent)',
    maturityLevel: 'Mature',
    status: 'Scaled',
    valueScore: 90,
    readinessScore: 92,
    reusabilityScore: 85,
    linkedFunctions: ['fn-tax', 'fn-law', 'fn-audit', 'fn-deal'],
    linkedServices: ['tax-adv-dr', 'tp', 'gtc', 'gms', 'corp-comp', 'contracts', 'acct-adv', 'ma-adv'],
    reach: [
      { fnId: 'fn-tax',  svcId: 'tax-adv-dr' },
      { fnId: 'fn-tax',  svcId: 'tp' },
      { fnId: 'fn-tax',  svcId: 'gtc' },
      { fnId: 'fn-tax',  svcId: 'gms' },
      { fnId: 'fn-law',  svcId: 'corp-comp' },
      { fnId: 'fn-law',  svcId: 'contracts' },
      { fnId: 'fn-audit', svcId: 'acct-adv' },
      { fnId: 'fn-deal', svcId: 'ma-adv' },
    ],
    metrics: [
      '~5 FTE capacity released',
      'Covers Tax, Law, Audit, Deal Advisory',
      'Knowledge Agent architecture — reusable corpus',
    ],
    numericMetrics: {
      annualizedReturn: 800000,
      hoursRecoveredPerMonth: 600,
      ftesFreed: 5,
      adoptionRate: 80,
    },
    insight: 'TAX-001 is a Regulation-to-Answer Engine. Any function classifying situations against a legal framework can reuse the RAG architecture. Only the corpus changes.',
    partnerInsight: 'TAX-001 is a Regulation-to-Answer Engine. Any function classifying situations against a legal framework can reuse the RAG architecture. Only the corpus changes.',
    governanceNotes: 'Reviewed by Tax Technology Council. Data residency compliant. Audit trail enabled. Model refresh cycle: quarterly.',
    problemStatement: 'Tax professionals spend significant time manually researching Vietnam tax regulations across multiple domains. Inconsistent answers create compliance risk.',
    executiveSummary: 'TAX-001 deploys a RAG + LLM Knowledge Agent to answer Vietnam tax queries across Tax, Law, Audit, and Deal Advisory — releasing ~5 FTE of capacity.',
    architectureLineage: 'Regulation-to-Answer Engine pattern. RAG corpus is the only variable — the pipeline is reusable across any function classifying against a legal framework.',
  },
  {
    id: 'KDC-001',
    code: 'KDC-001',
    title: 'Advanced Translation with Layout Preservation',
    source: 'KDC / Firmwide',
    originatingFunction: 'fn-audit',
    description: 'LLM-powered document translation that preserves original layout, formatting, and structure across Audit, Law, Tax, Deal Advisory, and Consulting.',
    aiTechnique: 'LLM + Document Translation + Layout Preservation',
    tech: 'LLM + Document Translation + Layout Preservation',
    maturityLevel: 'Mature',
    status: 'Scaled',
    valueScore: 85,
    readinessScore: 88,
    reusabilityScore: 92,
    linkedFunctions: ['fn-audit', 'fn-law', 'fn-tax', 'fn-deal', 'fn-consulting'],
    linkedServices: ['fin-audit', 'aud-data', 'corp-comp', 'tax-adv-svc', 'ma-adv', 'people', 'fs-trans'],
    reach: [
      { fnId: 'fn-audit',      svcId: 'fin-audit' },
      { fnId: 'fn-audit',      svcId: 'aud-data' },
      { fnId: 'fn-law',        svcId: 'corp-comp' },
      { fnId: 'fn-tax',        svcId: 'tax-adv-svc' },
      { fnId: 'fn-deal',       svcId: 'ma-adv' },
      { fnId: 'fn-consulting', svcId: 'people' },
      { fnId: 'fn-consulting', svcId: 'fs-trans' },
    ],
    metrics: [
      'Cost and cycle time reduction',
      'Layout preserved across document types',
      'Firmwide deployment — all functions',
    ],
    numericMetrics: {
      annualizedReturn: 600000,
      hoursRecoveredPerMonth: 400,
      ftesFreed: 3,
      adoptionRate: 75,
    },
    insight: 'Not just translation — a Document Fidelity Engine. Any function handling multilingual documents with complex formatting can deploy this immediately.',
    partnerInsight: 'Not just translation — a Document Fidelity Engine. Any function handling multilingual documents with complex formatting can deploy this immediately.',
    governanceNotes: 'Firmwide deployment. No client data leaves the secure environment. Layout preservation validated across 50+ document templates.',
    problemStatement: 'Manual translation of complex financial and legal documents loses formatting, creating rework and compliance risk across all functions.',
    executiveSummary: 'KDC-001 translates documents while preserving layout and structure, deployed firmwide across Audit, Law, Tax, Deal Advisory, and Consulting.',
    architectureLineage: 'Document Fidelity Engine pattern. LLM translation layer with layout-aware post-processing. Reusable across all document-heavy functions.',
  },
  {
    id: 'KDC-002',
    code: 'KDC-002',
    title: 'Financial Statement Extractor',
    source: 'KDC',
    originatingFunction: 'fn-audit',
    description: 'Document extraction and semi-structured parsing pipeline that extracts financial data from statements for Audit, Deal Advisory, Consulting, and Tax.',
    aiTechnique: 'Document Extraction + Semi-structured Parsing',
    tech: 'Document Extraction + Semi-structured Parsing',
    maturityLevel: 'Established',
    status: 'Active',
    valueScore: 82,
    readinessScore: 78,
    reusabilityScore: 80,
    linkedFunctions: ['fn-audit', 'fn-deal', 'fn-consulting', 'fn-tax'],
    linkedServices: ['fin-audit', 'aud-data', 'trans-svc', 'val-mod', 'fs-reg', 'tax-comp'],
    reach: [
      { fnId: 'fn-audit',      svcId: 'fin-audit' },
      { fnId: 'fn-audit',      svcId: 'aud-data' },
      { fnId: 'fn-deal',       svcId: 'trans-svc' },
      { fnId: 'fn-deal',       svcId: 'val-mod' },
      { fnId: 'fn-consulting', svcId: 'fs-reg' },
      { fnId: 'fn-tax',        svcId: 'tax-comp' },
    ],
    metrics: [
      'Accuracy and efficiency improvement',
      'Semi-structured parsing across statement formats',
      'Covers Audit, Deal Advisory, Consulting, Tax',
    ],
    numericMetrics: {
      annualizedReturn: 500000,
      hoursRecoveredPerMonth: 350,
      ftesFreed: 2.5,
      adoptionRate: 65,
    },
    insight: 'A Financial Data Intelligence Engine. Any function that needs structured data from unstructured financial documents can reuse this extraction pipeline.',
    partnerInsight: 'A Financial Data Intelligence Engine. Any function that needs structured data from unstructured financial documents can reuse this extraction pipeline.',
    governanceNotes: 'Extraction accuracy validated against manual benchmarks. Output reviewed before downstream use. No PII stored beyond engagement lifecycle.',
    problemStatement: 'Financial statement data extraction is manual, error-prone, and time-consuming across Audit, Deal Advisory, and Tax workflows.',
    executiveSummary: 'KDC-002 extracts structured financial data from statements using document parsing and semi-structured analysis, improving accuracy and efficiency across four functions.',
    architectureLineage: 'Document Extraction + Semi-structured Parsing pattern. Shared extraction layer reusable across financial document types.',
  },
  {
    id: 'CONS-001',
    code: 'CONS-001',
    title: 'AI Coaching & Case Simulation',
    source: 'Consulting',
    originatingFunction: 'fn-consulting',
    description: 'LLM simulation and scenario reasoning engine that provides AI coaching and case simulation for capability building across Consulting, Audit, Tax, Law, and Deal Advisory.',
    aiTechnique: 'LLM Simulation + Scenario Reasoning',
    tech: 'LLM Simulation + Scenario Reasoning',
    maturityLevel: 'Emerging',
    status: 'Pilot',
    valueScore: 75,
    readinessScore: 65,
    reusabilityScore: 78,
    linkedFunctions: ['fn-consulting', 'fn-audit', 'fn-tax', 'fn-law', 'fn-deal'],
    linkedServices: ['people', 'fs-trans', 'risk-cons', 'prof-train-tax', 'strat-ma'],
    reach: [
      { fnId: 'fn-consulting', svcId: 'people' },
      { fnId: 'fn-consulting', svcId: 'fs-trans' },
      { fnId: 'fn-audit',      svcId: 'risk-cons' },
      { fnId: 'fn-tax',        svcId: 'prof-train-tax' },
      { fnId: 'fn-law',        svcId: 'prof-train-tax' },
      { fnId: 'fn-deal',       svcId: 'strat-ma' },
    ],
    metrics: [
      'New revenue and capability creation',
      'Scenario-based learning across functions',
      'Covers Consulting, Audit, Tax, Law, Deal Advisory',
    ],
    numericMetrics: {
      annualizedReturn: 400000,
      hoursRecoveredPerMonth: 200,
      ftesFreed: 1.5,
      adoptionRate: 45,
    },
    insight: 'A Capability Acceleration Engine. Any function investing in professional development can deploy scenario-based AI coaching without rebuilding the simulation layer.',
    partnerInsight: 'A Capability Acceleration Engine. Any function investing in professional development can deploy scenario-based AI coaching without rebuilding the simulation layer.',
    governanceNotes: 'Pilot governance in place. Simulation outputs are for training purposes only. No client data used in scenario generation.',
    problemStatement: 'Professional training is expensive, inconsistent, and difficult to scale. Case-based learning requires senior staff time that is increasingly scarce.',
    executiveSummary: 'CONS-001 delivers AI-powered coaching and case simulation across five functions, creating new revenue and capability without rebuilding the simulation architecture.',
    architectureLineage: 'LLM Simulation + Scenario Reasoning pattern. Scenario library is the only variable — the reasoning engine is reusable across all professional training contexts.',
  },
];

// ─── Scenarios (Current State / 2X Scale-Up / Full Adoption) ─────────────────
// These align with the simulator source-of-truth defaults.
export const SCENARIOS = [
  {
    id: 'scen-current',
    name: 'Current State',
    description: 'Active use cases and users at current adoption levels based on simulator defaults.',
    useCaseCount: 15,
    activationRate: 53,
    targetUsers: 450,
    adoptionRate: 50,
    tasksPerUserPerUseCasePerMonth: 6,
    avgTimeSavedMinutes: 15,
  },
  {
    id: 'scen-2x',
    name: '2X Scale-Up',
    description: 'Double active users and use cases, capped at firm-wide limits.',
    useCaseCount: 15,
    activationRate: 53,
    targetUsers: 450,
    adoptionRate: 50,
    tasksPerUserPerUseCasePerMonth: 6,
    avgTimeSavedMinutes: 15,
  },
  {
    id: 'scen-full',
    name: 'Full Adoption',
    description: 'All targeted users and use cases fully activated at 100% adoption.',
    useCaseCount: 15,
    activationRate: 53,
    targetUsers: 450,
    adoptionRate: 50,
    tasksPerUserPerUseCasePerMonth: 6,
    avgTimeSavedMinutes: 15,
  },
];

// ─── Scenario output calculator (shim → shared calcOutputs) ──────────────────
export type ScenarioInput = typeof SCENARIOS[0];

export function calculateScenarioOutputs(scenario: ScenarioInput) {
  const inputs: SimInputs = {
    targetUseCaseCount: scenario.useCaseCount,
    activationRate: scenario.activationRate,
    targetUserCount: scenario.targetUsers,
    adoptionRate: scenario.adoptionRate,
    tasksPerUserPerUseCasePerMonth: scenario.tasksPerUserPerUseCasePerMonth,
    avgTimeSavedMinutes: scenario.avgTimeSavedMinutes,
  };
  return calcOutputs(inputs);
}
const ACTIVITY_FEED = [
  { id: 'act-1', icon: 'TrendingUp', label: 'TAX-002 Tax Research Assistant reached 244 active users', time: '2 hours ago' },
  { id: 'act-2', icon: 'Send', label: 'Pilot request submitted for CON-001 Meeting-to-Action Converter', time: '5 hours ago' },
  { id: 'act-3', icon: 'BookMarked', label: 'LAW-001 Contract Intelligence Review added to Q2 report', time: '1 day ago' },
  { id: 'act-4', icon: 'FileText', label: 'DEAL-001 DD Document Scanner moved to In Development', time: '2 days ago' },
  { id: 'act-5', icon: 'Plus', label: 'AUD-001 Audit Evidence Summarizer pilot approved', time: '3 days ago' },
];

export { ACTIVITY_FEED };