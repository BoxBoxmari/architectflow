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
  { id: 'aud-data',  functionId: 'fn-audit',      name: 'Audit Data & Analytics' },
  { id: 'fin-audit', functionId: 'fn-audit',      name: 'Financial Statement Audit' },
  { id: 'acct-adv',  functionId: 'fn-audit',      name: 'Accounting Advisory' },
  { id: 'corp-comp', functionId: 'fn-law',        name: 'Corporate Regulatory Compliance' },
  { id: 'contracts', functionId: 'fn-law',        name: 'Commercial Contracts & Dispute' },
  { id: 'tax-adv',   functionId: 'fn-tax',        name: 'Tax Advisory & Dispute Resolution' },
  { id: 'tp',        functionId: 'fn-tax',        name: 'Global Transfer Pricing' },
  { id: 'trans-svc', functionId: 'fn-deal',       name: 'Transaction Services' },
  { id: 'ma-adv',    functionId: 'fn-deal',       name: 'M&A Advisory' },
  { id: 'fs-reg',    functionId: 'fn-consulting', name: 'FS Regulatory / GRC' },
  { id: 'risk',      functionId: 'fn-consulting', name: 'Risk Consulting / Forensics' },
  { id: 'people',    functionId: 'fn-consulting', name: 'People & Change / FS Transform' },
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

// ─── AI Cases (source of truth: mindmap-v2.html) ──────────────────────────────
export const AI_CASES: AICase[] = [
  {
    id: 'TAX-001',
    code: 'TAX-001',
    title: 'HS Code Classifier',
    source: 'Global Trade & Customs',
    originatingFunction: 'fn-tax',
    description: 'RAG + LLM Re-ranking pipeline that classifies product descriptions against HS code taxonomy, reducing manual lookup time and error rates significantly.',
    aiTechnique: 'RAG + LLM Re-ranking',
    tech: 'RAG + LLM Re-ranking',
    maturityLevel: 'Established',
    status: 'Active',
    valueScore: 87,
    readinessScore: 92,
    reusabilityScore: 78,
    linkedFunctions: ['fn-audit', 'fn-law', 'fn-deal', 'fn-consulting'],
    linkedServices: ['aud-data', 'corp-comp', 'trans-svc', 'fs-reg'],
    metrics: [
      '3h → 25 min per query',
      'Error rate −60%',
      'Junior staff independent',
    ],
    numericMetrics: {
      annualizedReturn: 1240000,
      hoursRecoveredPerMonth: 860,
      ftesFreed: 5.1,
      adoptionRate: 74,
    },
    insight: 'TAX-001 is a Regulation-to-Answer Engine. Any function classifying situations against a legal framework can reuse the RAG architecture. Only the corpus changes.',
    partnerInsight: 'TAX-001 is a Regulation-to-Answer Engine. Any function classifying situations against a legal framework can reuse the RAG architecture. Only the corpus changes.',
    governanceNotes: 'Reviewed by Tax Technology Council Q1 2026. Data residency compliant. Audit trail enabled. Model refresh cycle: quarterly.',
    problemStatement: 'Tax professionals spend 3 hours per query manually classifying trade goods against 5,000+ HS codes. Error rates average 12%, triggering customs disputes.',
    executiveSummary: 'TAX-001 deploys a RAG + LLM Re-ranking pipeline against KPMG\'s global trade taxonomy to classify product descriptions in under 25 minutes with a 60% reduction in error rate.',
    architectureLineage: 'Regulation-to-Answer Engine pattern. RAG corpus is the only variable — the pipeline is reusable across any function classifying against a legal framework.',
  },
  {
    id: 'TAX-002',
    code: 'TAX-002',
    title: 'Tax Research Assistant',
    source: 'Tax Advisory',
    originatingFunction: 'fn-tax',
    description: 'RAG-based GenAI drafting assistant that retrieves and synthesises tax legislation, case law, and internal guidance notes to accelerate advisor research workflows.',
    aiTechnique: 'RAG-based GenAI Drafting',
    tech: 'RAG-based GenAI Drafting',
    maturityLevel: 'Mature',
    status: 'Scaled',
    valueScore: 94,
    readinessScore: 96,
    reusabilityScore: 91,
    linkedFunctions: ['fn-audit', 'fn-law', 'fn-deal', 'fn-consulting'],
    linkedServices: ['acct-adv', 'contracts', 'trans-svc', 'risk'],
    metrics: [
      '12 min saved / query',
      '244 active users',
      '~5 FTE capacity released',
    ],
    numericMetrics: {
      annualizedReturn: 3180000,
      hoursRecoveredPerMonth: 2140,
      ftesFreed: 12.7,
      adoptionRate: 89,
    },
    insight: 'Not a Tax tool — a Knowledge-to-Draft Operating Model. Every function doing research-heavy advisory with standardized output can adapt this immediately.',
    partnerInsight: 'Not a Tax tool — a Knowledge-to-Draft Operating Model. Every function doing research-heavy advisory with standardized output can adapt this immediately.',
    governanceNotes: 'GDPR and client confidentiality controls enforced at retrieval layer. No client data enters the model context. Reviewed by KPMG Legal & Risk Q4 2025.',
    problemStatement: 'Research tasks consume 35–40% of junior advisor time. Inconsistent quality across offices creates reputational risk when advice conflicts with recent legislative changes.',
    executiveSummary: 'TAX-002 indexes legislative documents across jurisdictions and returns cited, structured responses. 244 active users with ~5 FTE capacity released.',
    architectureLineage: 'Knowledge-to-Draft Operating Model. Shares vector store infrastructure with LAW-001. Candidate for platform-level promotion.',
  },
  {
    id: 'AUD-001',
    code: 'AUD-001',
    title: 'Audit Evidence Summarizer',
    source: 'External Audit',
    originatingFunction: 'fn-audit',
    description: 'Document parsing + LLM + anomaly flagging pipeline that ingests audit evidence packages and produces draft workpaper summaries with flagged exceptions.',
    aiTechnique: 'Doc Parsing + LLM + Anomaly Flag',
    tech: 'Doc Parsing + LLM + Anomaly Flag',
    maturityLevel: 'Emerging',
    status: 'Pilot',
    valueScore: 76,
    readinessScore: 68,
    reusabilityScore: 65,
    linkedFunctions: ['fn-deal', 'fn-law', 'fn-tax', 'fn-consulting'],
    linkedServices: ['trans-svc', 'contracts', 'tp', 'risk'],
    metrics: [
      'Evidence review −40%',
      'Anomaly detection automated',
      '100s docs / engagement',
    ],
    numericMetrics: {
      annualizedReturn: 890000,
      hoursRecoveredPerMonth: 590,
      ftesFreed: 3.5,
      adoptionRate: 41,
    },
    insight: 'A Document Intelligence Engine. Batch documents in → key facts extracted, risks flagged, structured summary out. Document type changes; pipeline does not.',
    partnerInsight: 'A Document Intelligence Engine. Batch documents in → key facts extracted, risks flagged, structured summary out. Document type changes; pipeline does not.',
    governanceNotes: 'Pilot governance framework in place. Output requires senior reviewer sign-off before inclusion in audit file. Model hallucination rate < 1.2% on validation set.',
    problemStatement: 'Audit workpaper preparation is the single largest time sink in the audit cycle. Senior staff spend disproportionate time reformatting evidence rather than applying judgment.',
    executiveSummary: 'AUD-001 automates first-draft workpaper creation from evidence packages. Evidence review reduced by 40%, anomaly detection automated, processing 100s of docs per engagement.',
    architectureLineage: 'Document Intelligence Engine pattern. Batch documents in → key facts extracted, risks flagged, structured summary out. Pipeline reusable across document types.',
  },
  {
    id: 'CON-001',
    code: 'CON-001',
    title: 'Meeting-to-Action Converter',
    source: 'Strategy Consulting',
    originatingFunction: 'fn-consulting',
    description: 'LLM extraction + template generation pipeline that transcribes, summarises, and extracts structured action items from client meeting recordings.',
    aiTechnique: 'LLM Extraction + Template Gen',
    tech: 'LLM Extraction + Template Gen',
    maturityLevel: 'Established',
    status: 'Active',
    valueScore: 72,
    readinessScore: 85,
    reusabilityScore: 88,
    linkedFunctions: ['fn-audit', 'fn-law', 'fn-tax', 'fn-deal', 'fn-consulting'],
    linkedServices: ['fin-audit', 'contracts', 'tax-adv', 'ma-adv', 'people'],
    metrics: [
      '45 min → 5 min post-meeting',
      'Consistent output firm-wide',
      'Auto-draft follow-up',
    ],
    numericMetrics: {
      annualizedReturn: 760000,
      hoursRecoveredPerMonth: 510,
      ftesFreed: 3.0,
      adoptionRate: 62,
    },
    insight: 'Every Partner spent 45 min in a meeting, then 45 more writing it up. CON-001 eliminates the second 45 minutes firm-wide — zero modification needed.',
    partnerInsight: 'Every Partner spent 45 min in a meeting, then 45 more writing it up. CON-001 eliminates the second 45 minutes firm-wide — zero modification needed.',
    governanceNotes: 'Recording consent and data handling policy enforced. Transcripts stored for 90 days then purged. Reviewed by Data Privacy team Q2 2025.',
    problemStatement: 'Consultants spend an average of 45 minutes after each client meeting writing notes and distributing action items. Accuracy of recall degrades significantly after 24 hours.',
    executiveSummary: 'CON-001 reduces post-meeting administration from 45 minutes to 5 minutes firm-wide. Consistent output and auto-drafted follow-ups deployed across all functions.',
    architectureLineage: 'LLM Extraction + Template Gen pattern. Zero modification needed for firm-wide deployment. Integrates with M365 ecosystem.',
  },
  {
    id: 'LAW-001',
    code: 'LAW-001',
    title: 'Contract Intelligence Review',
    source: 'KPMG Law',
    originatingFunction: 'fn-law',
    description: 'LLM clause extraction + risk classification tool that identifies non-standard clauses, risk flags, and missing provisions across commercial and regulatory contract portfolios.',
    aiTechnique: 'LLM Clause Extraction + Risk Class',
    tech: 'LLM Clause Extraction + Risk Class',
    maturityLevel: 'Established',
    status: 'Active',
    valueScore: 83,
    readinessScore: 79,
    reusabilityScore: 74,
    linkedFunctions: ['fn-deal', 'fn-audit', 'fn-tax', 'fn-consulting'],
    linkedServices: ['ma-adv', 'fin-audit', 'tp', 'fs-reg'],
    metrics: [
      '2h → 20 min per contract',
      'Risk clauses auto-flagged',
      'Obligation calendar auto',
    ],
    numericMetrics: {
      annualizedReturn: 1560000,
      hoursRecoveredPerMonth: 1040,
      ftesFreed: 6.2,
      adoptionRate: 67,
    },
    insight: 'A Structured Document Risk Engine. Any service working with agreements where clauses carry risk or obligation can adapt this. Contracts exist in every function.',
    partnerInsight: 'A Structured Document Risk Engine. Any service working with agreements where clauses carry risk or obligation can adapt this. Contracts exist in every function.',
    governanceNotes: 'Privileged document handling protocols enforced. Output is advisory only — does not constitute legal advice. Reviewed by KPMG Law Risk Committee Q1 2026.',
    problemStatement: 'Legal review of a standard commercial contract takes 2 hours. In M&A contexts, hundreds of contracts require review under time pressure, creating quality risk.',
    executiveSummary: 'LAW-001 reduces contract review from 2 hours to 20 minutes. Risk clauses are auto-flagged and obligation calendars are generated automatically.',
    architectureLineage: 'Structured Document Risk Engine. Shares entity resolution with TAX-001. Risk taxonomy maintained by KPMG Law Knowledge Management.',
  },
  {
    id: 'DEAL-001',
    code: 'DEAL-001',
    title: 'DD Document Scanner',
    source: 'Deal Advisory',
    originatingFunction: 'fn-deal',
    description: 'Multi-document parsing + risk scoring pipeline that ingests due diligence data rooms, categorises documents by type and materiality, and surfaces high-priority items.',
    aiTechnique: 'Multi-doc Parsing + Risk Scoring',
    tech: 'Multi-doc Parsing + Risk Scoring',
    maturityLevel: 'Experimental',
    status: 'In Development',
    valueScore: 68,
    readinessScore: 52,
    reusabilityScore: 71,
    linkedFunctions: ['fn-audit', 'fn-tax', 'fn-consulting', 'fn-law'],
    linkedServices: ['aud-data', 'tax-adv', 'people', 'contracts'],
    metrics: [
      '5 days → 1 day initial scan',
      'Red flags surfaced auto',
      '300+ doc types',
    ],
    numericMetrics: {
      annualizedReturn: 620000,
      hoursRecoveredPerMonth: 410,
      ftesFreed: 2.4,
      adoptionRate: 28,
    },
    insight: 'One engine, five functions: Audit uses it for evidence, Tax for compliance docs, Legal for contracts, Consulting for vendor files. This is what AI Foundation looks like.',
    partnerInsight: 'One engine, five functions: Audit uses it for evidence, Tax for compliance docs, Legal for contracts, Consulting for vendor files. This is what AI Foundation looks like.',
    governanceNotes: 'In development. No production deployment. Data room access governed by engagement-level NDA. Model training uses synthetic data only at this stage.',
    problemStatement: 'Due diligence teams manually triage thousands of documents per transaction. Critical items are missed when analyst fatigue sets in during high-volume deals.',
    executiveSummary: 'DEAL-001 reduces initial due diligence scan from 5 days to 1 day. Red flags are surfaced automatically across 300+ document types.',
    architectureLineage: 'Multi-doc Parsing + Risk Scoring pattern. One engine, five functions. Document processing module shared with AUD-001.',
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